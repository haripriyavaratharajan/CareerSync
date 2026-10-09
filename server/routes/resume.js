import { Router } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import protect from '../middleware/auth.js';
import Resume from '../models/Resume.js';
import ResumeTemplate from '../models/ResumeTemplate.js';
import Profile from '../models/Profile.js';
import Job from '../models/Job.js';
import Skill from '../models/Skill.js';
import Notification from '../models/Notification.js';
import { extractText, parseResume } from '../services/resume/parser.js';
import { careerSkills } from '../services/matching/matcher.js';

const router = Router();
router.get('/templates', async (req, res, next) => { try { res.json({ templates: await ResumeTemplate.find().sort({ key: 1 }) }); } catch (e) { next(e); } }); // public: shown on the landing page
router.use(protect);

const SECTIONS = ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'achievements', 'customSections'];
const arr = (v) => (Array.isArray(v) ? v : []);

const score = (d = {}) => {
  const checks = [['Contact information', d.email && d.phone], ['Summary', d.summary], ['Education', d.education?.length], ['Skills (5+)', d.skills?.length >= 5],
    ['Projects or work samples', d.projects?.length], ['Experience', d.experience?.length], ['Certifications', d.certifications?.length]];
  const breakdown = checks.map(([label, ok]) => ({ label, passed: !!ok, note: ok ? 'Present' : 'Add this section' }));
  return { total: Math.round((breakdown.filter((b) => b.passed).length / checks.length) * 100), breakdown };
};

const plain = (c) => JSON.parse(JSON.stringify(c));
const fromCareer = (user, profile, c) => {
  const p = plain(c);
  return {
    name: user.name, email: user.email, phone: profile.phone || '', location: profile.location || '', photo: profile.photoUrl || '',
    summary: p.headline || '', professionalField: p.field, jobTitle: p.jobTitle || '', targetRoles: p.targetRoles || [],
    skills: [...new Set(careerSkills(p))], education: p.education || [], experience: p.experience || [],
    projects: (p.projects || []).map((x) => ({ ...x, technologies: Array.isArray(x.technologies) ? x.technologies.join(', ') : x.technologies || '' })),
    certifications: p.certifications || [], achievements: p.achievements || [], customSections: p.customSections || [],
  };
};

// Put the skills a job asks for first, and name the resume after the job.
const tailor = (data, job) => {
  const want = new Set((job.skills || []).map((s) => s.toLowerCase()));
  const skills = [...data.skills].sort((a, b) => Number(want.has(b.toLowerCase())) - Number(want.has(a.toLowerCase())));
  return { ...data, skills, jobTitle: data.jobTitle || job.title };
};

const clean = (d = {}) => ({
  name: d.name || '', photo: d.photo || '', email: d.email || '', phone: d.phone || '', location: d.location || '', summary: d.summary || '',
  professionalField: d.professionalField || '', jobTitle: d.jobTitle || '', targetRoles: arr(d.targetRoles).map(String),
  skills: arr(d.skills).map((s) => String(s).trim()).filter(Boolean),
  education: arr(d.education), experience: arr(d.experience), projects: arr(d.projects), certifications: arr(d.certifications),
  achievements: arr(d.achievements), customSections: arr(d.customSections),
});
const findCareer = (profile, key) => profile?.careerProfiles?.find((c) => c.key === key);
const oid = (res, id) => { if (mongoose.isValidObjectId(id)) return true; res.status(404).json({ message: 'Resume not found' }); return false; };
const one = (userId, id) => Resume.findOne({ _id: id, user: userId }).populate('template');

// List all of my resumes (photos are left out to keep the list light)
router.get('/', async (req, res, next) => {
  try { res.json({ resumes: await Resume.find({ user: req.user._id }).select('-data.photo').populate('template').sort('-updatedAt') }); } catch (e) { next(e); }
});

// Create a NEW resume from one career field. Optionally tailored to a job (jobId) or a role name (targetRole).
router.post('/', async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    const c = findCareer(profile, req.body.fieldKey);
    if (!c) return res.status(400).json({ message: 'Choose one of your career fields (add it in Profile first).' });
    const template = (req.body.template && mongoose.isValidObjectId(req.body.template) && await ResumeTemplate.findById(req.body.template)) || await ResumeTemplate.findOne({ key: 'aurora' }) || await ResumeTemplate.findOne();
    let data = fromCareer(req.user, profile, c), job = null;
    if (req.body.jobId && mongoose.isValidObjectId(req.body.jobId)) { job = await Job.findById(req.body.jobId); if (job) data = tailor(data, job); }
    const targetRole = String(req.body.targetRole || job?.title || '').trim();
    if (targetRole && !req.body.jobId) data.jobTitle = targetRole;
    const title = String(req.body.title || '').trim() || `${targetRole || c.jobTitle || c.field} Resume`;
    const resume = await Resume.create({ user: req.user._id, careerFieldKey: c.key, field: c.field, title, targetRole, job: job?._id, data, template: template?._id,
      sectionOrder: template?.defaultOrder?.length ? template.defaultOrder : SECTIONS, score: score(data) });
    res.status(201).json({ resume: await resume.populate('template') });
  } catch (e) { next(e); }
});

