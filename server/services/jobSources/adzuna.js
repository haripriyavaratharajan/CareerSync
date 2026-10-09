import { extractSkills } from '../../utils/skills.js';
// Needs ADZUNA_APP_ID / ADZUNA_APP_KEY (free at developer.adzuna.com). Adzuna covers EVERY profession, so this is the
// best source for non-IT fields. Pass { what, where } for one search, or let the sync run several queries.
export const adzunaReady = () => Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);

export async function adzunaSearch({ what = 'jobs', where = '', perPage = 20 } = {}) {
  const { ADZUNA_APP_ID: id, ADZUNA_APP_KEY: key, ADZUNA_COUNTRY: country = 'in' } = process.env;
  if (!id || !key) throw new Error('Adzuna credentials not configured');
  const u = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`);
  u.search = new URLSearchParams({ app_id: id, app_key: key, results_per_page: String(perPage), what, ...(where && { where }), 'content-type': 'application/json' });
  const r = await fetch(u, { signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`Adzuna ${r.status}`);
  return ((await r.json()).results || []).map((j) => {
    const title = (j.title || '').replace(/<[^>]+>/g, ''), desc = (j.description || '').replace(/<[^>]+>/g, ' ');
    return {
      title, company: j.company?.display_name, location: j.location?.display_name, description: desc,
      skills: extractSkills(`${title} ${desc}`), salary: j.salary_min ? { min: j.salary_min, max: j.salary_max, currency: country === 'in' ? 'INR' : undefined } : undefined,
      employmentType: j.contract_time || 'full-time', source: 'adzuna', sourceUrl: j.redirect_url, applicationUrl: j.redirect_url,
      postedDate: j.created, dedupeKey: `${title}|${j.company?.display_name}|${j.location?.display_name}`.toLowerCase(),
    };
  });
}

// Periodic sync: queries come from ADZUNA_QUERY (comma separated), the roles users are targeting, and a broad default list.
const DEFAULTS = ['teacher', 'accountant', 'nurse', 'engineer', 'software developer', 'sales executive', 'hr executive', 'digital marketing', 'graphic designer', 'customer support'];
export default async function fetchAdzuna({ extraQueries = [] } = {}) {
  if (!adzunaReady()) throw new Error('Adzuna credentials not configured');
  const own = (process.env.ADZUNA_QUERY || '').split(',').map((s) => s.trim()).filter(Boolean);
  const queries = [...new Set([...own, ...extraQueries, ...DEFAULTS].map((q) => q.toLowerCase()))].slice(0, Number(process.env.ADZUNA_MAX_QUERIES) || 15);
  const out = []; let ok = 0, last = '';
  for (const what of queries) { try { out.push(...await adzunaSearch({ what, perPage: 15 })); ok++; } catch (e) { last = e.message; } }
  if (!ok) throw new Error(last || 'Adzuna unavailable');
  return out;
}
