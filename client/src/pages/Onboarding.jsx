import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import FieldPicker, { newCareer } from '../components/FieldPicker';
import { Async } from '../components/UI';
import Icon from '../components/Icon';
import api, { errMsg } from '../services/api';
import { useToast } from '../components/Toast';

// Shown right after sign-up: choose one OR MORE career fields. Details are filled in the Career Profile next.
export default function Onboarding() {
  const s = useFetch('/profile'), [sel, setSel] = useState([]), [busy, setBusy] = useState(false), nav = useNavigate(), toast = useToast();
  const toggle = (n) => setSel((x) => (x.includes(n) ? x.filter((y) => y !== n) : [...x, n]));
  const existing = (s.data?.profile?.careerProfiles || []).map((c) => c.field);
  const go = async () => {
    setBusy(true);
    try {
      const add = s.data.catalog.filter((f) => sel.includes(f.name)).map(newCareer);
      await api.put('/profile', { careerProfiles: [...s.data.profile.careerProfiles, ...add] });
      toast(`${add.length} career ${add.length > 1 ? 'fields' : 'field'} added`); nav('/profile');
    } catch (e) { toast(errMsg(e), 'error'); setBusy(false); }
  };
  return <div className="wizard page-enter">
    <p className="eyebrow">STEP 1 OF 3</p>
    <h1>What field(s) do you work in?</h1>
    <p className="muted" style={{ fontSize: '1.05rem', maxWidth: '62ch' }}>Choose <b>every</b> field you want to find jobs or build a resume for. You can have several. Each one gets its own skills, experience and resumes.</p>
    <div className="steps-bar"><i className="on" /><i /><i /></div>
    <Async state={s}>{s.data && <>
      <FieldPicker catalog={s.data.catalog} selected={sel} taken={existing} onToggle={toggle} />
      <div className="sel-bar"><span><b>{sel.length}</b> {sel.length === 1 ? 'field' : 'fields'} selected{sel.length === 0 && ' — pick at least one'}</span>
        <div className="row"><button className="btn ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }} onClick={() => nav('/dashboard')}>Skip for now</button>
          <button className="btn" disabled={!sel.length || busy} onClick={go}>{busy ? 'Saving…' : 'Continue'} <Icon n="arrow" /></button></div></div></>}</Async>
  </div>;
}
