export const SECTIONS = ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'achievements', 'customSections'];
export const SECTION_LABELS = { summary: 'Summary', experience: 'Experience', projects: 'Projects / Work', education: 'Education', skills: 'Skills', certifications: 'Certifications', achievements: 'Achievements', customSections: 'Custom sections' };
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null);
export const initials = (s = '') => s.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
const COLORS = ['#f2542d', '#d6336c', '#9c36d6', '#4263eb', '#0ca678', '#e8590c', '#1098ad', '#c2255c'];
export const colorFor = (s = '') => COLORS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
export const csv = (v) => String(v || '').split(',').map((x) => x.trim()).filter(Boolean);
export const scoreTone = (n) => (n >= 70 ? 'ok' : n >= 40 ? 'warn' : 'bad');

// Same shape the server builds in routes/resume.js (fromCareer) – used for instant previews before anything is saved.
export function careerToData(user, profile, c) {
  return {
    name: user?.name || '', email: user?.email || '', phone: profile?.phone || '', location: profile?.location || '', photo: profile?.photoUrl || '',
    summary: c.headline || '', professionalField: c.field, jobTitle: c.jobTitle || '', targetRoles: c.targetRoles || [],
    skills: [...new Set(Object.values(c.skills || {}).flat())], education: c.education || [], experience: c.experience || [],
    projects: (c.projects || []).map((p) => ({ ...p, technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies })),
    certifications: c.certifications || [], achievements: c.achievements || [], customSections: c.customSections || [],
  };
}

export const SAMPLE = {
  name: 'Aarav Sharma', email: 'aarav@email.com', phone: '+91 98765 43210', location: 'Chennai, India', photo: '', professionalField: 'Your field', jobTitle: 'Your Target Role', targetRoles: [],
  summary: 'Dependable professional with hands-on experience, a record of delivering on time, and a strong willingness to keep learning.',
  skills: ['Communication', 'Teamwork', 'Excel', 'Problem Solving', 'Planning', 'Leadership'],
  experience: [{ role: 'Senior Executive', company: 'Bright Co.', duration: '2021 – Present', description: '- Led a team of 8 to hit quarterly goals\n- Cut turnaround time by 30%' }, { role: 'Associate', company: 'Nova Ltd.', duration: '2018 – 2021', description: '- Handled daily operations and reporting' }],
  education: [{ degree: 'Bachelor’s Degree', college: 'City College', graduationYear: '2018', score: '8.4 CGPA' }],
  projects: [{ name: 'Process Improvement Drive', description: 'Redesigned the workflow for the whole team.', technologies: 'Planning, Excel' }],
  certifications: [{ name: 'Professional Certificate', issuer: 'Institute', date: '2022' }], achievements: [{ title: 'Employee of the Year', date: '2023' }], customSections: [],
};

const lum = (hex = '#fff') => { const h = hex.replace('#', ''), n = parseInt(h.length === 3 ? [...h].map((c) => c + c).join('') : h, 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
export const isDark = (hex) => lum(hex) < 0.55;
