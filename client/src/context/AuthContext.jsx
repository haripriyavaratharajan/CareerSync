import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext); // custom hook over Context

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api.get('/auth/me').then((r) => setUser(r.data.user)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
  }, []);
  // a token that stops working (expired / DB was reset) logs the user out cleanly instead of showing errors everywhere
  useEffect(() => {
    const id = api.interceptors.response.use((r) => r, (e) => { if (e.response?.status === 401 && localStorage.getItem('token') && !e.config.url.includes('/auth/')) { localStorage.removeItem('token'); setUser(null); } return Promise.reject(e); });
    return () => api.interceptors.response.eject(id);
  }, []);

  const finish = (data) => { localStorage.setItem('token', data.token); setUser(data.user); return data.user; };
  const authenticate = async (path, body) => finish((await api.post(`/auth/${path}`, body)).data);
  const googleLogin = async (credential) => finish((await api.post('/auth/google', { credential })).data);
  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return <AuthContext.Provider value={{ user, loading, theme, toggleTheme, login: (b) => authenticate('login', b), register: (b) => authenticate('register', b), googleLogin, logout }}>{children}</AuthContext.Provider>;
}
