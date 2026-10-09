import { extractSkills } from '../../utils/skills.js';
// Public Remotive API (https://remotive.com/api/remote-jobs). Remotive asks for modest usage, so the periodic sync makes ONE call
// and searches are only made when a user explicitly asks for them (and are cached – see live.js).
export default async function fetchRemotive({ search, limit = 100 } = {}) {
  const url = new URL('https://remotive.com/api/remote-jobs');
  url.searchParams.set('limit', String(limit));
  if (search) url.searchParams.set('search', search);
  const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`Remotive ${r.status}`);
  const { jobs = [] } = await r.json();
  return jobs.map((j) => {
    const text = (j.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return {
      title: j.title, company: j.company_name, location: j.candidate_required_location || 'Remote',
      description: text.slice(0, 2500), skills: [...new Set([...(j.tags || []), ...extractSkills(`${j.title} ${text}`)])].slice(0, 12),
      employmentType: (j.job_type || 'full_time').replace('_', '-'), remoteType: 'remote', source: 'remotive',
      sourceUrl: j.url, applicationUrl: j.url, postedDate: j.publication_date,
      dedupeKey: `${j.title}|${j.company_name}|remote`.toLowerCase(),
    };
  });
}
