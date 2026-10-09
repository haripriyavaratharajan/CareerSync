import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../resume.css';
import { SECTIONS, isDark } from '../lib';

const SIDE_KEYS = ['skills', 'education', 'certifications'];
const has = (a) => Array.isArray(a) && a.length > 0;

// Lines starting with - • * become bullets; everything else stays a paragraph
function Rich({ text }) {
  if (!text) return null;
  const lines = String(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const bullet = (l) => /^[-•*]\s+/.test(l);
  const out = []; let list = [];
  const flush = () => { if (list.length) { out.push(<ul key={`u${out.length}`}>{list.map((l, i) => <li key={i}>{l.replace(/^[-•*]\s+/, '')}</li>)}</ul>); list = []; } };
  lines.forEach((l) => { if (bullet(l)) list.push(l); else { flush(); out.push(<p key={`p${out.length}`}>{l}</p>); } });
  flush();
  return <div className="r-text">{out}</div>;
}
const Sec = ({ t, children }) => <div className="r-sec"><h4>{t}</h4>{children}</div>;

/** Pure renderer: data + template -> A4 page. `template` = { layout, style } from the server. */
export default function Resume({ data = {}, template, order = SECTIONS }) {
  const st = template?.style || {}, layout = template?.layout || 'single';
  const vars = { '--accent': st.accent || template?.accentColor || '#222', '--accent2': st.accent2 || st.accent || '#222', '--ink': st.ink, '--paper': st.paper, '--side': st.side, '--side-ink': st.sideInk,
    '--band': st.band, '--band-ink': st.bandInk, '--f-head': `'${st.headFont || 'DM Sans'}', 'DM Sans', serif`, '--f-body': `'${st.bodyFont || 'DM Sans'}', sans-serif` };
  Object.keys(vars).forEach((k) => vars[k] === undefined && delete vars[k]);
  const cls = ['resume', `l-${layout}`, `h-${st.header || 'plain'}`, `t-${st.heading || 'rule'}`, `s-${st.skills || 'chips'}`, st.timeline && 'x-timeline', st.density === 'airy' && 'd-airy', layout.startsWith('sidebar') && (isDark(st.side) ? 'side-dark' : 'side-light')].filter(Boolean).join(' ');

  const d = data || {};
  const S = {
    summary: d.summary && <Sec t="Profile"><p className="r-text">{d.summary}</p></Sec>,
    experience: has(d.experience) && <Sec t="Experience">{d.experience.map((e, i) => <div className="r-entry" key={i}><div className="r-row"><b>{e.role || e.company}</b><em>{e.duration}</em></div>{e.role && e.company && <div className="r-sub">{e.company}</div>}<Rich text={e.description} /></div>)}</Sec>,
    projects: has(d.projects) && <Sec t="Projects / Work">{d.projects.map((p, i) => { const tech = Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies; return <div className="r-entry" key={i}><div className="r-row"><b>{p.name}</b></div>{tech && <div className="r-sub">{tech}</div>}<Rich text={p.description} />{(p.githubUrl || p.liveUrl) && <div className="r-links">{[p.githubUrl, p.liveUrl].filter(Boolean).join('  ·  ')}</div>}</div>; })}</Sec>,
    education: has(d.education) && <Sec t="Education">{d.education.map((e, i) => <div className="r-entry" key={i}><div className="r-row"><b>{e.degree}</b><em>{e.graduationYear}</em></div><div className="r-sub">{[e.college, e.university].filter(Boolean).join(', ')}</div>{e.score && <div className="dim">{e.score}</div>}</div>)}</Sec>,
    skills: has(d.skills) && <Sec t="Skills"><div className="r-skills">{d.skills.map((s) => <span className="r-skill" key={s}>{s}</span>)}</div></Sec>,
    certifications: has(d.certifications) && <Sec t="Certifications">{d.certifications.map((c, i) => <div className="r-entry" key={i}><div className="r-row"><b>{c.name}</b><em>{c.date}</em></div>{c.issuer && <div className="r-sub">{c.issuer}</div>}</div>)}</Sec>,
    achievements: has(d.achievements) && <Sec t="Achievements">{d.achievements.map((a, i) => <div className="r-entry" key={i}><div className="r-row"><b>{a.title}</b><em>{a.date}</em></div><Rich text={a.description} /></div>)}</Sec>,
    customSections: has(d.customSections) && <>{d.customSections.map((c, i) => <Sec key={i} t={c.title || 'More'}><Rich text={c.content} /></Sec>)}</>,
  };
  const ord = order?.length ? order : SECTIONS;
  const render = (keys) => keys.map((k) => (S[k] ? <div key={k}>{S[k]}</div> : null));
  const contact = [d.email, d.phone, d.location].filter(Boolean);
  const title = d.jobTitle || (d.targetRoles || []).slice(0, 2).join(' · ');
  const nameBlock = <div className="r-name"><div className="r-kicker">{d.professionalField}</div><h2>{d.name || 'Your Name'}</h2>{title && <div className="r-title">{title}</div>}</div>;
  const contactBlock = contact.length > 0 && <div className="r-contact">{contact.map((c) => <span key={c}>{c}</span>)}</div>;
  const photo = d.photo && <img className="r-photo" src={d.photo} alt="" />;

  if (layout === 'sidebar-left' || layout === 'sidebar-right') {
    const side = <div className="r-side">{photo}{contactBlock}{render(ord.filter((k) => SIDE_KEYS.includes(k)))}</div>;
    const main = <div className="r-main"><div className="r-head">{nameBlock}</div>{render(ord.filter((k) => !SIDE_KEYS.includes(k)))}</div>;
    return <div className={cls} style={vars}><div className="r-cols">{layout === 'sidebar-left' ? <>{side}{main}</> : <>{main}{side}</>}</div></div>;
  }
  const head = <div className="r-head">{photo}<div style={{ flex: 1 }}>{nameBlock}{contactBlock}</div></div>;
  if (layout === 'two-column') return <div className={cls} style={vars}>{head}<div className="r-cols2"><div>{render(ord.filter((k) => !SIDE_KEYS.includes(k)))}</div><div className="r-col-side">{render(ord.filter((k) => SIDE_KEYS.includes(k)))}</div></div></div>;
  return <div className={cls} style={vars}>{head}<div className="r-body">{render(ord)}</div></div>;
}

/** A tiny scaled-down page for galleries and template pickers. */
export function Thumb({ data, template, order, width = 180 }) {
  const k = width / 794;
  return <div className="thumb" style={{ width, height: 1123 * k }}><div style={{ transform: `scale(${k})`, width: 794 }}><Resume data={data} template={template} order={order} /></div></div>;
}

/** Responsive live preview: scales the 794px page to whatever width is available. */
export function FitPreview({ data, template, order }) {
  const wrap = useRef(null), [k, setK] = useState(0.5);
  useLayoutEffect(() => {
    const el = wrap.current; if (!el) return;
    const fit = () => setK(Math.min(1, el.clientWidth / 794));
    fit(); const ro = new ResizeObserver(fit); ro.observe(el); return () => ro.disconnect();
  }, []);
  return <div ref={wrap} className="page-wrap" style={{ height: 1123 * k }}><div className="page-inner" style={{ transform: `scale(${k})`, width: 794 }}><Resume data={data} template={template} order={order} /></div></div>;
}

/** Renders the real-size resume into #print-root so the browser's "Save as PDF" prints only the resume. */
export function PrintPortal({ data, template, order, title }) {
  const [node, setNode] = useState(null);
  useEffect(() => { setNode(document.getElementById('print-root')); }, []);
  useEffect(() => {
    const before = () => { if (title) { window.__t = document.title; document.title = title; } };
    const after = () => { if (window.__t) document.title = window.__t; };
    window.addEventListener('beforeprint', before); window.addEventListener('afterprint', after);
    return () => { window.removeEventListener('beforeprint', before); window.removeEventListener('afterprint', after); };
  }, [title]);
  return node ? createPortal(<Resume data={data} template={template} order={order} />, node) : null;
}
