/* eslint react-refresh/only-export-components: off */
import { createContext, useCallback, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

  const saveUser = useCallback((nextUser) => {
    if (nextUser) localStorage.setItem('user', JSON.stringify(nextUser));
    else localStorage.removeItem('user');
    setUser(nextUser);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    saveUser(data);
    return data;
  }, [saveUser]);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    saveUser(data);
    return data;
  }, [saveUser]);

  const logout = useCallback(() => saveUser(null), [saveUser]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      const updated = { ...readStoredUser(), ...data.user };
      saveUser(updated);
      return updated;
    } catch {
      return null;
    }
  }, [saveUser]);

  return (
    <AuthContext.Provider value={{ user, loading: false, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Context modules intentionally export both a provider and a consumer hook.
export const useAuth = () => useContext(AuthContext);
