import { extractSkills } from '../../utils/skills.js';
// Public job-board API; boards set in GREENHOUSE_BOARDS (comma-separated board tokens).
export default async function fetchGreenhouse() {
  let boards = (process.env.GREENHOUSE_BOARDS || 'airbnb').split(',').map((b) => b.trim()).filter(Boolean), out = [], ok = 0, last = '';
  for (const b of boards) {
    const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${b}/jobs?content=true`);
    if (!r.ok) { last = `HTTP ${r.status}`; continue; }
    ok++;
    for (const j of (await r.json()).jobs.slice(0, 15)) {
      const text = (j.content || '').replace(/&lt;[^]*?&gt;|<[^>]+>/g, ' ');
      out.push({ title: j.title, company: b, location: j.location?.name, description: text.slice(0, 1500), skills: extractSkills(`${j.title} ${text}`), source: 'greenhouse',
        sourceUrl: j.absolute_url, applicationUrl: j.absolute_url, postedDate: j.updated_at, dedupeKey: `${j.title}|${b}|${j.location?.name}`.toLowerCase() });
    }
  }
  if (!ok) throw new Error(`${last || 'No boards configured'} – source unreachable`); // never report a blocked source as OK
  return out;
}
