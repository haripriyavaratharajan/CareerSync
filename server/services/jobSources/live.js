import fetchRemotive from './remotive.js';
import { adzunaSearch, adzunaReady } from './adzuna.js';
import { saveJobs } from './index.js';
import { notifyMatches } from '../notifications/notifier.js';

// On-demand search: when a job seeker searches for something, ask the online sources for it and store what comes back.
// Cached for 6 hours per query so we never hammer the providers.
const seen = new Map();
const TTL = 6 * 3600e3;

export async function liveSearch({ q = '', location = '' }) {
  const query = q.trim();
  if (!query) return { fetched: 0, added: 0, cached: false, errors: ['Type something to search for first.'] };
  const key = `${query.toLowerCase()}|${location.trim().toLowerCase()}`;
  if (seen.has(key) && Date.now() - seen.get(key) < TTL) return { fetched: 0, added: 0, cached: true, errors: [] };

  const tasks = [['Remotive', fetchRemotive({ search: query, limit: 40 })]];
  if (adzunaReady()) tasks.push(['Adzuna', adzunaSearch({ what: query, where: location, perPage: 30 })]);
  const settled = await Promise.allSettled(tasks.map(([, p]) => p));
  const errors = [], list = [];
  settled.forEach((s, i) => (s.status === 'fulfilled' ? list.push(...s.value) : errors.push(`${tasks[i][0]}: ${s.reason?.message || 'unavailable'}`)));
  if (settled.some((s) => s.status === 'fulfilled')) seen.set(key, Date.now());
  const fresh = await saveJobs(list);
  notifyMatches(fresh).catch((e) => console.error('notify failed', e.message));
  return { fetched: list.length, added: fresh.length, cached: false, errors, adzuna: adzunaReady() };
}
