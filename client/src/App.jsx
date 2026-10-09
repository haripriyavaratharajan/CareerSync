import { Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import SkillGap from './pages/SkillGap';
import Applications from './pages/Applications';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Resumes from './pages/Resumes';
import ResumeNew from './pages/ResumeNew';
import ResumeEditor from './pages/ResumeEditor';
import Settings from './pages/Settings';
import { useAuth } from './context/AuthContext';

const Guest = ({ children }) => { const { user, loading } = useAuth(); return !loading && user ? <Navigate to="/dashboard" replace /> : children; };

export default function App() {
  return (
    <>
      <div className="orbs"><span /><span /><span /></div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Guest><Auth mode="login" /></Guest>} />
        <Route path="/register" element={<Guest><Auth mode="register" /></Guest>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resumes" element={<Resumes />} />
          <Route path="/resumes/new" element={<ResumeNew />} />
          <Route path="/resumes/:id" element={<ResumeEditor />} />
          {['/resume', '/resume/templates', '/resume/builder'].map((p) => <Route key={p} path={p} element={<Navigate to="/resumes" replace />} />)}
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/matches" element={<Jobs matchesOnly />} />
          <Route path="/skill-gap" element={<SkillGap />} />
          <Route path="/skill-gap/:id" element={<SkillGap />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
