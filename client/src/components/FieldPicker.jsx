// Multi-select grid of all career fields. `taken` fields are shown but disabled.
export default function FieldPicker({ catalog = [], selected = [], taken = [], onToggle }) {
  return <div className="field-grid stagger">{catalog.map((f, i) => {
    const on = selected.includes(f.name), dis = taken.includes(f.name);
    return <button type="button" key={f.name} style={{ '--i': i % 12 }} className={`field-card ${on ? 'on' : ''} ${dis ? 'dis' : ''}`} onClick={() => onToggle(f.name)} aria-pressed={on}>
      <span className="em">{f.icon}</span><span>{f.name}</span></button>;
  })}</div>;
}

export const newCareer = (f) => ({
  key: `${f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Math.random().toString(36).slice(2, 7)}`, field: f.name,
  targetRoles: [], headline: '', jobTitle: '', skills: { core: [], tools: [], knowledge: [], soft: [] },
  education: [], experience: [], projects: [], certifications: [], achievements: [], customSections: [],
  preferences: { preferredLocations: [], workMode: 'any', sector: 'both', experienceLevel: 'fresher' },
});
