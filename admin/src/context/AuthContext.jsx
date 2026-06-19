import { createContext, useContext, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ymgs_admin_token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('ymgs_admin_user');
    return raw ? JSON.parse(raw) : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post('/api/user/login', { email, password });
    if (!data.success) throw new Error(data.message || 'فشل تسجيل الدخول');
    if (data.user?.role !== 'admin') {
      throw new Error('هذا الحساب لا يملك صلاحية الإدارة.');
    }
    localStorage.setItem('ymgs_admin_token', data.token);
    localStorage.setItem('ymgs_admin_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('ymgs_admin_token');
    localStorage.removeItem('ymgs_admin_user');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
