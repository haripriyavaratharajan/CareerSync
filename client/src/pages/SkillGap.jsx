import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import useFetch from '../hooks/useFetch';
import { Async, Badge, Card, EmptyState, ProgressBar } from '../components/UI';

function Detail({ id }) {
  const s = useFetch(`/skill-gap/${id}`), d = s.data;
  return <Async state={s}>{d && <>
    <Link className="muted small" to="/skill-gap">← Back</Link><h1 style={{ marginTop: '.5rem' }}>Skill gap: {d.job.title}</h1>
    <Card><ProgressBar label="Your match" value={d.match.score} /><p className="muted">{d.match.matchedSkills.length} of {d.job.skills?.length || 0} listed skills matched{d.match.field ? ` · as ${d.match.field}` : ''}</p>
      {d.skills.length ? d.skills.map((k) => <ProgressBar key={k.name} label={`${k.name} (${k.status})`} value={k.level} />) : <p className="muted">This posting lists no specific skills.</p>}</Card>
    {d.recommendations.length > 0 && <><h2>Learning recommendations</h2><div className="grid stagger">{d.recommendations.map((r, i) => <Card key={r.skill} className="lift" style={{ '--i': i }}><h3>{r.skill}</h3><p className="muted small">{r.why}</p><p>{r.summary}</p><ul>{r.topics.map((t) => <li key={t}>{t}</li>)}</ul></Card>)}</div></>}</>}</Async>;
}
export default function SkillGap() {
  const { id } = useParams(), [fk, setFk] = useState(''), p = useFetch('/profile'), d = useFetch('/skill-gap', fk ? { fieldKey: fk } : undefined);
  if (id) return <Detail id={id} />;
  const careers = p.data?.profile?.careerProfiles || [];
  return <>
    <div className="page-heading"><div><p className="eyebrow">GROW FASTER</p><h1>Skill gap analysis</h1><p className="muted">Skills missing across your top {d.data?.jobs ?? 10} matches, ranked by demand.</p></div>
      {careers.length > 1 && <select style={{ width: 'auto' }} value={fk} onChange={(e) => setFk(e.target.value)}><option value="">All my fields</option>{careers.map((c) => <option key={c.key} value={c.key}>{c.field}</option>)}</select>}</div>
    <Async state={d} empty={d.data && !d.data.demand.length && <EmptyState icon="🎉" title="No gaps found" hint="Either your skills cover your top matches, or no jobs with listed skills exist yet. Search for roles on the Jobs page." />}>
      <div className="grid stagger">{d.data?.demand.map((x, i) => <Card key={x.skill} className="lift" style={{ '--i': i }}><h3>{x.skill}</h3><ProgressBar value={x.percent} /><p className="muted small">Missing in {x.percent}% of your top matches.</p><p>{x.summary}</p><ul>{x.topics.map((t) => <li key={t}>{t}</li>)}</ul></Card>)}</div>
      {d.data?.topJobs?.length > 0 && <><h2>Per-job analysis</h2><div className="grid stagger">{d.data.topJobs.map((j, i) => <Card key={j._id} className="lift" style={{ '--i': i }}><h3>{j.title}</h3><p className="muted small">{j.company}</p><ProgressBar value={j.match.score} /><Badge tone="amber">{j.match.missingSkills.length} to improve</Badge> <Link to={`/skill-gap/${j._id}`}>Analyse →</Link></Card>)}</div></>}
    </Async></>;
}
