import { useEffect, useState, type ReactNode } from 'react';
import { authApi, type AuthUser } from '../api/services';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { data } = await authApi.login(email, password);
    setUser(data.user);
  }

  async function logout() {
    await authApi.logout().catch(() => {});
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
