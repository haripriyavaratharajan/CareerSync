import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';
import Icon from '../components/Icon';

const points = ['Pick every field you work in', 'A separate resume for each one', 'Jobs matched to every career you have'];

export default function Auth({ mode }) {
  const isReg = mode === 'register', { login, register, googleLogin } = useAuth(), nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [show, setShow] = useState(false), [shake, setShake] = useState(0);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const fail = (m) => { setErr(m); setShake((s) => s + 1); };
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (isReg && !form.name.trim()) return fail('Please enter your name');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return fail('Enter a valid email address');
    if (form.password.length < 6) return fail('Password must be at least 6 characters');
    setBusy(true);
    try { await (isReg ? register(form) : login(form)); nav(isReg ? '/onboarding' : '/dashboard'); } catch (e2) { fail(errMsg(e2)); } finally { setBusy(false); }
  };
  const onGoogle = async (r) => { setErr(''); setBusy(true); try { await googleLogin(r.credential); nav('/dashboard'); } catch (e) { fail(errMsg(e)); } finally { setBusy(false); } };
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  return (
    <div className="auth-page">
      <aside className="auth-art">
        <Link to="/" className="brand" style={{ padding: 0 }}><i><Icon n="sparkle" /></i>CareerSync <em>AI</em></Link>
        <div><h2>Every career you have. One place.</h2><p>Teacher by day, writer by night, accountant on weekends? Build a resume for each and let jobs find you.</p>
          <ul>{points.map((p, i) => <li key={p} style={{ '--i': i }}><Icon n="check" />{p}</li>)}</ul></div>
        <small style={{ opacity: .7 }}>Free to use · No credit card</small>
      </aside>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit} noValidate>
          <p className="eyebrow">{isReg ? 'GET STARTED' : 'WELCOME BACK'}</p>
          <h2>{isReg ? 'Create your account' : 'Log in to CareerSync'}</h2>
          <p className="muted" style={{ marginBottom: '1.4rem' }}>{isReg ? 'It takes less than a minute.' : 'Pick up where you left off.'}</p>
          {isReg && <div className="field"><label htmlFor="n">Full name</label><input id="n" autoComplete="name" value={form.name} onChange={set('name')} placeholder="Your name" /></div>}
          <div className="field"><label htmlFor="e">Email</label><input id="e" type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" /></div>
          <div className="field"><label htmlFor="p">Password</label><div className="pw"><input id="p" type={show ? 'text' : 'password'} autoComplete={isReg ? 'new-password' : 'current-password'} value={form.password} onChange={set('password')} placeholder="At least 6 characters" /><button type="button" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button></div></div>
          {err && <p key={shake} className="err shake" role="alert">{err}</p>}
          <button className="btn full lg" disabled={busy}>{busy ? 'Please wait…' : isReg ? 'Create account' : 'Log in'} {!busy && <Icon n="arrow" />}</button>
          {googleEnabled && <><div className="auth-divider"><span>or</span></div><GoogleLogin onSuccess={onGoogle} onError={() => fail('Google Sign-In failed. Please try again.')} theme="outline" size="large" width="100%" /></>}
          <p className="muted" style={{ marginTop: '1.2rem', textAlign: 'center' }}>{isReg ? <>Already have an account? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}</p>
        </form>
      </div>
    </div>
  );
}
