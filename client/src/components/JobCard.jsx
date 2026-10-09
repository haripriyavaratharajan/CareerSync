import { Link } from 'react-router-dom';
import { Badge, Card, Ring } from './UI';
import Icon from './Icon';
import { colorFor, fmtDate } from '../lib';

export default function JobCard({ job, onToggle, i = 0 }) {
  const s = job.match?.score ?? 0, gov = job.sector === 'government', saved = !!job.tracked;
  return (
    <Card className="job lift" style={{ '--i': i % 12 }}>
      <div className="top">
        <div className="logo" style={{ background: colorFor(job.company || job.title) }}>{(job.company || job.title)[0]?.toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}><h3>{job.title}</h3><div className="meta">{job.company}{job.location ? ` · ${job.location}` : ''}{job.vacancies ? ` · ${job.vacancies} posts` : ''}</div></div>
        <div><Ring value={s} size={52}>{s}</Ring></div>
      </div>
      <div className="chips">
        <Badge tone={gov ? 'amber' : 'green'}>{gov ? `Government${job.level ? ` · ${job.level}` : ''}` : 'Private'}</Badge>
        {job.remoteType === 'remote' && <Badge tone="hot">Remote</Badge>}
        {job.fields?.[0] && <Badge>{job.fields[0].split(' / ')[0]}</Badge>}
        {job.applicationDeadline && <Badge tone="red">Closes {fmtDate(job.applicationDeadline)}</Badge>}
        {job.tracked && job.tracked !== 'saved' && <Badge tone="hot">{job.tracked}</Badge>}
        {(job.skills || []).slice(0, 3).map((k) => <Badge key={k}>{k}</Badge>)}
      </div>
      {job.match?.field && <div className="meta small">Best fit as <b style={{ color: 'var(--ink-2)' }}>{job.match.field.split(' / ')[0]}</b></div>}
      <div className="actions">
        <Link className="btn sm" to={`/jobs/${job._id}`}>View job <Icon n="arrow" /></Link>
        <Link className="btn sm soft" to={`/resumes/new?job=${job._id}${job.match?.fieldKey ? `&field=${job.match.fieldKey}` : ''}`} title="Create a resume tailored to this job"><Icon n="file" /> Resume</Link>
        <button className={`icon-btn heart ${saved ? 'on' : ''}`} style={{ marginLeft: 'auto' }} aria-label={saved ? 'Remove from saved' : 'Save job'} title={saved ? 'Saved — click to remove' : 'Save job'} onClick={() => onToggle(job)}><Icon n="heart" /></button>
      </div>
    </Card>
  );
}
