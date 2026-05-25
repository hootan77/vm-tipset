import { createContext, useContext, useState, useEffect } from 'react';

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

  async function register(name, password, role) {
    setError(null);
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password, role }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return false; }
    setUser(data);
    return true;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('vm-tipset-state');
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { API };
