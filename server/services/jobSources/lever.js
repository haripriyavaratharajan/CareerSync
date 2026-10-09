import { extractSkills } from '../../utils/skills.js';
// Public postings API; companies set in LEVER_COMPANIES (comma-separated slugs).
export default async function fetchLever() {
  let cos = (process.env.LEVER_COMPANIES || 'spotify').split(',').map((c) => c.trim()).filter(Boolean), out = [], ok = 0, last = '';
  for (const c of cos) {
    const r = await fetch(`https://api.lever.co/v0/postings/${c}?mode=json&limit=15`);
    if (!r.ok) { last = `HTTP ${r.status}`; continue; }
    ok++;
    for (const j of await r.json()) out.push({ title: j.text, company: c, location: j.categories?.location, description: (j.descriptionPlain || '').slice(0, 1500), skills: extractSkills(`${j.text} ${j.descriptionPlain}`),
      employmentType: (j.categories?.commitment || 'full-time').toLowerCase(), remoteType: j.workplaceType === 'remote' ? 'remote' : 'onsite', source: 'lever',
      sourceUrl: j.hostedUrl, applicationUrl: j.applyUrl || j.hostedUrl, postedDate: j.createdAt && new Date(j.createdAt), dedupeKey: `${j.text}|${c}|${j.categories?.location}`.toLowerCase() });
  }
  if (!ok) throw new Error(`${last || 'No boards configured'} – source unreachable`); // never report a blocked source as OK
  return out;
}
