import { Thumb } from './Resume';
import { SAMPLE } from '../lib';

// Pick a template. Each thumbnail is a real, scaled-down render of the template (with the user's data when given).
export default function TemplateGrid({ templates = [], value, onChange, data, field }) {
  const d = data?.name ? data : SAMPLE;
  const rec = (t) => field && t.suits?.some((s) => field.toLowerCase().includes(s.toLowerCase().split(' ')[0]) || s.toLowerCase().includes(field.toLowerCase().split(' ')[0]));
  return <div className="tpl-grid stagger">{templates.map((t, i) => <button type="button" key={t._id} style={{ '--i': i % 10 }} className={`tpl ${value === t._id ? 'on' : ''}`} onClick={() => onChange(t)} aria-pressed={value === t._id}>
    {rec(t) && <span className="rec">GOOD FIT</span>}
    <div className="pvw"><Thumb data={d} template={t} width={128} /></div>
    <div><b>{t.name}</b><small>{t.category}</small></div></button>)}</div>;
}
