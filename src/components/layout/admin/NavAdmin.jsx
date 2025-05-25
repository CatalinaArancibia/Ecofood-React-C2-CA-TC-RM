import { NavLink } from "react-router-dom";
import "../../../pages/admin/NavAdmin.css"; // La ruta correcta según tu estructura

export default function NavAdmin() {
  return (
    <nav className="nav-admin">
      <h2 className="nav-admin-title">Admin Panel</h2>

      <NavLink
        to="/admin/dashboard"
        className={({ isActive }) =>
          isActive ? "nav-admin-link active" : "nav-admin-link"
        }
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/admin/empresas"
        className={({ isActive }) =>
          isActive ? "nav-admin-link active" : "nav-admin-link"
        }
      >
        Empresas
      </NavLink>

      <NavLink
        to="/admin/clientes"
        className={({ isActive }) =>
          isActive ? "nav-admin-link active" : "nav-admin-link"
        }
      >
        Clientes
      </NavLink>

      <NavLink
        to="/admin/administradores"
        className={({ isActive }) =>
          isActive ? "nav-admin-link active" : "nav-admin-link"
        }
      >
        Administradores
      </NavLink>
    </nav>
  );
}