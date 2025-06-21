// src/components/layout/empresa/NavEmpresa.jsx
import { NavLink } from "react-router-dom";
import CerrarSesion from "../../CerrarSesion";
import "../../../pages/admin/NavAdmin.css"; // reutilizamos los estilos del admin

export default function NavEmpresa() {
    return (
        <nav className="nav-admin">
            <div className="nav-admin-header">
                <h2 className="nav-admin-title">ECOFOOD</h2>
            </div>


            <div className="nav-admin-links">

                <NavLink
                    to="/empresa/dashboard"
                    className={({ isActive }) =>
                        isActive ? "nav-admin-link active" : "nav-admin-link"
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/empresa/productos"
                    className={({ isActive }) =>
                        isActive ? "nav-admin-link active" : "nav-admin-link"
                    }
                >
                    Productos
                </NavLink>

                <NavLink
                    to="/empresa/pedidos"
                    className={({ isActive }) =>
                        isActive ? "nav-admin-link active" : "nav-admin-link"
                    }
                >
                    Pedidos
                </NavLink>                

                <NavLink
                    to="/empresa/perfil"
                    className={({ isActive }) =>
                        isActive ? "nav-admin-link active" : "nav-admin-link"
                    }
                >
                    Perfil
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
