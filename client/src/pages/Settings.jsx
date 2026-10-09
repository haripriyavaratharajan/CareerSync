import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { Card } from '../components/UI';
import { useToast } from '../components/Toast';
import api, { errMsg } from '../services/api';

export default function Settings() {
  const { user, theme, toggleTheme } = useAuth(), p = useFetch('/profile'), [t, setT] = useState(70), toast = useToast();
  useEffect(() => { if (p.data) setT(p.data.profile.preferences?.matchThreshold ?? 70); }, [p.data]);
  const save = () => api.put('/profile', { preferences: { matchThreshold: Number(t) } }).then(() => toast('Saved ✓')).catch((e) => toast(errMsg(e), 'error'));
  return <>
    <div className="page-heading"><div><p className="eyebrow">PREFERENCES</p><h1>Settings</h1></div></div>
    <Card><h3>Account</h3><p><b>{user.name}</b> · {user.email}</p><button className="btn" onClick={toggleTheme}>Switch to {theme === 'light' ? 'dark' : 'light'} mode</button></Card>
    <Card><h3>Job match alerts</h3><p className="muted">Notify me when a new job matches at least <b>{t}%</b>.</p>
      <input type="range" min="30" max="100" value={t} onChange={(e) => setT(e.target.value)} aria-label="Match threshold" /><div style={{ marginTop: '.8rem' }}><button className="btn" onClick={save}>Save</button></div></Card>
  </>;
}
