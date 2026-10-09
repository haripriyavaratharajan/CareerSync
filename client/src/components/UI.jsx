import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { scoreTone } from '../lib';

export const Spinner = () => <span className="spinner" aria-label="Loading" />;
export const Loader = () => <div className="loader"><div className="sk t" /><div className="grid-sk"><div className="sk" /><div className="sk" /><div className="sk" /></div></div>;
export const Badge = ({ children, tone = 'default' }) => <span className={`badge ${tone}`}>{children}</span>;
export const EmptyState = ({ title, hint, icon = '🧭', children }) => <div className="state"><span className="big">{icon}</span><h3>{title}</h3><p className="muted">{hint}</p>{children}</div>;
export const ErrorState = ({ message, onRetry }) => <div className="state error"><span className="big">⚠️</span><h3>Something went wrong</h3><p className="muted">{message}</p>{onRetry && <button className="btn" onClick={onRetry}>Try again</button>}</div>;
export const Card = ({ children, className = '', ...p }) => <section className={`card ${className}`} {...p}>{children}</section>;

export const ProgressBar = ({ value = 0, label }) => (
  <div className="progress-row">{label && <span>{label}</span>}
    <div className="progress"><div style={{ '--w': `${value}%` }} className={scoreTone(value)} /></div><b>{value}%</b></div>
);

// Animated circular score
export function Ring({ value = 0, size = 56, children }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(value), 60); return () => clearTimeout(t); }, [value]);
  return <div className={`ring ${scoreTone(value)}`} style={{ '--v': v, '--size': `${size}px` }}><b>{children ?? value}</b></div>;
}

// Wrapper that renders loading / error / empty / content in one place
export const Async = ({ state, empty, children }) => state.loading && !state.data ? <Loader /> : state.error ? <ErrorState message={state.error} onRetry={state.reload} /> : empty ? empty : children;

export function CountUp({ to = 0, ms = 900 }) {
  const [n, setN] = useState(0);
  useEffect(() => { let raf, t0; const step = (t) => { t0 ??= t; const p = Math.min(1, (t - t0) / ms); setN(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf); }, [to, ms]);
  return <>{n}</>;
}

// Fades/slides children in when they scroll into view
export function Reveal({ children, d = 0, as: Tag = 'div', className = '', ...p }) {
  const ref = useRef(null), [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el || !('IntersectionObserver' in window)) return setOn(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`reveal ${on ? 'in' : ''} ${className}`} style={{ '--d': d }} {...p}>{children}</Tag>;
}

export function Modal({ children, onClose, small }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className={`modal ${small ? 'sm' : ''}`} role="dialog" aria-modal="true">{children}</div></div>;
}

export function Confirm({ title, text, yes = 'Delete', onYes, onClose }) {
  return <Modal small onClose={onClose}><h2>{title}</h2><p className="muted">{text}</p><div className="row" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn danger" onClick={() => { onYes(); onClose(); }}>{yes}</button></div></Modal>;
}

// Chips input: type + Enter/comma to add, click a suggestion to add, × to remove
export function TagInput({ value = [], onChange, placeholder, suggestions = [] }) {
  const [t, setT] = useState('');
  const add = (raw) => { const items = String(raw).split(',').map((x) => x.trim()).filter(Boolean); if (!items.length) return; const have = new Set(value.map((v) => v.toLowerCase())); onChange([...value, ...items.filter((i) => !have.has(i.toLowerCase()) && have.add(i.toLowerCase()))]); setT(''); };
  const left = suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())).slice(0, 8);
  return <div>
    <div className="tags" onClick={(e) => e.currentTarget.querySelector('input')?.focus()}>
      {value.map((v) => <span className="tag" key={v}>{v}<button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(value.filter((x) => x !== v))}>×</button></span>)}
      <input value={t} placeholder={value.length ? '' : placeholder} onChange={(e) => (e.target.value.endsWith(',') ? add(e.target.value) : setT(e.target.value))}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(t); } else if (e.key === 'Backspace' && !t && value.length) onChange(value.slice(0, -1)); }} onBlur={() => add(t)} />
    </div>
    {left.length > 0 && <div className="suggest"><small>Suggestions</small>{left.map((s) => <button type="button" key={s} onClick={() => add(s)}>+ {s}</button>)}</div>}
  </div>;
}

// Repeating blocks (education, experience, ...) – add as many as needed
export function ListEditor({ title, hint = 'Add as many as you need', items = [], fields, onChange, icon }) {
  const upd = (i, k, v) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const long = (k) => ['description', 'content'].includes(k);
  return <div className="card"><div className="section-title"><div><h3>{icon} {title}</h3><span className="muted small">{hint}</span></div><button type="button" className="btn sm soft" onClick={() => onChange([...items, {}])}><Icon n="plus" /> Add</button></div>
    {items.length === 0 && <p className="muted small">Nothing added yet.</p>}
    {items.map((it, i) => <div key={i} className="entry"><button type="button" className="icon-btn rm" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}><Icon n="x" /></button>
      <div className="form-grid">{fields.map(([k, label]) => <div key={k} className={long(k) ? 'wide' : ''}>{long(k) ? <textarea placeholder={label} aria-label={label} value={it[k] ?? ''} onChange={(e) => upd(i, k, e.target.value)} rows="3" /> : <input placeholder={label} aria-label={label} value={it[k] ?? ''} onChange={(e) => upd(i, k, e.target.value)} />}</div>)}</div></div>)}
  </div>;
}
