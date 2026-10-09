import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './UI';
import Layout from './Layout';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><Spinner /></div>;
  return user ? <Layout /> : <Navigate to="/login" replace />;
}
