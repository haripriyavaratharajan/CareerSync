import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { Async, Card, Confirm, EmptyState, ProgressBar } from '../components/UI';
import { Thumb } from '../components/Resume';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { fmtDate } from '../lib';
import api, { errMsg } from '../services/api';

// Gallery of ALL resumes – any number, in any field.
export default function Resumes() {
  const s = useFetch('/resume'), p = useFetch('/profile'), nav = useNavigate(), toast = useToast();
  const [tab, setTab] = useState(''), [del, setDel] = useState(null);
  const list = s.data?.resumes || [], fields = [...new Set(list.map((r) => r.field))];
  const shown = tab ? list.filter((r) => r.field === tab) : list;
  const dup = async (r) => { try { await api.post(`/resume/${r._id}/duplicate`); toast('Resume duplicated'); s.reload(); } catch (e) { toast(errMsg(e), 'error'); } };
  const remove = async (r) => { try { await api.delete(`/resume/${r._id}`); toast('Resume deleted'); s.reload(); } catch (e) { toast(errMsg(e), 'error'); } };
  const noFields = p.data && !p.data.profile.careerProfiles.length;
  return <>
    <div className="page-heading"><div><p className="eyebrow">RESUME STUDIO</p><h1>My Resumes</h1><p className="muted">Make as many as you like: one per field, one per job role, or one tailored to a specific job. Pick a template for each.</p></div>
      <Link className="btn lg" to="/resumes/new"><Icon n="plus" /> New resume</Link></div>
    {noFields && <Card className="tint"><b>Add a career field first.</b> <span className="muted">Resumes are built from your Career Profile.</span> <Link to="/onboarding">Choose fields →</Link></Card>}
    {fields.length > 1 && <div className="tabs"><button className={!tab ? 'on' : ''} onClick={() => setTab('')}>All ({list.length})</button>{fields.map((f) => <button key={f} className={tab === f ? 'on' : ''} onClick={() => setTab(f)}>{f.split(' / ')[0]} ({list.filter((r) => r.field === f).length})</button>)}</div>}
    <Async state={s}>
      <div className="res-grid stagger">
        <Link to="/resumes/new" className="res-new" style={{ '--i': 0 }}><div><i><Icon n="plus" /></i>Create a new resume<br /><span className="muted small" style={{ fontWeight: 500 }}>Choose field · template · role</span></div></Link>
        {shown.map((r, i) => <Card key={r._id} className="res-card lift" style={{ '--i': i + 1 }}>
          <div className="pv"><Thumb data={r.data} template={r.template} order={r.sectionOrder} width={190} />
            <div className="over"><Link className="btn sm" to={`/resumes/${r._id}`}><Icon n="edit" /> Open</Link><button className="icon-btn" style={{ background: '#fff' }} title="Duplicate" onClick={() => dup(r)}><Icon n="copy" /></button><button className="icon-btn" style={{ background: '#fff' }} title="Delete" onClick={() => setDel(r)}><Icon n="trash" /></button></div></div>
          <div><h3>{r.title}</h3><div className="meta"><span>{r.field.split(' / ')[0]} · {r.template?.name}</span><span>{fmtDate(r.updatedAt)}</span></div></div>
          <ProgressBar value={r.score?.total || 0} />
        </Card>)}
      </div>
      {!list.length && !s.loading && <p className="muted" style={{ textAlign: 'center', marginTop: '1.5rem' }}>No resumes yet — click “Create a new resume”.</p>}
    </Async>
    {del && <Confirm title="Delete this resume?" text={`“${del.title}” will be permanently deleted. Your profile is not affected.`} onYes={() => remove(del)} onClose={() => setDel(null)} />}
  </>;
}