// Import an existing PDF/DOCX as a NEW resume under the chosen field.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, f, cb) =>
  (/\.(pdf|docx)$/i.test(f.originalname) ? cb(null, true) : cb(Object.assign(new Error('Only PDF or DOCX files allowed'), { status: 400 }))) });
router.post('/import', (req, res, next) => upload.single('resume')(req, res, (e) => (e ? next(e.code === 'LIMIT_FILE_SIZE' ? Object.assign(new Error('File too large (max 5MB)'), { status: 400 }) : e) : next())), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const profile = await Profile.findOne({ user: req.user._id });
    const c = findCareer(profile, req.body.fieldKey);
    if (!c) return res.status(400).json({ message: 'Choose a career field before importing.' });
    const parsed = parseResume(await extractText(req.file), (await Skill.find().lean()).map((s) => s.name));
    const base = fromCareer(req.user, profile, c);
    const data = { ...base, name: parsed.name || base.name, email: parsed.email || base.email, phone: parsed.phone || base.phone, summary: parsed.summary || base.summary,
      jobTitle: parsed.jobTitle || base.jobTitle, skills: [...new Set([...parsed.skills, ...base.skills])],
      education: parsed.education.length ? parsed.education : base.education, experience: parsed.experience.length ? parsed.experience : base.experience,
      projects: parsed.projects.length ? parsed.projects : base.projects, certifications: parsed.certifications.length ? parsed.certifications : base.certifications,
      achievements: parsed.achievements.length ? parsed.achievements : base.achievements };
    const template = await ResumeTemplate.findOne({ key: 'ats-clean' }) || await ResumeTemplate.findOne();
    const resume = await Resume.create({ user: req.user._id, careerFieldKey: c.key, field: c.field, title: `${c.field} (imported)`, originalFileName: req.file.originalname,
      data, template: template?._id, sectionOrder: SECTIONS, score: score(data) });
    await Notification.create({ user: req.user._id, type: 'resume', title: 'Resume imported', message: `${c.field}: found ${parsed.skills.length} skills in ${req.file.originalname}. Review it in the editor.` });
    res.status(201).json({ resume: await resume.populate('template'), extracted: parsed });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try { if (!oid(res, req.params.id)) return; const r = await one(req.user._id, req.params.id); r ? res.json({ resume: r }) : res.status(404).json({ message: 'Resume not found' }); } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!oid(res, req.params.id)) return;
    const r = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!r) return res.status(404).json({ message: 'Resume not found' });
    const b = req.body || {};
    if (typeof b.title === 'string' && b.title.trim()) r.title = b.title.trim().slice(0, 120);
    if (typeof b.targetRole === 'string') r.targetRole = b.targetRole.trim().slice(0, 120);
    if (b.template && mongoose.isValidObjectId(b.template)) r.template = b.template;
    if (Array.isArray(b.sectionOrder)) r.sectionOrder = [...new Set(b.sectionOrder.filter((k) => SECTIONS.includes(k)))];
    if (b.data) { r.data = clean(b.data); r.markModified('data'); r.score = score(r.data); }
    r.version += 1;
    await r.save();
    res.json({ resume: await r.populate('template') });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try { if (!oid(res, req.params.id)) return; await Resume.deleteOne({ _id: req.params.id, user: req.user._id }); res.json({ message: 'Deleted' }); } catch (e) { next(e); }
});

router.post('/:id/duplicate', async (req, res, next) => {
  try {
    if (!oid(res, req.params.id)) return;
    const r = await Resume.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!r) return res.status(404).json({ message: 'Resume not found' });
    const { _id, createdAt, updatedAt, __v, ...rest } = r;
    const copy = await Resume.create({ ...rest, title: `${r.title} (copy)`, version: 1 });
    res.status(201).json({ resume: await copy.populate('template') });
  } catch (e) { next(e); }
});

// Pull the latest details from the Profile into this resume (explicit – profile edits never silently overwrite a resume).
router.post('/:id/sync', async (req, res, next) => {
  try {
    if (!oid(res, req.params.id)) return;
    const r = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!r) return res.status(404).json({ message: 'Resume not found' });
    const profile = await Profile.findOne({ user: req.user._id });
    const c = findCareer(profile, r.careerFieldKey);
    if (!c) return res.status(400).json({ message: 'That career field no longer exists in your profile.' });
    let data = fromCareer(req.user, profile, c);
    if (r.job) { const job = await Job.findById(r.job); if (job) data = tailor(data, job); }
    if (r.targetRole && !r.job) data.jobTitle = r.targetRole;
    r.data = data; r.markModified('data'); r.score = score(data); r.field = c.field; r.version += 1;
    await r.save();
    res.json({ resume: await r.populate('template') });
  } catch (e) { next(e); }
});
export default router;
