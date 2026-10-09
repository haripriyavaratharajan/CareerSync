import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import FieldPicker, { newCareer } from '../components/FieldPicker';
import { Async, Card, Confirm, ListEditor, Modal, ProgressBar, TagInput } from '../components/UI';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { csv } from '../lib';
import api, { errMsg } from '../services/api';

const SK = [['core', 'Core skills', 'e.g. Teaching, Accounting, Patient care'], ['tools', 'Tools / software', 'e.g. Excel, Tally, AutoCAD'], ['knowledge', 'Domain knowledge', 'Topics you know well'], ['soft', 'Professional strengths', 'e.g. Communication, Leadership']];
const norm = (c) => ({ ...newCareer({ name: c.field || 'Other' }), ...c, targetRoles: c.targetRoles || [], skills: { core: [], tools: [], knowledge: [], soft: [], ...(c.skills || {}) },
  projects: (c.projects || []).map((x) => ({ ...x, technologies: Array.isArray(x.technologies) ? x.technologies.join(', ') : x.technologies || '' })),
  preferences: { preferredLocations: [], workMode: 'any', sector: 'both', experienceLevel: 'fresher', ...(c.preferences || {}) } });

export default function Profile() {
  const s = useFetch('/profile'), toast = useToast();
  const [f, setF] = useState(null), [active, setActive] = useState(0), [dirty, setDirty] = useState(false), [saving, setSaving] = useState(false), [picker, setPicker] = useState(false), [pick, setPick] = useState([]), [del, setDel] = useState(false);
  const loaded = useRef(false);
  useEffect(() => {
    if (!s.data || loaded.current) return; loaded.current = true; const p = s.data.profile;
    setF({ name: s.data.user.name, email: s.data.user.email, phone: p.phone || '', location: p.location || '', photo: p.photoUrl || '', careers: (p.careerProfiles || []).map(norm) });
  }, [s.data]);
  useEffect(() => { const w = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', w); return () => window.removeEventListener('beforeunload', w); }, [dirty]);

  const catalog = s.data?.catalog || [];
  const cur = f?.careers?.[active], cat = useMemo(() => catalog.find((x) => x.name === cur?.field), [catalog, cur?.field]);
  const edit = (patch) => { setF((x) => ({ ...x, ...patch })); setDirty(true); };
  const setCareer = (patch) => { setF((x) => ({ ...x, careers: x.careers.map((c, i) => (i === active ? { ...c, ...patch } : c)) })); setDirty(true); };
  const setPref = (k, v) => setCareer({ preferences: { ...cur.preferences, [k]: v } });
  const photo = (e) => { const file = e.target.files[0]; if (!file) return; if (!/^image\/(png|jpe?g|webp)$/.test(file.type) || file.size > 300 * 1024) return toast('Photo must be PNG/JPG/WEBP under 300KB', 'error'); const r = new FileReader(); r.onload = () => edit({ photo: r.result }); r.readAsDataURL(file); };

  const addFields = () => { const add = catalog.filter((x) => pick.includes(x.name)).map((x) => norm(newCareer(x))); if (!add.length) return; edit({ careers: [...f.careers, ...add] }); setActive(f.careers.length); setPick([]); setPicker(false); toast(`${add.length} field${add.length > 1 ? 's' : ''} added — fill in the details and save`, 'info'); };
  const removeCareer = () => { const next = f.careers.filter((_, i) => i !== active); edit({ careers: next }); setActive(Math.max(0, active - 1)); toast('Field removed — click Save to confirm', 'info'); };
  const save = async (e) => {
    e?.preventDefault(); setSaving(true);
    try {
      const { data } = await api.put('/profile', { name: f.name, phone: f.phone, location: f.location, photoUrl: f.photo, careerProfiles: f.careers });
      setF((x) => ({ ...x, careers: data.profile.careerProfiles.map(norm) })); s.setData(data); setDirty(false); toast('Career profile saved ✓');
    } catch (err) { toast(errMsg(err), 'error'); } finally { setSaving(false); }
  };
  const taken = f?.careers.map((c) => c.field) || [];

  return <Async state={s}>{f && <>
    <div className="page-heading"><div><p className="eyebrow">YOUR CAREER IDENTITIES</p><h1>Career Profile</h1><p className="muted">Shared contact details once, then a separate profile for every field you work in. Each field feeds its own resumes and job matches.</p></div>
      <button className="btn" onClick={() => setPicker(true)}><Icon n="plus" /> Add fields</button></div>
    <Card className="tint"><ProgressBar label="Profile completeness" value={s.data.completion.percent} />{s.data.completion.missing.length > 0 && <p className="muted small" style={{ margin: 0 }}>Still missing: {s.data.completion.missing.join(', ')}</p>}</Card>

    <form onSubmit={save}>
      <Card><div className="section-title"><div><h3>Shared contact</h3><span className="muted small">Used on every resume</span></div></div>
        <div className="form-grid">
          <div><label>Full name</label><input value={f.name} onChange={(e) => edit({ name: e.target.value })} /></div>
          <div><label>Email</label><input value={f.email} disabled /></div>
          <div><label>Phone</label><input value={f.phone} onChange={(e) => edit({ phone: e.target.value })} placeholder="+91 …" /></div>
          <div><label>Location</label><input value={f.location} onChange={(e) => edit({ location: e.target.value })} placeholder="City, State" /></div>
        </div>
        <div className="row" style={{ marginTop: '1rem' }}>{f.photo ? <img className="avatar" src={f.photo} alt="Profile" /> : <div className="avatar avatar-placeholder">◎</div>}
          <input type="file" style={{ width: 'auto' }} accept="image/png,image/jpeg,image/webp" onChange={photo} /><span className="muted small">Optional · PNG/JPG/WEBP · 300KB max</span>
          {f.photo && <button type="button" className="btn sm ghost" onClick={() => edit({ photo: '' })}>Remove photo</button>}</div></Card>

      <div className="career-tabs">{f.careers.map((c, i) => { const ic = catalog.find((x) => x.name === c.field)?.icon || '✨'; return <button type="button" key={c.key} className={`career-tab ${i === active ? 'active' : ''}`} onClick={() => setActive(i)}><span className="em">{ic}</span><div><b>{c.field}</b><small>{c.jobTitle || 'Add target role'}</small></div></button>; })}
        <button type="button" className="career-tab add" onClick={() => setPicker(true)}><span className="em">＋</span><div><b>Add field</b></div></button></div>

      {!cur ? <Card className="state"><span className="big">🌱</span><h3>No career field yet</h3><p className="muted">Pick the field(s) you work in to start building resumes and getting matches.</p><button type="button" className="btn" onClick={() => setPicker(true)}>Choose fields</button></Card> : <div key={cur.key} className="page-enter">
        <Card><div className="section-title"><div><span className="eyebrow">CAREER {active + 1} OF {f.careers.length}</span><h2 style={{ margin: 0 }}>{cat?.icon} {cur.field}</h2></div>
          <div className="row"><Link className="btn sm soft" to={`/resumes/new?field=${cur.key}`}><Icon n="file" /> Make a resume</Link><button type="button" className="btn sm ghost" onClick={() => setDel(true)}><Icon n="trash" /> Remove field</button></div></div>
          <div className="form-grid">
            <div><label>Current / target job title</label><input value={cur.jobTitle} onChange={(e) => setCareer({ jobTitle: e.target.value })} placeholder={cat?.roles?.[0] ? `e.g. ${cat.roles[0]}` : 'Your job title'} /></div>
            <div><label>Experience level</label><select value={cur.preferences.experienceLevel} onChange={(e) => setPref('experienceLevel', e.target.value)}><option value="fresher">Fresher (0 yrs)</option><option value="junior">Junior (1–2 yrs)</option><option value="mid">Mid (3–4 yrs)</option><option value="senior">Senior (5+ yrs)</option></select></div>
            <div className="wide"><label>Roles you want to apply for</label><TagInput value={cur.targetRoles} onChange={(v) => setCareer({ targetRoles: v })} placeholder="Type a role and press Enter" suggestions={cat?.roles} /></div>
            <div className="wide"><label>Professional summary</label><textarea rows="4" value={cur.headline} onChange={(e) => setCareer({ headline: e.target.value })} placeholder="Describe your experience, strengths and the work you want." /></div>
          </div></Card>
        <Card><div className="section-title"><div><h3>Skills for {cur.field}</h3><span className="muted small">Type and press Enter, or tap a suggestion. These drive your job match score.</span></div></div>
          <div className="form-grid">{SK.map(([k, label, ph]) => <div key={k}><label>{label}</label><TagInput value={cur.skills[k]} onChange={(v) => setCareer({ skills: { ...cur.skills, [k]: v } })} placeholder={ph}
            suggestions={k === 'core' ? cat?.skills?.core : k === 'tools' ? cat?.skills?.tools : k === 'soft' ? s.data.softSkills : []} /></div>)}</div></Card>
        <div className="two-cards">
          <ListEditor icon="🎓" title="Education" fields={[['degree', 'Degree / Course'], ['college', 'College / Institution'], ['university', 'University / Board'], ['graduationYear', 'Year'], ['score', 'CGPA / Percentage']]} items={cur.education} onChange={(v) => setCareer({ education: v })} />
          <ListEditor icon="💼" title="Experience" fields={[['role', 'Role'], ['company', 'Organization'], ['duration', 'Duration (e.g. 2021 – 2024)'], ['description', 'What you did (start lines with - for bullets)']]} items={cur.experience} onChange={(v) => setCareer({ experience: v })} />
          <ListEditor icon="🧩" title="Projects / Work samples" fields={[['name', 'Name'], ['description', 'Description'], ['technologies', 'Skills / tools (comma separated)'], ['githubUrl', 'Project link'], ['liveUrl', 'Portfolio / live link']]} items={cur.projects} onChange={(v) => setCareer({ projects: v })} />
          <ListEditor icon="📜" title="Certifications" fields={[['name', 'Certification'], ['issuer', 'Issuer'], ['date', 'Date'], ['credentialUrl', 'Credential link']]} items={cur.certifications} onChange={(v) => setCareer({ certifications: v })} />
          <ListEditor icon="🏆" title="Achievements" fields={[['title', 'Achievement'], ['description', 'Description'], ['date', 'Date']]} items={cur.achievements} onChange={(v) => setCareer({ achievements: v })} />
          <ListEditor icon="➕" title="Custom sections" hint="Languages, volunteering, publications…" fields={[['title', 'Section title'], ['content', 'Content']]} items={cur.customSections} onChange={(v) => setCareer({ customSections: v })} />
        </div>
        <Card style={{ marginTop: '1rem' }}><h3>Job preferences for this field</h3><div className="form-grid">
          <div><label>Work mode</label><select value={cur.preferences.workMode} onChange={(e) => setPref('workMode', e.target.value)}>{['any', 'remote', 'hybrid', 'onsite'].map((x) => <option key={x}>{x}</option>)}</select></div>
          <div><label>Sector</label><select value={cur.preferences.sector} onChange={(e) => setPref('sector', e.target.value)}><option value="both">Government + Private</option><option value="government">Government</option><option value="private">Private</option></select></div>
          <div className="wide"><label>Preferred locations</label><TagInput value={cur.preferences.preferredLocations} onChange={(v) => setPref('preferredLocations', v)} placeholder="Chennai, Remote, Bengaluru…" /></div></div></Card>
      </div>}
      <div className="sticky-save">{dirty && <i className="dirty" />}<button className="btn" type="submit" disabled={saving || !dirty}>{saving ? 'Saving…' : 'Save all career details'}</button><span>{dirty ? 'You have unsaved changes' : 'All changes saved'}</span></div>
    </form>

    {picker && <Modal onClose={() => setPicker(false)}><h2>Add career fields</h2><p className="muted">Choose one or more. Fields you already have are greyed out.</p>
      <FieldPicker catalog={catalog} selected={pick} taken={taken} onToggle={(n) => setPick((x) => (x.includes(n) ? x.filter((y) => y !== n) : [...x, n]))} />
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: '1.2rem' }}><button className="btn ghost" onClick={() => setPicker(false)}>Cancel</button><button className="btn" disabled={!pick.length} onClick={addFields}>Add {pick.length || ''} {pick.length === 1 ? 'field' : 'fields'}</button></div></Modal>}
    {del && <Confirm title={`Remove ${cur?.field}?`} text="This removes the field from your profile once you click Save. Resumes you already made for it are kept." yes="Remove" onYes={removeCareer} onClose={() => setDel(false)} />}
  </>}</Async>;
}
