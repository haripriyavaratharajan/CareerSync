import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import TemplateGrid from '../components/TemplateGrid';
import { FitPreview, PrintPortal } from '../components/Resume';
import { Async, Card, Confirm, ListEditor, Ring, TagInput } from '../components/UI';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { SECTIONS, SECTION_LABELS } from '../lib';
import api, { errMsg } from '../services/api';

// Edit one resume: content, template, section order. Then save and download as PDF.
export default function ResumeEditor() {
  const { id } = useParams(), nav = useNavigate(), toast = useToast();
  const s = useFetch(`/resume/${id}`), t = useFetch('/resume/templates');
  const [r, setR] = useState(null), [dirty, setDirty] = useState(false), [saving, setSaving] = useState(false), [del, setDel] = useState(false);
  const loaded = useRef(null);
  useEffect(() => { if (s.data?.resume && loaded.current !== s.data.resume._id) { loaded.current = s.data.resume._id; setR(s.data.resume); setDirty(false); } }, [s.data]);
  useEffect(() => { const w = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', w); return () => window.removeEventListener('beforeunload', w); }, [dirty]);
  useEffect(() => { const k = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); document.getElementById('save-btn')?.click(); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);

  const upd = (patch) => { setR((x) => ({ ...x, ...patch })); setDirty(true); };
  const setData = (patch) => upd({ data: { ...r.data, ...patch } });
  const order = r?.sectionOrder?.length ? r.sectionOrder : SECTIONS;
  const move = (i, d) => { const o = [...order]; [o[i], o[i + d]] = [o[i + d], o[i]]; upd({ sectionOrder: o }); };
  const toggle = (k) => upd({ sectionOrder: order.includes(k) ? order.filter((x) => x !== k) : [...order, k] });
  const pickTemplate = (tp) => upd({ template: tp, sectionOrder: r.sectionOrder?.length ? r.sectionOrder : tp.defaultOrder });

  const save = async () => {
    setSaving(true);
    try { const { data } = await api.put(`/resume/${id}`, { title: r.title, targetRole: r.targetRole, template: r.template._id, sectionOrder: order, data: r.data }); setR(data.resume); setDirty(false); toast('Resume saved ✓'); }
    catch (e) { toast(errMsg(e), 'error'); } finally { setSaving(false); }
  };
  const syncProfile = async () => { try { const { data } = await api.post(`/resume/${id}/sync`); setR(data.resume); setDirty(false); toast('Updated from your Career Profile'); } catch (e) { toast(errMsg(e), 'error'); } };
  const dup = async () => { try { const { data } = await api.post(`/resume/${id}/duplicate`); toast('Duplicated — you are now editing the copy'); nav(`/resumes/${data.resume._id}`); } catch (e) { toast(errMsg(e), 'error'); } };
  const remove = async () => { try { await api.delete(`/resume/${id}`); toast('Resume deleted'); nav('/resumes'); } catch (e) { toast(errMsg(e), 'error'); } };
  const print = () => { if (dirty) toast('Tip: save first so the PDF matches your latest edits', 'info'); setTimeout(() => window.print(), 50); };

  const d = r?.data || {};
  return <Async state={{ loading: s.loading || t.loading, error: s.error || t.error, reload: s.reload, data: r && t.data }}>{r && t.data && <>
    <div className="ed-bar">
      <Link className="icon-btn" to="/resumes" aria-label="Back"><Icon n="arrow" style={{ transform: 'scaleX(-1)' }} className="ico" /></Link>
      <input className="title" value={r.title} onChange={(e) => upd({ title: e.target.value })} aria-label="Resume name" />
      <span className="badge hot">{r.field.split(' / ')[0]}</span>
      {dirty && <span className="live-dot" style={{ background: 'var(--sun)' }} title="Unsaved changes" />}
      <button className="btn sm ghost" onClick={syncProfile} title="Re-import details from your Career Profile (replaces edits)"><Icon n="refresh" /> Refresh from profile</button>
      <button className="icon-btn" title="Duplicate" onClick={dup}><Icon n="copy" /></button><button className="icon-btn" title="Delete" onClick={() => setDel(true)}><Icon n="trash" /></button>
      <button id="save-btn" className="btn sm" onClick={save} disabled={saving || !dirty}>{saving ? 'Saving…' : 'Save'}</button>
      <button className="btn sm" onClick={print}><Icon n="download" /> Download PDF</button>
    </div>
    <div className="editor">
      <div className="ed-panel">
        <Card className="flat"><div className="row between"><div><h3 style={{ margin: 0 }}>Resume score</h3><span className="muted small">A completeness guide, not an ATS guarantee</span></div><Ring value={r.score?.total || 0} size={62} /></div>
          {r.score?.breakdown?.map((b) => <p key={b.label} className="score-line">{b.passed ? '✅' : '⬜'} {b.label}</p>)}<p className="muted small" style={{ margin: 0 }}>Score updates when you save.</p></Card>

        <details className="acc" open><summary>🎨 Template</summary><div><TemplateGrid templates={t.data.templates} value={r.template?._id} onChange={pickTemplate} data={r.data} field={r.field} /></div></details>
        <details className="acc"><summary>👤 Header &amp; summary</summary><div className="form-grid">
          <div><label>Name</label><input value={d.name || ''} onChange={(e) => setData({ name: e.target.value })} /></div>
          <div><label>Role shown under name</label><input value={d.jobTitle || ''} onChange={(e) => setData({ jobTitle: e.target.value })} /></div>
          <div><label>Email</label><input value={d.email || ''} onChange={(e) => setData({ email: e.target.value })} /></div>
          <div><label>Phone</label><input value={d.phone || ''} onChange={(e) => setData({ phone: e.target.value })} /></div>
          <div className="wide"><label>Location</label><input value={d.location || ''} onChange={(e) => setData({ location: e.target.value })} /></div>
          <div className="wide"><label>Summary</label><textarea rows="5" value={d.summary || ''} onChange={(e) => setData({ summary: e.target.value })} /></div>
          <div className="wide row"><label style={{ margin: 0 }}><input type="checkbox" checked={!!d.photo} disabled={!d.photo && !s.data?.resume?.data?.photo} onChange={(e) => setData({ photo: e.target.checked ? (s.data.resume.data.photo || '') : '' })} /> Show my profile photo</label></div></div></details>
        <details className="acc"><summary>⚡ Skills</summary><div><TagInput value={d.skills || []} onChange={(v) => setData({ skills: v })} placeholder="Add a skill" /></div></details>
        <details className="acc"><summary>📚 Sections: show, hide &amp; reorder</summary><div>
          {SECTIONS.map((k) => { const i = order.indexOf(k); return <div key={k} className={`sec-row ${i < 0 ? 'off' : ''}`}><label style={{ margin: 0 }}><input type="checkbox" checked={i >= 0} onChange={() => toggle(k)} /> {SECTION_LABELS[k]}</label>
            {i >= 0 && <span className="row" style={{ gap: '.3rem' }}><button className="icon-btn" style={{ width: 30, height: 30 }} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button><button className="icon-btn" style={{ width: 30, height: 30 }} disabled={i === order.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button></span>}</div>; })}
          <p className="muted small">In sidebar templates, Skills / Education / Certifications sit in the sidebar.</p></div></details>
        <details className="acc"><summary>💼 Experience</summary><div><ListEditor title="Experience" items={d.experience || []} fields={[['role', 'Role'], ['company', 'Organization'], ['duration', 'Duration'], ['description', 'Details (- for bullets)']]} onChange={(v) => setData({ experience: v })} /></div></details>
        <details className="acc"><summary>🎓 Education</summary><div><ListEditor title="Education" items={d.education || []} fields={[['degree', 'Degree'], ['college', 'Institution'], ['university', 'University'], ['graduationYear', 'Year'], ['score', 'Score']]} onChange={(v) => setData({ education: v })} /></div></details>
        <details className="acc"><summary>🧩 Projects / work samples</summary><div><ListEditor title="Projects" items={d.projects || []} fields={[['name', 'Name'], ['description', 'Description'], ['technologies', 'Skills / tools'], ['githubUrl', 'Link']]} onChange={(v) => setData({ projects: v })} /></div></details>
        <details className="acc"><summary>📜 Certifications &amp; 🏆 achievements</summary><div>
          <ListEditor title="Certifications" items={d.certifications || []} fields={[['name', 'Name'], ['issuer', 'Issuer'], ['date', 'Date']]} onChange={(v) => setData({ certifications: v })} />
          <ListEditor title="Achievements" items={d.achievements || []} fields={[['title', 'Achievement'], ['description', 'Details'], ['date', 'Date']]} onChange={(v) => setData({ achievements: v })} />
          <ListEditor title="Custom sections" items={d.customSections || []} fields={[['title', 'Title'], ['content', 'Content']]} onChange={(v) => setData({ customSections: v })} /></div></details>
      </div>
      <div><div className="pv-bar"><span>Live preview</span><span className="muted small">{r.template?.name} · A4</span></div><FitPreview data={r.data} template={r.template} order={order} /></div>
    </div>
    <PrintPortal data={r.data} template={r.template} order={order} title={r.title} />
    {del && <Confirm title="Delete this resume?" text={`“${r.title}” will be permanently deleted.`} onYes={remove} onClose={() => setDel(false)} />}</>}</Async>;
}
