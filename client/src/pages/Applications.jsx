import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { Async, Card, EmptyState } from '../components/UI';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import api, { errMsg } from '../services/api';

const COLS = [['saved', '♥ Saved'], ['applied', 'Applied'], ['interview', 'Interview'], ['offer', 'Offer'], ['rejected', 'Rejected']];
export default function Applications() {
  const s = useFetch('/applications'), toast = useToast(), apps = s.data?.applications || [], [over, setOver] = useState('');
  const move = async (id, status) => {
    s.setData((d) => ({ ...d, applications: d.applications.map((a) => (a._id === id ? { ...a, status } : a)) })); // instant
    try { await api.put(`/applications/${id}`, { status }); } catch (e) { toast(errMsg(e), 'error'); s.reload(); }
  };
  const del = async (id) => { await api.delete(`/applications/${id}`); toast('Removed', 'info'); s.reload(); };
  const drop = (e, c) => { e.preventDefault(); setOver(''); const id = e.dataTransfer.getData('text/plain'); if (id) move(id, c); };
  return <>
    <div className="page-heading"><div><p className="eyebrow">STAY ORGANISED</p><h1>Job tracker</h1><p className="muted">Saved jobs land in the first column. Drag cards across as you apply, interview and get offers.</p></div><Link className="btn" to="/jobs"><Icon n="search" /> Find more jobs</Link></div>
    <Async state={s} empty={!apps.length && <EmptyState icon="♥" title="Nothing saved yet" hint="Tap the heart on any job to save it here."><Link className="btn" to="/jobs">Browse jobs</Link></EmptyState>}>
      <div className="kanban">{COLS.map(([c, label]) => <div key={c} className={`kcol ${over === c ? 'over' : ''}`} onDragOver={(e) => { e.preventDefault(); setOver(c); }} onDragLeave={() => setOver('')} onDrop={(e) => drop(e, c)}>
        <h3>{label.toUpperCase()} <span>{apps.filter((a) => a.status === c).length}</span></h3>
        {apps.filter((a) => a.status === c).map((a) => <div key={a._id} className="kcard" draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', a._id)}>
          <Link to={`/jobs/${a.job._id}`}><b style={{ color: 'var(--ink)' }}>{a.job.title}</b></Link><div className="muted small">{a.job.company}</div>
          <select value={a.status} onChange={(e) => move(a._id, e.target.value)} aria-label="Status">{COLS.map(([x, l]) => <option key={x} value={x}>{x}</option>)}</select>
          <button className="btn sm ghost" onClick={() => del(a._id)}>Remove</button></div>)}</div>)}</div>
    </Async></>;
}
