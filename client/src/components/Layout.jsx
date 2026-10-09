import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import Icon from './Icon';
import { initials } from '../lib';

const links = [['dashboard', 'Dashboard', 'dashboard'], ['jobs', 'Find Jobs', 'jobs'], ['matches', 'Best Matches', 'target'], ['resumes', 'My Resumes', 'file'], ['skill-gap', 'Skill Gap', 'chart'], ['applications', 'Job Tracker', 'kanban'], ['profile', 'Career Profile', 'user'], ['settings', 'Settings', 'settings']];

export default function Layout() {
  const { user, logout, theme, toggleTheme } = useAuth(), nav = useNavigate(), loc = useLocation(), [open, setOpen] = useState(false);
  const { data } = useFetch('/notifications');
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <NavLink to="/dashboard" className="brand"><i><Icon n="sparkle" /></i>CareerSync <em>AI</em></NavLink>
        <nav className="nav">{links.map(([to, label, ic]) => <NavLink key={to} to={`/${to}`}><Icon n={ic} />{label}</NavLink>)}</nav>
        <div className="side-foot"><b>One account, many careers</b>Add a field in Career Profile and make a resume for each.</div>
      </aside>
      <div className={`backdrop ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu" aria-label="Menu" onClick={() => setOpen(!open)}><Icon n="menu" /></button>
          <span className="hi muted">Hi, <b style={{ color: 'var(--ink)' }}>{user.name}</b></span>
          <div className="row">
            <button className="icon-btn" aria-label="Toggle theme" onClick={toggleTheme}><Icon n={theme === 'light' ? 'moon' : 'sun'} /></button>
            <NavLink to="/notifications" className="icon-btn" aria-label="Notifications"><Icon n="bell" />{data?.unread > 0 && <span className="badge-dot">{data.unread}</span>}</NavLink>
            <span className="avatar-sm" title={user.email}>{initials(user.name)}</span>
            <button className="icon-btn" aria-label="Log out" title="Log out" onClick={() => { logout(); nav('/'); }}><Icon n="logout" /></button>
          </div>
        </header>
        <main className="content page-enter" key={loc.pathname}><Outlet /></main>
      </div>
    </div>
  );
}
