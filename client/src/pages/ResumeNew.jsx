import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import TemplateGrid from '../components/TemplateGrid';
import { FitPreview } from '../components/Resume';
import { Async, Card } from '../components/UI';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { careerToData } from '../lib';
import { useAuth } from '../context/AuthContext';
import api, { errMsg } from '../services/api';

// Create a new resume: 1 field -> 2 role / title -> 3 template (live preview with YOUR data)
export default function ResumeNew() {
  const [qs] = useSearchParams(), nav = useNavigate(), toast = useToast(), { user } = useAuth();
  const p = useFetch('/profile'), t = useFetch('/resume/templates'), job = useFetch(`/jobs/${qs.get('job')}`, undefined, { skip: !qs.get('job') });
  const [fieldKey, setFieldKey] = useState(qs.get('field') || ''), [title, setTitle] = useState(''), [role, setRole] = useState(''), [tpl, setTpl] = useState(null), [busy, setBusy] = useState(false);
  const careers = p.data?.profile?.careerProfiles || [], c = careers.find((x) => x.key === fieldKey);
  const fileRef = useRef(null);

  useEffect(() => { if (careers.length && !c) setFieldKey(careers[0].key); }, [careers.length]); // eslint-disable-line
  useEffect(() => { if (t.data && !tpl) setTpl(t.data.templates.find((x) => x.key === 'aurora') || t.data.templates[0]); }, [t.data, tpl]);
  useEffect(() => { const j = job.data?.job; if (j) { setRole(j.title); if (job.data.matches?.[0] && !qs.get('field')) setFieldKey(job.data.matches[0].fieldKey); } }, [job.data]); // eslint-disable-line

  const data = useMemo(() => { if (!c) return null; const d = careerToData(user, p.data.profile, c); if (role) d.jobTitle = role; return d; }, [c, role, user, p.data]);
  const create = async () => {
    setBusy(true);
    try { const { data: r } = await api.post('/resume', { fieldKey, template: tpl._id, targetRole: role, title: title || undefined, jobId: qs.get('job') || undefined }); toast('Resume created ✓'); nav(`/resumes/${r.resume._id}`); }
    catch (e) { toast(errMsg(e), 'error'); setBusy(false); }
  };
  const upload = async (e) => {
    const file = e.target.files[0]; if (!file) return; setBusy(true);
    const fd = new FormData(); fd.append('resume', file); fd.append('fieldKey', fieldKey);
    try { const { data: r } = await api.post('/resume/import', fd); toast(`Imported — ${r.extracted.skills.length} skills found. Please review.`); nav(`/resumes/${r.resume._id}`); } catch (er) { toast(errMsg(er), 'error'); setBusy(false); }
  };
  if (p.data && !careers.length) return <Card className="state"><span className="big">🌱</span><h3>Add a career field first</h3><p className="muted">Your resume is built from your Career Profile.</p><Link className="btn" to="/onboarding">Choose fields</Link></Card>;

  return <Async state={{ loading: p.loading || t.loading, error: p.error || t.error, reload: p.reload, data: p.data && t.data }}>{c && tpl && <>
    <div className="page-heading"><div><p className="eyebrow">NEW RESUME</p><h1>Create a resume</h1>{job.data?.job && <p className="muted">Tailored for <b>{job.data.job.title}</b> at {job.data.job.company}</p>}</div>
      <Link className="btn ghost" to="/resumes">← All resumes</Link></div>
    <div className="new-layout">
      <div>
        <div className="num-title" style={{ marginTop: 0 }}><i>1</i><h2>Which career is this resume for?</h2></div>
        <div className="field-grid">{careers.map((x) => <button type="button" key={x.key} className={`field-card ${x.key === fieldKey ? 'on' : ''}`} onClick={() => setFieldKey(x.key)}><span className="em">{p.data.catalog.find((f) => f.name === x.field)?.icon || '✨'}</span><span>{x.field}<small style={{ display: 'block', color: 'var(--muted)', fontWeight: 500 }}>{x.jobTitle || 'No title yet'}</small></span></button>)}</div>
        <div className="num-title"><i>2</i><h2>Which role is it for? <span className="muted small" style={{ fontWeight: 500 }}>(optional)</span></h2></div>
        <div className="form-grid"><div><label>Target role (shown under your name)</label><input value={role} onChange={(e) => setRole(e.target.value)} placeholder={c.targetRoles[0] || c.jobTitle || 'e.g. School Teacher'} list="roles" />
          <datalist id="roles">{[...c.targetRoles, ...(p.data.catalog.find((f) => f.name === c.field)?.roles || [])].map((r) => <option key={r} value={r} />)}</datalist></div>
          <div><label>Resume name</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`${role || c.jobTitle || c.field} Resume`} /></div></div>
        <div className="num-title"><i>3</i><h2>Choose a template</h2></div>
        <TemplateGrid templates={t.data.templates} value={tpl._id} onChange={setTpl} data={data} field={c.field} />
        <div className="row" style={{ marginTop: '1.4rem' }}><button className="btn lg" disabled={busy} onClick={create}>{busy ? 'Creating…' : 'Create resume'} <Icon n="arrow" /></button>
          <button className="btn lg ghost" disabled={busy} onClick={() => fileRef.current.click()}><Icon n="upload" /> Import PDF / DOCX instead</button><input ref={fileRef} type="file" hidden accept=".pdf,.docx" onChange={upload} /></div>
      </div>
      <div className="sticky-pv"><div className="pv-bar"><span>Live preview</span><span className="muted small">{tpl.name}</span></div><FitPreview data={data} template={tpl} order={tpl.defaultOrder} /></div>
    </div></>}</Async>;
}
