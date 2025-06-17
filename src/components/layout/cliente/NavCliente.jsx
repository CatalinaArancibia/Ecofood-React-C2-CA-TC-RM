// src/components/layout/cliente/NavCliente.jsx
import { NavLink } from "react-router-dom";
import CerrarSesion from "../../CerrarSesion";
import "../../../pages/admin/AdminDashboard.css"; // o crea NavCliente.css

export default function NavCliente() {
    return (
        <nav className="nav-admin"> {/* Reutilizamos el estilo de admin */}
            <div className="nav-admin-header">
                <h2 className="nav-admin-title">ECOFOOD</h2>
            </div>

            <div className="nav-admin-links">
                <NavLink
                    to="/cliente/dashboard"
                    className={({ isActive }) =>
                        isActive ? "nav-admin-link active" : "nav-admin-link"
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/cliente/productos"
                    className={({ isActive }) =>
                        isActive ? "nav-admin-link active" : "nav-admin-link"
                    }
                >
                    Productos
                </NavLink>

                <NavLink
                    to="/cliente/pedidos"
                    className={({ isActive }) =>
                        isActive ? "nav-admin-link active" : "nav-admin-link"
                    }
                >
                    Mis pedidos
                </NavLink>

                <NavLink
                    to="/cliente/perfil"
                    className={({ isActive }) =>
                        isActive ? "nav-admin-link active" : "nav-admin-link"
                    }
                >
                    Mi perfil
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
