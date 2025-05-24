import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../services/authFirebase";

export default function NavAdmin() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="nav-admin">
      <ul>
        <li><NavLink to="/admin" end>Dashboard</NavLink></li>
        <li><NavLink to="/admin/empresas">Empresas</NavLink></li>
        <li><NavLink to="/admin/clientes">Clientes</NavLink></li>
        <li><NavLink to="/admin/administradores">Administradores</NavLink></li>
        <li><button onClick={handleLogout}>Cerrar sesión</button></li>
      </ul>
    </nav>
  );
}