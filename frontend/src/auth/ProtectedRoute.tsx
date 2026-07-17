import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import { Navbar } from '../components/Navbar';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="app-loading" aria-label="Carregando" />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
