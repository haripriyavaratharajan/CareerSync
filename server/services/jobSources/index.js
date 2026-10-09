import Job from '../../models/Job.js';
import Application from '../../models/Application.js';
import Notification from '../../models/Notification.js';
import SourceStatus from '../../models/SourceStatus.js';
import fetchRemotive from './remotive.js';
import fetchAdzuna from './adzuna.js';
import fetchGreenhouse from './greenhouse.js';
import fetchLever from './lever.js';
import { fetchGovSource } from './government.js';
import { GOV } from './govSources.js';
import Profile from '../../models/Profile.js';
import SavedSearch from '../../models/SavedSearch.js';
import { classifyFields } from '../../data/fields.js';
import { notifyMatches } from '../notifications/notifier.js';

// Register a new source here; it only has to return normalized Job objects.
export const SOURCES = [
  { key: 'remotive', name: 'Remotive', kind: 'private', url: 'https://remotive.com', fn: fetchRemotive },
  { key: 'adzuna', name: 'Adzuna', kind: 'private', url: 'https://www.adzuna.in', fn: async () => fetchAdzuna({ extraQueries: await wantedQueries() }) },
  { key: 'greenhouse', name: 'Greenhouse boards', kind: 'private', url: 'https://boards.greenhouse.io', fn: fetchGreenhouse },
  { key: 'lever', name: 'Lever boards', kind: 'private', url: 'https://jobs.lever.co', fn: fetchLever },
  ...GOV.map((g) => ({ key: g.key, name: g.name, kind: 'government', url: g.url, fn: () => fetchGovSource(g) })),
];

// What real users are looking for right now: their target roles and saved searches (used to steer Adzuna).
export async function wantedQueries() {
  try {
    const profiles = await Profile.find().select('careerProfiles.targetRoles').lean();
    const roles = profiles.flatMap((p) => (p.careerProfiles || []).flatMap((c) => c.targetRoles || []));
    const searches = (await SavedSearch.find().select('q').lean()).map((s) => s.q).filter(Boolean);
    return [...new Set([...roles, ...searches].map((x) => x.trim()).filter(Boolean))].slice(0, 20);
  } catch { return []; }
}

// Single place where jobs are stored: de-duplicates and tags every job with its career field(s).
export async function saveJobs(list) {
  const fresh = [];
  for (const j of list) {
    if (!j?.title || !j.dedupeKey) continue;
    if (await Job.exists({ dedupeKey: j.dedupeKey })) continue;
    j.notificationUrl ||= j.sourceUrl;
    try { j.sourceSite ||= new URL(j.sourceUrl).origin; } catch { /* no site */ }
    j.fields = classifyFields(j);
    try { fresh.push(await Job.create(j)); } catch (e) { if (e.code !== 11000) console.error('save job failed', e.message); }
  }
  return fresh;
}

// Remove any placeholder/demo jobs from older versions, and records pointing at them.
export async function purgeFakeJobs() {
  await Job.deleteMany({ $or: [{ source: 'demo' }, { source: 'government' }, { dedupeKey: /^gov\|/ }] });
  const ids = (await Job.find().select('_id').lean()).map((j) => j._id);
  await Application.deleteMany({ job: { $nin: ids } });
  await Notification.deleteMany({ job: { $exists: true, $nin: ids } });
}

export async function syncAll() {
  await purgeFakeJobs();
  const fresh = [], report = {};
  await Promise.all(SOURCES.map(async (s) => {
    let status = { status: 'ok', count: 0 }, added = 0;
    try {
      const list = await s.fn();
      status.count = list.filter((j) => j.title).length;
      const saved = await saveJobs(list); fresh.push(...saved); added = saved.length;
    } catch (e) { status = { status: 'error', error: e.message, count: 0 }; }
    await SourceStatus.findOneAndUpdate({ key: s.key }, { name: s.name, kind: s.kind, url: s.url, lastFetched: new Date(), error: status.error, ...status }, { upsert: true });
    report[s.key] = { ...status, added };
  }));
  report.notifications = await notifyMatches(fresh); // match + notify for each new real job
  return report;
}
