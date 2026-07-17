import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="app-loading" aria-label="Carregando" />;
  }
  return <Navigate to={isAuthenticated ? '/contracts' : '/login'} replace />;
}
