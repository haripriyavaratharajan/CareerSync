import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Reveal, CountUp } from '../components/UI';
import { Thumb } from '../components/Resume';
import Icon from '../components/Icon';
import { SAMPLE } from '../lib';

const WORDS = ['Teacher', 'Accountant', 'Nurse', 'Engineer', 'Designer', 'Developer', 'Marketer', 'Chef', 'Lawyer', 'Trainer'];
const FIELDS = [['💻', 'Software'], ['🎓', 'Teaching'], ['🩺', 'Healthcare'], ['💰', 'Finance'], ['⚙️', 'Engineering'], ['🎨', 'Design'], ['📣', 'Marketing'], ['⚖️', 'Legal'], ['🏛️', 'Government'], ['✈️', 'Hospitality'], ['🏗️', 'Construction'], ['🌾', 'Agriculture'], ['🔧', 'Skilled trades'], ['🤝', 'HR'], ['🚚', 'Logistics'], ['🧪', 'Science'], ['🛍️', 'Retail'], ['✍️', 'Media']];
const FEATURES = [['layers', 'Many careers, one account', 'Choose every field you work in. Each gets its own skills, experience and target roles.'], ['file', '17 resume templates', 'Pick a look per resume. Make as many resumes as you want: per field, per role or per job.'], ['target', 'Matches for every field', 'Jobs are scored against each of your careers, so a teacher and an accountant both see the right openings.'], ['search', 'Search any job you like', 'Look up any role. We search online sources too, and you can save any number of searches.'], ['heart', 'Save and track', 'Tap the heart on jobs you like. Move them from saved to applied, interview and offer.'], ['chart', 'Skill gap insights', 'See which skills are holding a job match back and what to learn next.']];
const STEPS = [['Choose your fields', 'Pick one or many: teaching, finance, design, trades, anything.'], ['Fill each profile', 'Skills, experience and roles. Suggestions make it quick.'], ['Make resumes', 'Choose a template. Preview live. Download as PDF.'], ['Get matched', 'Search, save, apply and track every opportunity.']];

export default function Landing() {
  const { user } = useAuth(), [i, setI] = useState(0), [tpls, setTpls] = useState([]);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % WORDS.length), 2200); return () => clearInterval(t); }, []);
  useEffect(() => { api.get('/resume/templates').then((r) => setTpls(r.data.templates)).catch(() => {}); }, []);
  const pick = (k) => tpls.find((t) => t.key === k);
  const stack = [['t1', 'executive'], ['t2', 'aurora'], ['t3', 'studio']].map(([c, k]) => [c, pick(k)]).filter(([, t]) => t);
  const sample = (t) => ({ ...SAMPLE, professionalField: 'Your field' });
  return <div className="landing">
    <div className="orbs"><span /><span /><span /></div>
    <nav className="l-nav"><Link to="/" className="brand" style={{ color: 'var(--ink)' }}><i><Icon n="sparkle" /></i>CareerSync <em>AI</em></Link>
      <div className="links"><a href="#features">Features</a><a href="#how">How it works</a><a href="#templates">Templates</a></div>
      <div className="row">{user ? <Link className="btn" to="/dashboard">Open dashboard</Link> : <><Link className="btn ghost sm" to="/login">Log in</Link><Link className="btn sm" to="/register">Get started</Link></>}</div></nav>

    <div className="l-wrap"><section className="hero">
      <div><p className="eyebrow">FOR EVERY PROFESSION</p>
        <h1>Resumes and jobs for every <span className="rot" key={i}><span className="grad-text">{WORDS[i]}</span></span><br />you can be.</h1>
        <p className="lead">Work in more than one field? Build a separate resume for each, pick a template you love and find jobs that fit every career you have, all in one place.</p>
        <div className="row"><Link className="btn lg" to="/register">Start free <Icon n="arrow" /></Link><Link className="btn lg ghost" to="/login">I have an account</Link></div>
        <div className="proof"><div><b><CountUp to={29} />+</b><span>career fields</span></div><div><b><CountUp to={17} /></b><span>resume templates</span></div><div><b>∞</b><span>resumes per person</span></div></div></div>
      <div className="stack" aria-hidden="true">
        {stack.map(([c, t]) => <div key={c} className={`thumb-wrap`}><div className={`thumb ${c}`} style={{ width: 260, height: 368 }}><div style={{ transform: `scale(${260 / 794})`, transformOrigin: 'top left', width: 794 }}><ResumeMini t={t} d={sample(t)} /></div></div></div>)}
        <div className="float-chip" style={{ left: '-2%', top: '12%', animationDelay: '-1s' }}>🎓 Teaching <span className="badge green">92% match</span></div>
        <div className="float-chip" style={{ right: '0', top: '56%', animationDelay: '-3s' }}>💰 Accounts Executive <span className="badge hot">New</span></div>
        <div className="float-chip" style={{ left: '10%', bottom: '4%', animationDelay: '-5s' }}><span className="live-dot" /> 3 resumes ready</div></div>
    </section></div>

    <Reveal className="marquee"><div className="marquee-track">{[...FIELDS, ...FIELDS].map(([e, n], k) => <span className="pill" key={k}>{e} {n}</span>)}</div></Reveal>

    <div className="l-wrap">
      <section className="l-sec" id="features"><Reveal><p className="eyebrow" style={{ display: 'block', textAlign: 'center' }}>EVERYTHING YOU NEED</p><h2>One platform, every career path</h2><p className="sub">No matter what you do for a living, CareerSync adapts to you instead of the other way round.</p></Reveal>
        <div className="feat">{FEATURES.map(([ic, t, d], k) => <Reveal key={t} d={k} className="card lift"><div className="ic"><Icon n={ic} /></div><h3>{t}</h3><p className="muted">{d}</p></Reveal>)}</div></section>

      <section className="l-sec" id="how"><Reveal><h2>From sign-up to shortlisted in four steps</h2><p className="sub">Most people are done in about ten minutes.</p></Reveal>
        <div className="steps">{STEPS.map(([t, d], k) => <Reveal key={t} d={k} className="step"><h3>{t}</h3><p className="muted" style={{ margin: 0 }}>{d}</p></Reveal>)}</div></section>

      {tpls.length > 0 && <section className="l-sec" id="templates"><Reveal><h2>Templates for every kind of work</h2><p className="sub">From strict ATS-friendly layouts to bold creative designs. Hover to preview.</p></Reveal>
        <div className="marquee rev"><div className="marquee-track" style={{ gap: '1.2rem', padding: '1rem 0' }}>{[...tpls, ...tpls].map((t, k) => <div key={k} style={{ textAlign: 'center' }}><Thumb data={SAMPLE} template={t} width={190} /><b style={{ display: 'block', marginTop: '.5rem', fontSize: '.9rem' }}>{t.name}</b></div>)}</div></div></section>}

      <Reveal className="cta-band"><h2>Your next role is waiting.</h2><p>Create your account, pick your fields, and have a polished resume in minutes.</p><Link className="btn lg" style={{ background: '#fff', color: '#2a1240', backgroundImage: 'none' }} to="/register">Create free account <Icon n="arrow" /></Link></Reveal>
    </div>
    <footer className="l-foot">© {new Date().getFullYear()} CareerSync AI · Built with React, Node, Express and MongoDB</footer>
  </div>;
}

import ResumeRender from '../components/Resume';
function ResumeMini({ t, d }) { return <ResumeRender data={d} template={t} order={t.defaultOrder} />; }
