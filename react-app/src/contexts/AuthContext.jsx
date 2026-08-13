import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../api';

export const csrf = () => axios.get('/sanctum/csrf-cookie', { withCredentials: true });

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [retryAfter, setRetryAfter] = useState(null);

  const checkAuth = useCallback(() => {
    const forced = sessionStorage.getItem('force_logout');
    if (forced) {
      sessionStorage.removeItem('force_logout');
      setLoading(false);
      return;
    }
    csrf().finally(() => {
      api.get('/user').then(r => setUser(r.data)).catch(() => setUser(null)).finally(() => setLoading(false));
    });
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Do NOT logout on tab hide — that was wiping forms whenever the browser blinked/switched tabs.

  const login = async (email, password) => {
    setError(null);
    setRemaining(null);
    setRetryAfter(null);
    try {
      await csrf();
      const r = await api.post('/login', { email, password });
      setUser(r.data.user);
      return r.data;
    } catch (err) {
      const data = err.response?.data || {};
      const msg = data.message || 'Login failed';
      if (err.response?.status === 429) {
        setRetryAfter(data.retry_after || 60);
        setError(msg);
      } else {
        setRemaining(data.remaining);
        setError(data.remaining !== undefined ? `${msg} (${data.remaining} attempt${data.remaining === 1 ? '' : 's'} left)` : msg);
      }
      throw err;
    }
  };

  const forensicLogin = async (email, password) => {
    setError(null);
    setRemaining(null);
    setRetryAfter(null);
    try {
      await csrf();
      const r = await api.post('/forensic/login', { email, password });
      setUser(r.data.user);
      return r.data;
    } catch (err) {
      const data = err.response?.data || {};
      const msg = data.message || 'Login failed';
      if (err.response?.status === 429) {
        setRetryAfter(data.retry_after || 60);
        setError(msg);
      } else {
        setRemaining(data.remaining);
        setError(data.remaining !== undefined ? `${msg} (${data.remaining} attempt${data.remaining === 1 ? '' : 's'} left)` : msg);
      }
      throw err;
    }
  };

  const clearError = () => { setError(null); setRemaining(null); setRetryAfter(null); };

  const logout = async () => {
    // Always navigate to force-logout which destroys session regardless of API state
    window.location.href = '/force-logout';
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, remaining, retryAfter, login, forensicLogin, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
