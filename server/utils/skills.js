import { FIELD_CATALOG, SOFT_SKILLS } from '../data/fields.js';

// Skill vocabulary used to read skills out of job descriptions and uploaded resumes.
// It is built from the field catalogue so every profession (not just IT) is understood.
const BASE = ['Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Project Management', 'Excel', 'Microsoft Office', 'Google Workspace',
  'Presentation', 'Documentation', 'Risk Management', 'Project Planning', 'Typing', 'MS Office'];
export const COMMON = [...new Set([
  ...BASE, ...SOFT_SKILLS,
  ...FIELD_CATALOG.flatMap((f) => [...f.skills.core, ...f.skills.tools]),
])];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const compiled = new Map();
const rx = (s) => { if (!compiled.has(s)) compiled.set(s, new RegExp(`(^|[^A-Za-z0-9])${esc(s)}($|[^A-Za-z0-9+#])`, 'i')); return compiled.get(s); };
export const extractSkills = (text = '', extra = []) => [...new Set([...COMMON, ...extra])].filter((s) => rx(s).test(text));
