import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { Async, Card, EmptyState } from '../components/UI';
import api from '../services/api';

export default function Notifications() {
  const s = useFetch('/notifications'), list = s.data?.notifications || [];
  const act = (fn) => fn().then(s.reload);
  return <>
    <div className="page-heading"><div><p className="eyebrow">ALERTS</p><h1>Notifications</h1></div><button className="btn ghost" onClick={() => act(() => api.put('/notifications/read-all'))}>Mark all as read</button></div>
    <Async state={s} empty={!list.length && <EmptyState icon="🔔" title="You're all caught up" hint="New job matches will appear here." />}>
      <div className="stagger">{list.map((n, i) => <Card key={n._id} style={{ '--i': i }} className={n.read ? '' : 'unread'}><div className="row between"><div><b>🔔 {n.title}</b><p className="muted small" style={{ margin: 0 }}>{n.message} · {new Date(n.createdAt).toLocaleString()}</p></div>
        <div className="row">{n.job && <Link className="btn sm soft" to={`/jobs/${n.job}`}>View job</Link>}{!n.read && <button className="btn sm ghost" onClick={() => act(() => api.put(`/notifications/${n._id}/read`))}>Read</button>}
          <button className="btn sm ghost" onClick={() => act(() => api.delete(`/notifications/${n._id}`))}>Delete</button></div></div></Card>)}</div>
    </Async></>;
}
