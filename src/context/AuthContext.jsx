import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();
const API = import.meta.env.DEV ? 'http://localhost:3456/api' : '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vm-tipset-user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) localStorage.setItem('vm-tipset-user', JSON.stringify(user));
    else localStorage.removeItem('vm-tipset-user');
  }, [user]);

  // Refresh user data from server on mount to pick up org/role changes
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API}/me/${user.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setUser(prev => ({ ...prev, ...data }));
      })
      .catch(() => {});
  }, []);

  async function login(name, password) {
    setError(null);
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return false; }
    setUser(data);
    return true;
  }

  async function register(displayName, username, password) {
    setError(null);
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, username, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return false; }
    setUser(data);
    return true;
  }

  const refreshUser = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API}/me/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, ...data }));
      }
    } catch {}
  }, [user?.id]);

  function logout() {
    setUser(null);
    localStorage.removeItem('vm-tipset-state');
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { API };
