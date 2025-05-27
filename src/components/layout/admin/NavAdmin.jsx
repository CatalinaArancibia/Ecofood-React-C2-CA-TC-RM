import { NavLink } from "react-router-dom";
import CerrarSesion from "../../CerrarSesion"; 
import "../../../pages/admin/NavAdmin.css";

export default function NavAdmin() {
  return (
    <nav className="nav-admin">
      <div className="nav-admin-header">
        <h2 className="nav-admin-title">ECOFOOD</h2>
      </div>

      <div className="nav-admin-links">
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
          to="/admin/productos"
          className={({ isActive }) =>
            isActive ? "nav-admin-link active" : "nav-admin-link"
          }
        >
          Productos
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
      </div>

      <div className="nav-admin-footer">
        <NavLink to="/home" className="nav-admin-home-btn">
          Volver al Inicio
        </NavLink>
        <CerrarSesion className="nav-admin-logout-btn" />
      </div>
    </nav>
  );
}