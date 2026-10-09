import { extractSkills } from '../../utils/skills.js';
import pdf from 'pdf-parse/lib/pdf-parse.js';

// Legal, polite access only: identifies itself, honours robots.txt, never bypasses CAPTCHA/anti-bot/login.
const UA = 'CareerSyncBot/1.0 (student project; respects robots.txt)';
const KEYWORDS = /(recruitment|notification|vacanc|advertisement|advt|walk-in|engagement|examination notice)/i;
const A = /<a\s[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
const strip = (h) => h.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/[ \t]+/g, ' ');
const abs = (h, base) => { try { const u = new URL(h, base); return /^https?:$/.test(u.protocol) ? u.href : null; } catch { return null; } };
const guard = (html) => { if (html.length < 6000 && /captcha|verify you are human|access denied|attention required/i.test(html)) throw new Error('Site shows an anti-bot challenge; not bypassed'); };

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000), redirect: 'follow' });
  if (r.headers.get('x-deny-reason')) throw new Error(`Blocked by this network's egress policy (${r.headers.get('x-deny-reason')})`);
  if ([401, 403, 429, 503].includes(r.status)) throw new Error(`Site refused automated access (HTTP ${r.status}); not bypassed`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer()); if (buf.length > 5e6) throw new Error('File too large');
  return { buf, type: r.headers.get('content-type') || '', modified: r.headers.get('last-modified'), url: r.url };
}
const robots = new Map();
async function allowed(url) {
  const u = new URL(url);
  if (!robots.has(u.origin)) robots.set(u.origin, fetch(`${u.origin}/robots.txt`, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000) })
    .then(async (r) => { if (!r.ok) return []; let on = false; const d = []; for (const l of (await r.text()).split(/\r?\n/)) { const [k, ...v] = l.split(':'), key = k.trim().toLowerCase(), val = v.join(':').trim(); if (key === 'user-agent') on = val === '*'; else if (on && key === 'disallow' && val) d.push(val); } return d; }).catch(() => []));
  return !(await robots.get(u.origin)).some((d) => u.pathname.startsWith(d));
}

const MON = 'jan feb mar apr may jun jul aug sep oct nov dec'.split(' ');
const D = /(\d{1,2})[./-](\d{1,2})[./-](\d{4})|(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9}),?\s+(\d{4})/;
const dateAfter = (t, re) => { const i = t.search(re); if (i < 0) return null; const m = t.slice(i, i + 140).match(D); if (!m) return null;
  const d = m[1] ? new Date(Date.UTC(+m[3], +m[2] - 1, +m[1])) : MON.includes(m[5].slice(0, 3).toLowerCase()) ? new Date(Date.UTC(+m[6], MON.indexOf(m[5].slice(0, 3).toLowerCase()), +m[4])) : null;
  return d && !isNaN(d) ? d : null; };
const grab = (t, re) => t.match(re)?.[1]?.trim().slice(0, 220) || undefined;

// Extract only what the notification actually states; anything else stays empty.
export function extractDetails(text) {
  const start = dateAfter(text, /(start(ing)? date|commencement|opening date|from which .{0,30}apply)/i), end = dateAfter(text, /(last date|closing date|last day|closes on)/i), exam = dateAfter(text, /(exam(ination)? date|written (exam|test))/i);
  return {
    vacancies: Number((text.match(/(\d[\d,]*)\s*(?:vacancies|posts)\b/i) || text.match(/vacanc(?:y|ies)[^\d\n]{0,20}(\d[\d,]*)/i) || [])[1]?.replace(/,/g, '')) || undefined,
    qualification: grab(text, /qualifications?\s*[:\-–]\s*([^\n]{10,220})/i), eligibility: grab(text, /(?:eligibility|age limit)[^\n:]{0,15}[:\-–]\s*([^\n]{5,220})/i),
    salaryText: grab(text, /(?:pay\s*(?:scale|level|matrix)|salary|remuneration|emoluments)[^\n:]{0,15}[:\-–]?\s*([^\n]{5,120})/i),
    applicationStart: start || undefined, applicationDeadline: end || undefined,
    importantDates: [['Application start', start], ['Last date to apply', end], ['Examination', exam]].filter(([, d]) => d).map(([label, date]) => ({ label, date })),
  };
}

async function detail(src, it, host) {
  let text = '', applicationUrl = null, modified = null;
  try {
    if (new URL(it.url).hostname.replace(/^www\./, '').endsWith(host) && await allowed(it.url)) {
      const d = await get(it.url); modified = d.modified;
      if (/pdf/i.test(d.type) || /\.pdf($|\?)/i.test(it.url)) text = (await pdf(d.buf)).text;
      else { const h = d.buf.toString('utf8'); guard(h); text = strip(h); for (const m of h.matchAll(A)) if (/apply|online application/i.test(strip(m[2]))) { applicationUrl = abs(m[1], d.url); break; } }
    }
  } catch { /* keep the announcement with what the listing gave us */ }
  if (!applicationUrl) { const u = text.match(/https?:\/\/[^\s)>\]"']+/g)?.find((x) => /apply|recruit|online/i.test(x)); if (u) applicationUrl = u.replace(/[.,;]+$/, ''); } // only URLs literally present in the notification
  return { title: it.title, company: src.name, location: src.state || 'India', skills: extractSkills(text), description: text.replace(/\s+/g, ' ').trim().slice(0, 1500) || it.title,
    sector: 'government', level: src.level, state: src.state, source: src.key, sourceUrl: src.url, sourceSite: new URL(src.url).origin,
    notificationUrl: it.url, applicationUrl: applicationUrl || undefined, postedDate: modified ? new Date(modified) : undefined,
    dedupeKey: `${src.key}|${it.url}`.toLowerCase(), ...extractDetails(text) };
}

export async function fetchGovSource(src) {
  if (!(await allowed(src.url))) throw new Error('Disallowed by robots.txt');
  const page = await get(src.url), html = page.buf.toString('utf8'); guard(html);
  const host = new URL(src.url).hostname.replace(/^www\./, ''), seen = new Set(), items = [];
  for (const m of html.matchAll(A)) {
    const title = strip(m[2]).replace(/\s+/g, ' ').trim(), url = abs(m[1], page.url);
    if (url && title.length > 15 && KEYWORDS.test(title) && !seen.has(url)) { seen.add(url); items.push({ title, url }); }
  }
  if (!items.length) throw new Error('No recruitment announcements found on the page');
  const jobs = []; for (const it of items.slice(0, 10)) jobs.push(await detail(src, it, host)); return jobs;
}
