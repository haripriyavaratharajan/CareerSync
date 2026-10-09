import Profile from '../models/Profile.js';
import profileCompletion from '../utils/profileCompletion.js';
import { FIELD_CATALOG, CAREER_FIELDS, SOFT_SKILLS } from '../data/fields.js';

export { CAREER_FIELDS };
const arr = (v) => (Array.isArray(v) ? v : []);
const strs = (v) => arr(v).map((x) => String(x).trim()).filter(Boolean);
const makeKey = (field) => `${String(field).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'field'}-${Math.random().toString(36).slice(2, 7)}`;
const keyBase = (field) => String(field).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'field';

// Old single-field profiles are converted into the first career profile (kept for backward compatibility).
const legacyToCareer = (p) => {
  if (!p.professionalField && !p.jobTitle && !p.skills?.core?.length) return null;
  const field = p.professionalField || 'Other';
  return { key: keyBase(field), field, targetRoles: p.preferences?.desiredRoles || [], headline: p.headline || '', jobTitle: p.jobTitle || '',
    skills: { core: arr(p.skills?.core), tools: arr(p.skills?.tools), knowledge: arr(p.skills?.knowledge), soft: arr(p.skills?.soft) },
    education: arr(p.education), experience: arr(p.experience), projects: arr(p.projects), certifications: arr(p.certifications),
    achievements: arr(p.achievements), customSections: arr(p.customSections),
    preferences: { preferredLocations: arr(p.preferences?.preferredLocations), workMode: p.preferences?.workMode || 'any', sector: p.preferences?.sector || 'both', experienceLevel: p.preferences?.experienceLevel || 'fresher' } };
};

// Validates and normalises what the browser sends so a bad request can never corrupt the profile.
function sanitizeCareer(c, seen) {
  const field = String(c?.field || 'Other').trim().slice(0, 80) || 'Other';
  let key = String(c?.key || '').trim() || makeKey(field);
  while (seen.has(key)) key = makeKey(field);
  seen.add(key);
  const sk = c.skills || {};
  const pref = c.preferences || {};
  return {
    key, field, targetRoles: strs(c.targetRoles), headline: String(c.headline || ''), jobTitle: String(c.jobTitle || ''),
    skills: { core: strs(sk.core), tools: strs(sk.tools), knowledge: strs(sk.knowledge), soft: strs(sk.soft) },
    education: arr(c.education), experience: arr(c.experience),
    projects: arr(c.projects).map((p) => ({ ...p, technologies: Array.isArray(p.technologies) ? strs(p.technologies) : strs(String(p.technologies || '').split(',')) })),
    certifications: arr(c.certifications), achievements: arr(c.achievements), customSections: arr(c.customSections),
    preferences: {
      preferredLocations: strs(pref.preferredLocations),
      workMode: ['remote', 'hybrid', 'onsite', 'any'].includes(pref.workMode) ? pref.workMode : 'any',
      sector: ['government', 'private', 'both'].includes(pref.sector) ? pref.sector : 'both',
      experienceLevel: ['fresher', 'junior', 'mid', 'senior'].includes(pref.experienceLevel) ? pref.experienceLevel : 'fresher',
    },
  };
}

const catalog = () => FIELD_CATALOG.map(({ name, icon, roles, skills }) => ({ name, icon, roles, skills }));
const payload = (user, profile) => ({
  profile, fields: CAREER_FIELDS, catalog: catalog(), softSkills: SOFT_SKILLS,
  user: { name: user.name, email: user.email }, completion: profileCompletion(user, profile),
});

async function load(userId) {
  const profile = await Profile.findOneAndUpdate({ user: userId }, {}, { new: true, upsert: true });
  if (!profile.careerProfiles?.length) { const legacy = legacyToCareer(profile); if (legacy) { profile.careerProfiles = [legacy]; await profile.save(); } }
  return profile;
}

export async function getProfile(req, res, next) {
  try { res.json(payload(req.user, await load(req.user._id))); } catch (e) { next(e); }
}

// Partial update: only the keys that are present in the request body are changed.
export async function updateProfile(req, res, next) {
  try {
    const b = req.body || {}, set = {};
    if (typeof b.name === 'string' && b.name.trim()) { req.user.name = b.name.trim(); await req.user.save(); }
    if ('phone' in b) set.phone = String(b.phone || '');
    if ('location' in b) set.location = String(b.location || '');
    if ('photoUrl' in b) set.photoUrl = String(b.photoUrl || '');
    if (Array.isArray(b.careerProfiles)) { const seen = new Set(); set.careerProfiles = b.careerProfiles.map((c) => sanitizeCareer(c, seen)); }
    if (b.preferences && b.preferences.matchThreshold !== undefined) {
      const n = Number(b.preferences.matchThreshold);
      if (!Number.isNaN(n)) set['preferences.matchThreshold'] = Math.min(100, Math.max(10, n));
    }
    const profile = await Profile.findOneAndUpdate({ user: req.user._id }, { $set: set }, { new: true, upsert: true, runValidators: true });
    res.json(payload(req.user, profile));
  } catch (e) { next(e); }
}
