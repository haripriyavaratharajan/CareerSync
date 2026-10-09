import ResumeTemplate from '../models/ResumeTemplate.js';
import { TEMPLATES } from '../data/templates.js';

// Upsert by key: templates are created on first start and updated if the definitions change. User resumes keep their template link.
export async function ensureTemplates() {
  await ResumeTemplate.bulkWrite(TEMPLATES.map((t) => ({ updateOne: { filter: { key: t.key }, update: { $set: t }, upsert: true } })));
  const keys = TEMPLATES.map((t) => t.key);
  const stale = await ResumeTemplate.countDocuments({ key: { $nin: keys } });
  if (stale) console.log(`Note: ${stale} old template(s) from a previous version remain in the database (harmless).`);
  return TEMPLATES.length;
}
