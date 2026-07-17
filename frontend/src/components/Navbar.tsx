import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <span className="brand">📜 Contratos</span>
      <div className="nav-links">
        <NavLink to="/contracts">Contratos</NavLink>
        <NavLink to="/clients">Clientes</NavLink>
      </div>
      <button className="btn-secondary" onClick={handleLogout}>
        Sair
      </button>
    </nav>
  );
}
