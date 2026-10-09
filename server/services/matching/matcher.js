import { FIELD_CATALOG } from '../../data/fields.js';

// Each part is scored 0..1 and weighted. Parts that cannot be judged (e.g. a government notice that lists no skills,
// or a profile with no target roles) are left out and the remaining weights are re-balanced – never guessed.
export const WEIGHTS = { skills: 0.4, title: 0.2, field: 0.15, experience: 0.1, location: 0.1, education: 0.05 };
const YEARS = { fresher: 0, junior: 1, mid: 3, senior: 5 };
const STOP = new Set(['and', 'the', 'for', 'of', 'in', 'at', 'to', 'a', 'an', 'senior', 'junior', 'sr', 'jr', 'lead', 'assistant', 'trainee', 'intern']);

const plain = (v) => v?.toObject?.() ?? v;
export const careerSkills = (c) => Object.values(plain(c?.skills) || {}).filter(Array.isArray).flat();
export const careerList = (p) => (p?.careerProfiles?.length ? p.careerProfiles : []);
export const profileSkills = (p) => careerList(p).flatMap(careerSkills);

const tokens = (s) => String(s || '').toLowerCase().split(/[^a-z0-9+#]+/).filter((w) => w.length > 1 && !STOP.has(w)).map((w) => w.replace(/(ing|er|ers|s)$/, ''));
const catalogFor = (field) => FIELD_CATALOG.find((f) => f.name === field);

export function matchOne(job, career) {
  const have = new Set(careerSkills(career).map((s) => s.toLowerCase()));
  const req = job.skills || [];
  const matched = req.filter((s) => have.has(s.toLowerCase()));
  const missing = req.filter((s) => !have.has(s.toLowerCase()));
  const parts = {}, jTitle = (job.title || '').toLowerCase(), jTokens = new Set(tokens(job.title));

  if (req.length) parts.skills = matched.length / req.length;

  const roles = [...(career.targetRoles || []), career.jobTitle].filter(Boolean);
  if (roles.length) {
    parts.title = Math.max(...roles.map((r) => {
      if (jTitle.includes(String(r).toLowerCase())) return 1;
      const t = tokens(r); return t.length ? t.filter((w) => jTokens.has(w)).length / t.length : 0;
    }));
  }

  const cat = catalogFor(career.field);
  if (career.field && career.field !== 'Other') {
    parts.field = job.fields?.includes(career.field) ? 1 : cat?.keywords?.some((k) => jTitle.includes(k.trim())) ? 0.7 : 0;
  }

  const need = job.experience?.min || 0, mine = YEARS[career.preferences?.experienceLevel] ?? 0;
  parts.experience = need ? Math.min(1, mine / need) : 1;

  const prefs = (career.preferences?.preferredLocations || []).map((l) => l.toLowerCase());
  const mode = career.preferences?.workMode || 'any', loc = (job.location || '').toLowerCase();
  parts.location = prefs.some((l) => (l === 'remote' ? job.remoteType === 'remote' : loc.includes(l))) ? 1
    : job.remoteType === 'remote' ? (mode === 'onsite' ? 0.4 : 0.9)
    : prefs.length ? 0.2 : 0.7;

  parts.education = career.education?.length ? 1 : 0;

  const used = Object.keys(parts), total = used.reduce((t, k) => t + WEIGHTS[k], 0);
  const score = Math.round((used.reduce((t, k) => t + parts[k] * WEIGHTS[k], 0) / total) * 100);
  return {
    score, field: career.field, fieldKey: career.key, skillsListed: req.length > 0,
    breakdown: Object.fromEntries(Object.keys(WEIGHTS).map((k) => [k, k in parts ? Math.round(parts[k] * 100) : null])),
    matchedSkills: matched, missingSkills: missing,
  };
}

const EMPTY = (job) => ({ score: 0, field: '', fieldKey: '', skillsListed: !!job.skills?.length, breakdown: {}, matchedSkills: [], missingSkills: job.skills || [] });

// Score against every career field (best first).
export const matchAll = (profile, job) => careerList(profile).map((c) => matchOne(job, c)).sort((a, b) => b.score - a.score);

// Best field by default, or a specific field when fieldKey is given.
export function match(profile, job, fieldKey) {
  const list = careerList(profile);
  if (fieldKey) { const c = list.find((x) => x.key === fieldKey); if (c) return matchOne(job, c); }
  return matchAll(profile, job)[0] || EMPTY(job);
}
