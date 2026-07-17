import { useState, type ReactNode } from 'react';
import { authApi } from '../api/services';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));

  async function login(email: string, password: string) {
    const { data } = await authApi.login(email, password);
    localStorage.setItem('token', data.token);
    setIsAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
