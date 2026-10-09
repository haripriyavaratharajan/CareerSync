import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import { extractSkills } from '../../utils/skills.js';

export async function extractText(file) {
  const name = file.originalname.toLowerCase();
  if (name.endsWith('.pdf')) return (await pdf(file.buffer)).text;
  if (name.endsWith('.docx')) return (await mammoth.extractRawText({ buffer: file.buffer })).value;
  const e = new Error('Only PDF and DOCX files are supported (re-save .doc files as .docx)'); e.status = 400; throw e;
}

const HEAD = /^(education|experience|work experience|projects?|certifications?|skills|summary|objective|achievements?)\s*:?$/i;
// Best-effort rule-based parser: no paid AI needed.
export function parseResume(text, extraSkills = []) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sec = {}; let cur = 'top';
  for (const l of lines) { if (HEAD.test(l)) { cur = l.toLowerCase().replace(/^work /, '').replace(/s$/, ''); sec[cur] = []; } else (sec[cur] ||= []).push(l); }
  const clean = (a = []) => a.map((x) => x.replace(/^[•\-*\u2022]\s*/, '')).filter((x) => x.length > 3);
  const skills = extractSkills(text, extraSkills);
  let inferredField = '';
  const fieldMapping = {
    'IT / Software': ['python', 'java', 'javascript', 'react', 'node', 'sql', 'developer', 'programming', 'software'],
    'Finance / Accounting': ['accounting', 'finance', 'tally', 'gst', 'tax', 'audit', 'accountant'],
    'HR': ['recruitment', 'human resources', 'hr', 'payroll', 'talent'],
    'Marketing / Sales': ['marketing', 'sales', 'seo', 'crm', 'digital marketing'],
    'Teaching / Education': ['teaching', 'teacher', 'curriculum', 'classroom', 'education', 'tutor'],
    'Healthcare / Nursing': ['nursing', 'healthcare', 'clinical', 'patient', 'medical', 'nurse'],
    'Engineering': ['autocad', 'civil', 'mechanical', 'electrical', 'construction', 'engineering', 'cad'],
    'Design / UI UX': ['figma', 'design', 'ui', 'ux', 'photoshop', 'illustrator']
  };
  let maxMatch = 0;
  for (const [field, keywords] of Object.entries(fieldMapping)) {
    const matches = skills.concat(text.toLowerCase().split(/\s+/)).filter(w => keywords.includes(w.toLowerCase())).length;
    if (matches > maxMatch) { maxMatch = matches; inferredField = field; }
  }
  
  const jobTitle = lines[1]?.length < 50 ? lines[1] : '';
  if (!inferredField) inferredField = jobTitle; // Fallback to title instead of 'Other'

  return {
    name: lines[0]?.length < 50 ? lines[0] : '',
    jobTitle,
    professionalField: inferredField,
    email: text.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] || '',
    phone: text.match(/(\+?\d[\d\s-]{8,14}\d)/)?.[0] || '',
    summary: (sec.summary || sec.objective || []).join(' ').slice(0, 400),
    skills,
    education: clean(sec.education).map((l) => ({ degree: l })),
    experience: clean(sec.experience).map((l) => ({ role: l })),
    projects: clean(sec.project).map((l) => ({ name: l })),
    certifications: clean(sec.certification).map((l) => ({ name: l })),
    achievements: clean(sec.achievement || sec.achievements).map((l) => ({ title: l })),
    customSections: []
  };
}
