import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import JobCard from '../components/JobCard';
import { Async, Card, EmptyState, Spinner } from '../components/UI';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';
import api, { errMsg } from '../services/api';

export default function Jobs({ matchesOnly = false }) {
  const toast = useToast();
  const [q, setQ] = useState(''), [loc, setLoc] = useState(''), [f, setF] = useState({ field: '', fieldKey: '', remote: '', sector: '', level: '', source: '', tracked: '', sort: matchesOnly ? 'match' : '', minScore: matchesOnly ? '40' : '' });
  const [applied, setApplied] = useState({ q: '', loc: '' }), [online, setOnline] = useState(false), [over, setOver] = useState({});
  const prof = useFetch('/profile'), src = useFetch('/jobs/sources'), ss = useFetch('/saved-searches');
  const jobs = useFetch('/jobs', { q: applied.q, location: applied.loc, ...f });
  const careers = prof.data?.profile?.careerProfiles || [];
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const list = (jobs.data?.jobs || []).map((j) => (j._id in over ? { ...j, tracked: over[j._id] } : j));

  // default: score as the user's best field; "Score as" lets them judge every job as one specific career
  useEffect(() => { setOver({}); }, [jobs.data]);

  // Searching also asks the online job sources (Remotive, Adzuna) for the typed keywords, then refreshes the list.
  const search = async (e) => {
    e?.preventDefault(); const next = { q: q.trim(), loc: loc.trim() }; setApplied(next);
    if (!next.q) return;
    setOnline(true);
    try {
      const r = await api.post('/jobs/live', { q: next.q, location: next.loc });
      if (r.data.added > 0) { toast(`Found ${r.data.added} new job${r.data.added > 1 ? 's' : ''} online for “${next.q}”`); jobs.reload(); }
      else if (r.data.errors?.length && !r.data.cached) toast(`Online search: ${r.data.errors[0]}`, 'info');
    } catch (er) { toast(errMsg(er), 'error'); } finally { setOnline(false); }
  };
  const sync = async () => {
    setOnline(true);
    try { const r = await api.post('/jobs/sync'); const v = Object.values(r.data.report).filter((x) => x.added !== undefined); toast(`Sync done: ${v.reduce((n, x) => n + x.added, 0)} new jobs, ${v.filter((x) => x.status === 'error').length} sources unavailable`); jobs.reload(); src.reload(); }
    catch (e) { toast(errMsg(e), 'error'); } finally { setOnline(false); }
  };
  const toggle = async (job) => {
    const was = !!job.tracked; setOver((o) => ({ ...o, [job._id]: was ? null : 'saved' }));
    try { if (was) await api.delete(`/applications/job/${job._id}`); else await api.post('/applications', { job: job._id }); toast(was ? 'Removed from saved jobs' : 'Saved ♥ — find it under the Saved tab', was ? 'info' : 'ok'); }
    catch (e) { setOver((o) => ({ ...o, [job._id]: job.tracked })); toast(errMsg(e), 'error'); }
  };
  const saveSearch = async () => { try { await api.post('/saved-searches', { q: applied.q || q, location: applied.loc || loc, field: f.field, sector: f.sector, remote: f.remote, level: f.level }); toast('Search saved'); ss.reload(); } catch (e) { toast(errMsg(e), 'error'); } };
  const runSaved = (s) => { setQ(s.q); setLoc(s.location); setApplied({ q: s.q, loc: s.location }); setF((x) => ({ ...x, field: s.field, sector: s.sector, remote: s.remote, level: s.level })); };
  const delSaved = async (e, s) => { e.stopPropagation(); await api.delete(`/saved-searches/${s._id}`); ss.reload(); };
  const srcOk = src.data?.sources.filter((x) => x.status === 'ok').length || 0;

  return <>
    <div className="page-heading"><div><p className="eyebrow">{matchesOnly ? 'RANKED FOR YOU' : 'FIND YOUR NEXT ROLE'}</p><h1>{matchesOnly ? 'Your best matches' : 'Find jobs'}</h1>
      <p className="muted">Search any role in any field. Press Enter and CareerSync also looks online for it.</p></div>
      <button className="btn ghost" onClick={sync} disabled={online}>{online ? <Spinner /> : <Icon n="refresh" />} Sync all sources</button></div>

    <form className="searchbar" onSubmit={search}>
      <div className="in"><Icon n="search" /><input placeholder="Job title, skill or company — e.g. teacher, accountant, nurse" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search jobs" /></div>
      <div className="in" style={{ flex: '0 1 200px' }}><Icon n="pin" /><input placeholder="Location" value={loc} onChange={(e) => setLoc(e.target.value)} aria-label="Location" /></div>
      <button className="btn" disabled={online}>{online ? <Spinner /> : <Icon n="search" />} Search</button>
      <button type="button" className="btn soft" onClick={saveSearch} title="Save this search to come back to it"><Icon n="bookmark" /> Save search</button>
    </form>

    {(ss.data?.searches?.length > 0) && <div className="saved-searches"><span className="muted small" style={{ fontWeight: 700 }}>SAVED SEARCHES</span>{ss.data.searches.map((s) => <span key={s._id} className="ss" onClick={() => runSaved(s)} role="button" tabIndex={0}>{s.name}<button aria-label="Delete saved search" onClick={(e) => delSaved(e, s)}>✕</button></span>)}</div>}

    <div className="tabs" role="tablist">{[['', 'All jobs'], ['any', '♥ Saved & tracked'], ['applied', 'Applied']].map(([v, l]) => <button key={v} className={f.tracked === v ? 'on' : ''} onClick={() => setF({ ...f, tracked: v })}>{l}</button>)}</div>
    <div className="filters">
      <select value={f.field} onChange={set('field')} aria-label="Field"><option value="">All fields</option>{(prof.data?.fields || []).map((x) => <option key={x}>{x}</option>)}</select>
      {careers.length > 1 && <select value={f.fieldKey} onChange={set('fieldKey')} aria-label="Score as"><option value="">Score: my best field</option>{careers.map((c) => <option key={c.key} value={c.key}>Score as {c.field.split(' / ')[0]}</option>)}</select>}
      <select value={f.remote} onChange={set('remote')}><option value="">Any mode</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select>
      <select value={f.sector} onChange={set('sector')}><option value="">Gov + Private</option><option value="government">Government</option><option value="private">Private</option></select>
      <select value={f.level} onChange={set('level')}><option value="">Central + State</option><option value="central">Central</option><option value="state">State</option></select>
      <select value={f.source} onChange={set('source')}><option value="">All sources</option>{src.data?.sources.map((x) => <option key={x.key} value={x.key}>{x.name}</option>)}</select>
      <select value={f.sort} onChange={set('sort')}><option value="">Latest</option><option value="match">Best match</option><option value="deadline">Closing soonest</option></select>
      <select value={f.minScore} onChange={set('minScore')}><option value="">Any match %</option><option value="40">40%+</option><option value="60">60%+</option><option value="80">80%+</option></select>
    </div>

    <details className="card flat"><summary style={{ cursor: 'pointer' }}><b>Job sources</b> <span className="muted small">({srcOk} available)</span></summary>
      {src.data?.sources.length ? <div className="chips">{src.data.sources.map((x) => <span key={x.key} title={x.error || `${x.count} fetched`} className={`badge ${x.status === 'ok' ? 'green' : 'red'}`}>{x.name}: {x.status === 'ok' ? `${x.count} jobs` : 'unavailable'}</span>)}</div> : <p className="muted small">No sync has run yet. Use “Sync all sources”.</p>}
      <p className="muted small" style={{ margin: 0 }}>Tip: add free Adzuna keys in <code>server/.env</code> to get jobs for every profession (teaching, finance, healthcare, trades…). See README.</p></details>

    {jobs.data && <p className="muted small" style={{ margin: '.8rem 0' }}>Showing <b>{list.length}</b>{jobs.data.total > list.length ? ` of ${jobs.data.total}` : ''} jobs {jobs.loading && <Spinner />}</p>}
    <Async state={jobs} empty={jobs.data && list.length === 0 && <EmptyState title="No jobs match yet" hint="Try another keyword, clear a filter, or press Search to look online. Saved ♥ jobs appear under the Saved tab.">{f.tracked === '' && <button className="btn" onClick={sync}>Sync job sources</button>}</EmptyState>}>
      <div className="grid stagger">{list.map((j, i) => <JobCard key={j._id} job={j} i={i} onToggle={toggle} />)}</div>
    </Async>
  </>;
}
