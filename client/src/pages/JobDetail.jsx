import { Link, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { Async, Badge, Card, ProgressBar, Ring } from '../components/UI';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import { colorFor, fmtDate } from '../lib';
import api, { errMsg } from '../services/api';

const NA = <span className="muted">Not specified</span>;
const STAT = ['saved', 'applied', 'interview', 'offer', 'rejected'];

export default function JobDetail() {
  const { id } = useParams(), s = useFetch(`/jobs/${id}`), toast = useToast(), { job, match, matches = [], application } = s.data || {};
  const rows = job && [['Organization', job.company], ['Category', job.sector === 'government' ? 'Government' : 'Private'], ['Level', job.level ? `${job.level === 'central' ? 'Central' : 'State'}${job.state ? ` · ${job.state}` : ''}` : null],
    ['Location', job.location], ['Vacancies', job.vacancies], ['Qualification', job.qualification], ['Eligibility', job.eligibility],
    ['Salary', job.salaryText || (job.salary?.min ? `₹${Math.round(job.salary.min).toLocaleString()} – ₹${Math.round(job.salary.max || job.salary.min).toLocaleString()}` : null)],
    ['Application start', fmtDate(job.applicationStart)], ['Application deadline', fmtDate(job.applicationDeadline)], ['Published', fmtDate(job.postedDate)],
    ['Source website', job.sourceSite && <a href={job.sourceSite} target="_blank" rel="noreferrer">{job.sourceSite}</a>]];
  const setStatus = async (status) => { try { await api.post('/applications', { job: id, status }); toast(status === 'saved' ? 'Saved ♥' : `Marked as ${status}`); s.reload(); } catch (e) { toast(errMsg(e), 'error'); } };
  const unsave = async () => { await api.delete(`/applications/job/${id}`); toast('Removed', 'info'); s.reload(); };
  return <Async state={s}>{job && <>
    <Link className="muted small" to="/jobs">← Back to jobs</Link>
    <div className="page-heading" style={{ marginTop: '.6rem' }}>
      <div className="row" style={{ alignItems: 'flex-start', gap: '1rem' }}><div className="logo" style={{ background: colorFor(job.company || job.title), width: 56, height: 56, borderRadius: 16, display: 'grid', placeItems: 'center', color: '#fff', font: '800 1.4rem var(--font-display)' }}>{(job.company || job.title)[0]}</div>
        <div><h1 style={{ marginBottom: '.3rem' }}>{job.title}</h1><div className="chips" style={{ margin: 0 }}><Badge tone={job.sector === 'government' ? 'amber' : 'green'}>{job.sector === 'government' ? 'Government' : 'Private'}</Badge><Badge>{job.source}</Badge>{(job.fields || []).map((f) => <Badge key={f} tone="hot">{f.split(' / ')[0]}</Badge>)}</div></div></div>
      <div className="row">
        {job.notificationUrl && <a className="btn ghost" href={job.notificationUrl} target="_blank" rel="noopener noreferrer">Official notification</a>}
        {job.applicationUrl ? <a className="btn" href={job.applicationUrl} target="_blank" rel="noopener noreferrer">Apply now <Icon n="arrow" /></a> : <span className="muted small">Application link not available</span>}</div></div>

    <Card className="tint"><div className="row between"><div className="row"><b>Your progress:</b>
      {application ? <select style={{ width: 'auto' }} value={application.status} onChange={(e) => setStatus(e.target.value)}>{STAT.map((x) => <option key={x}>{x}</option>)}</select> : <button className="btn sm" onClick={() => setStatus('saved')}><Icon n="heart" /> Save this job</button>}
      {application && <button className="btn sm ghost" onClick={unsave}>Remove</button>}</div>
      <Link className="btn soft" to={`/resumes/new?job=${job._id}${match?.fieldKey ? `&field=${match.fieldKey}` : ''}`}><Icon n="file" /> Create a resume for this job</Link></div></Card>

    <div className="grid">
      <Card><div className="row between"><h3>Your match</h3><Ring value={match.score} size={64} /></div>
        {match.field ? <p className="muted small">Best fit as <b>{match.field}</b>. Based on your skills, target roles, field, experience level and location.{!match.skillsListed && ' This posting lists no skills, so skills are left out of the score.'}</p> : <p className="muted small">Add a career field in your profile to see a match score.</p>}
        {Object.entries(match.breakdown || {}).filter(([, v]) => v !== null).map(([k, v]) => <ProgressBar key={k} label={k} value={v} />)}
        {matches.length > 1 && <><h4 style={{ marginTop: '1rem' }}>By career field</h4>{matches.map((m) => <ProgressBar key={m.fieldKey} label={m.field.split(' / ')[0]} value={m.score} />)}</>}</Card>
      <Card><h3>Required skills</h3>{job.skills?.length ? <><div className="chips">{match.matchedSkills.map((k) => <Badge key={k} tone="green">✓ {k}</Badge>)}{match.missingSkills.map((k) => <Badge key={k} tone="amber">⚠ {k}</Badge>)}</div>
        <p className="muted">{match.missingSkills.length ? `You could improve: ${match.missingSkills.join(', ')}.` : 'Your profile covers all listed skills.'}</p><Link to={`/skill-gap/${job._id}`}>Skill-gap details →</Link></> : <p className="muted">Not listed in this posting.</p>}</Card>
    </div>
    <Card><h3>Details</h3><div className="facts">{rows.map(([k, v]) => <div key={k}><span className="muted small">{k}</span><b>{v || NA}</b></div>)}</div></Card>
    {job.importantDates?.length > 0 && <Card><h3>Important dates</h3>{job.importantDates.map((d) => <p key={d.label}><b>{d.label}:</b> {fmtDate(d.date)}</p>)}</Card>}
    <Card><h3>Description</h3><p style={{ whiteSpace: 'pre-line' }}>{job.description || NA}</p>{job.responsibilities?.length > 0 && <ul>{job.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>}</Card></>}</Async>;
}
