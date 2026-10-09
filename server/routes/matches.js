import { Router } from 'express';
import mongoose from 'mongoose';
import protect from '../middleware/auth.js';
import Job from '../models/Job.js';
import Skill from '../models/Skill.js';
import Profile from '../models/Profile.js';
import { match, careerList } from '../services/matching/matcher.js';

export const matchesRouter = Router();
export const skillGapRouter = Router();
matchesRouter.use(protect); skillGapRouter.use(protect);

const careerText = (profile, fieldKey) => {
  const list = careerList(profile).filter((c) => !fieldKey || c.key === fieldKey);
  return JSON.stringify(list.map((c) => [c.projects, c.experience, c.certifications, c.headline])).toLowerCase();
};

matchesRouter.get('/', async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    const jobs = (await Job.find().lean()).map((j) => ({ ...j, match: match(profile, j, req.query.fieldKey) })).sort((a, b) => b.match.score - a.match.score);
    res.json({ jobs });
  } catch (e) { next(e); }
});

// Per-skill status + structured learning advice (no AI needed)
skillGapRouter.get('/:jobId', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.jobId)) return res.status(404).json({ message: 'Job not found' });
    const job = await Job.findById(req.params.jobId).lean();
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const profile = await Profile.findOne({ user: req.user._id });
    const m = match(profile, job, req.query.fieldKey);
    const total = await Job.countDocuments();
    const cat = await Skill.find({ name: { $in: m.missingSkills } }).lean();
    const text = careerText(profile, m.fieldKey);
    // 100 = listed skill, 50 = mentioned in projects/experience, 0 = missing
    const level = (s) => (m.matchedSkills.includes(s) ? 100 : text.includes(s.toLowerCase()) ? 50 : 0);
    const label = (v) => (v >= 90 ? 'Strong' : v >= 50 ? 'Good' : 'Missing');
    const skills = (job.skills || []).map((s) => ({ name: s, level: level(s), status: label(level(s)) }));
    const recommendations = await Promise.all(m.missingSkills.map(async (s) => {
      const c = cat.find((x) => x.name === s), n = await Job.countDocuments({ skills: s });
      return { skill: s, why: `Appears in ${n} of ${total} jobs currently in CareerSync.`,
        summary: c?.learning?.summary || `Learn the fundamentals of ${s}, then use it in one small real task or project and add it to your resume.`, topics: c?.learning?.topics || [] };
    }));
    res.json({ job, match: m, skills, recommendations });
  } catch (e) { next(e); }
});

// Aggregate view across your best-matching jobs: which missing skills matter most
skillGapRouter.get('/', async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    const top = (await Job.find({ skills: { $exists: true, $ne: [] } }).lean()).map((j) => ({ ...j, m: match(profile, j, req.query.fieldKey) })).sort((a, b) => b.m.score - a.m.score).slice(0, 10);
    const count = {}; top.forEach((j) => j.m.missingSkills.forEach((s) => (count[s] = (count[s] || 0) + 1)));
    const cat = await Skill.find({ name: { $in: Object.keys(count) } }).lean();
    const demand = Object.entries(count).sort((a, b) => b[1] - a[1]).map(([skill, n]) => ({ skill, percent: Math.round((n / top.length) * 100),
      summary: cat.find((c) => c.name === skill)?.learning?.summary || `Learn the fundamentals of ${skill}.`, topics: cat.find((c) => c.name === skill)?.learning?.topics || [] }));
    res.json({ demand, jobs: top.length, topJobs: top.map((j) => ({ _id: j._id, title: j.title, company: j.company, match: j.m })) });
  } catch (e) { next(e); }
});
