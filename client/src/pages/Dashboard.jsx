import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import JobCard from '../components/JobCard';
import { Async, Card, CountUp, EmptyState, ProgressBar, Ring } from '../components/UI';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api, { errMsg } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth(), toast = useToast();
  const p = useFetch('/profile'), m = useFetch('/jobs', { sort: 'match', minScore: 1 }), a = useFetch('/applications'), r = useFetch('/resume'), n = useFetch('/notifications');
  const all = [p, m, a, r, n], state = { loading: all.some((x) => x.loading), data: all.every((x) => x.data) ? 1 : null, error: all.find((x) => x.error)?.error, reload: () => all.forEach((x) => x.reload()) };
  if (!state.data) return <Async state={state} />; // data not ready yet: loader / error
  const careers = p.data?.profile?.careerProfiles || [], top = (m.data?.jobs || []).slice(0, 3), resumes = r.data?.resumes || [];
  const gaps = [...new Set(top.flatMap((j) => j.match.missingSkills))].slice(0, 6), good = (m.data?.jobs || []).filter((j) => j.match.score >= 60).length;
  const save = async (job) => { try { if (job.tracked) await api.delete(`/applications/job/${job._id}`); else await api.post('/applications', { job: job._id }); toast(job.tracked ? 'Removed' : 'Saved ♥'); m.reload(); a.reload(); } catch (e) { toast(errMsg(e), 'error'); } };
  const hour = new Date().getHours(), hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return <>
    <div className="page-heading"><div><p className="eyebrow">YOUR CAREER HQ</p><h1>{hello}, <span className="grad-text">{user.name.split(' ')[0]}</span></h1><p className="muted">Here is where your careers stand today.</p></div>
      <div className="row"><Link className="btn ghost" to="/jobs"><Icon n="search" /> Find jobs</Link><Link className="btn" to="/resumes/new"><Icon n="plus" /> New resume</Link></div></div>

    {!careers.length && <Card className="tint"><div className="row between"><div><h3>🌱 Start here: choose your career field(s)</h3><p className="muted" style={{ margin: 0 }}>Pick every field you work in. You can add more later.</p></div><Link className="btn" to="/onboarding">Choose fields <Icon n="arrow" /></Link></div></Card>}

    <div className="grid stats stagger">
      <Card className="lift" style={{ '--i': 0 }}><ProgressBar label="Profile" value={p.data.completion.percent} /><span className="muted small">Completeness across all fields</span></Card>
      <Card className="lift" style={{ '--i': 1 }}><div className="row between"><div><h1 style={{ margin: 0 }}><CountUp to={careers.length} /></h1><span className="muted">Career fields</span></div><span style={{ fontSize: '2rem' }}>🧭</span></div></Card>
      <Card className="lift" style={{ '--i': 2 }}><div className="row between"><div><h1 style={{ margin: 0 }}><CountUp to={resumes.length} /></h1><span className="muted">Resumes made</span></div><span style={{ fontSize: '2rem' }}>📄</span></div></Card>
      <Card className="lift" style={{ '--i': 3 }}><div className="row between"><div><h1 style={{ margin: 0 }}><CountUp to={good} /></h1><span className="muted">Strong matches (60%+)</span></div><span style={{ fontSize: '2rem' }}>🎯</span></div></Card>
      <Card className="lift" style={{ '--i': 4 }}><div className="row between"><div><h1 style={{ margin: 0 }}><CountUp to={a.data.applications.length} /></h1><span className="muted">Saved / tracked jobs</span></div><span style={{ fontSize: '2rem' }}>♥</span></div></Card>
    </div>

    {careers.length > 0 && <><h2>Your careers</h2><div className="grid stagger">{careers.map((c, i) => { const rs = resumes.filter((x) => x.careerFieldKey === c.key).length; const ic = p.data.catalog.find((x) => x.name === c.field)?.icon; return <Card key={c.key} className="lift" style={{ '--i': i }}><div className="row between"><div><h3>{ic} {c.field}</h3><span className="muted small">{c.jobTitle || 'Add a target role'}</span></div><Ring value={Math.min(100, Object.values(c.skills || {}).flat().length * 10)} size={50}>{Object.values(c.skills || {}).flat().length}</Ring></div>
      <div className="chips"><span className="badge">{rs} resume{rs === 1 ? '' : 's'}</span><span className="badge">{c.targetRoles?.length || 0} target roles</span></div><div className="row"><Link className="btn sm soft" to="/profile">Edit</Link><Link className="btn sm" to={`/resumes/new?field=${c.key}`}>+ Resume</Link><Link className="btn sm ghost" to={`/jobs?field=${encodeURIComponent(c.field)}`}>Jobs</Link></div></Card>; })}</div></>}

    <div className="row between"><h2>Top matches for you</h2><Link to="/matches">See all →</Link></div>
    <div className="grid stagger">{top.length ? top.map((j, i) => <JobCard key={j._id} job={j} i={i} onToggle={save} />) : <EmptyState icon="🔎" title="No matches yet" hint="Complete your Career Profile, then search for roles or sync job sources.">{<Link className="btn" to="/jobs">Find jobs</Link>}</EmptyState>}</div>
    <div className="grid">
      <Card><h3>Skills to improve</h3>{gaps.length ? <div className="chips">{gaps.map((g) => <span key={g} className="badge amber">⚠ {g}</span>)}</div> : <p className="muted">Nothing missing in your top matches 🎉</p>}<Link to="/skill-gap">Full analysis →</Link></Card>
      <Card><h3>Recent notifications</h3>{n.data.notifications.length ? n.data.notifications.slice(0, 3).map((x) => <p key={x._id}>🔔 <b>{x.title}</b><br /><span className="muted small">{x.message}</span></p>) : <p className="muted">Nothing yet. Match alerts appear here.</p>}</Card>
    </div>
  </>;
}
