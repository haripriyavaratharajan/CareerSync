import { Router } from 'express';
import mongoose from 'mongoose';
import protect from '../middleware/auth.js';
import Job from '../models/Job.js';
import Profile from '../models/Profile.js';
import Application from '../models/Application.js';
import SourceStatus from '../models/SourceStatus.js';
import { match, matchAll } from '../services/matching/matcher.js';
import { syncAll } from '../services/jobSources/index.js';
import { liveSearch } from '../services/jobSources/live.js';

const router = Router();
router.use(protect);
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rx = (s) => new RegExp(esc(s), 'i');

// GET /api/jobs?q=&location=&field=&fieldKey=&sector=&remote=&level=&source=&sort=&minScore=&tracked=
// field    = only jobs classified in that career field      fieldKey = score matches as that career field
router.get('/', async (req, res, next) => {
  try {
    const { q, remote, sector, source, location, level, sort, expired, field, fieldKey, minScore, tracked } = req.query;
    const and = [];
    // every word must appear somewhere (title, company, skills, field, location, qualification or description)
    String(q || '').trim().split(/\s+/).filter(Boolean).slice(0, 6).forEach((w) => and.push({ $or: [{ title: rx(w) }, { company: rx(w) }, { skills: rx(w) }, { fields: rx(w) }, { location: rx(w) }, { qualification: rx(w) }, { description: rx(w) }] }));
    if (location) and.push({ location: rx(location) });
    if (remote) and.push({ remoteType: remote });
    if (sector) and.push({ sector });
    if (source) and.push({ source });
    if (level) and.push({ level });
    if (field) and.push({ fields: field });
    if (!expired) and.push({ $or: [{ applicationDeadline: null }, { applicationDeadline: { $exists: false } }, { applicationDeadline: { $gte: new Date() } }] });

    const apps = await Application.find({ user: req.user._id }).select('job status').lean();
    const status = new Map(apps.map((a) => [String(a.job), a.status]));
    if (tracked) and.push({ _id: { $in: apps.filter((a) => tracked === 'any' || a.status === tracked).map((a) => a.job) } });

    const profile = await Profile.findOne({ user: req.user._id });
    const found = await Job.find(and.length ? { $and: and } : {}).sort('-postedDate -createdAt').limit(400).lean();
    let jobs = found.map((j) => ({ ...j, match: match(profile, j, fieldKey), tracked: status.get(String(j._id)) || null }));
    if (minScore) jobs = jobs.filter((j) => j.match.score >= Number(minScore));
    if (sort === 'match') jobs.sort((a, b) => b.match.score - a.match.score);
    if (sort === 'deadline') jobs.sort((a, b) => (a.applicationDeadline ? +new Date(a.applicationDeadline) : Infinity) - (b.applicationDeadline ? +new Date(b.applicationDeadline) : Infinity));
    res.json({ jobs: jobs.slice(0, 150), total: jobs.length });
  } catch (e) { next(e); }
});

router.get('/sources', async (req, res, next) => { try { res.json({ sources: await SourceStatus.find().sort('kind key').lean() }); } catch (e) { next(e); } });
router.post('/sync', async (req, res, next) => { try { res.json({ report: await syncAll() }); } catch (e) { next(e); } });
// Ask the online job sources for what the user typed, store the results, then the client reloads the list.
router.post('/live', async (req, res, next) => { try { res.json(await liveSearch({ q: req.body?.q, location: req.body?.location })); } catch (e) { next(e); } });

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Job not found' });
    const job = await Job.findById(req.params.id).lean();
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const profile = await Profile.findOne({ user: req.user._id });
    const app = await Application.findOne({ user: req.user._id, job: job._id }).lean();
    res.json({ job, match: match(profile, job, req.query.fieldKey), matches: matchAll(profile, job), application: app });
  } catch (e) { next(e); }
});
export default router;
