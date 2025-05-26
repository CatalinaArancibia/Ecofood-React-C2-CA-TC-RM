import React from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Panel del Administrador</h1>
      <p>Bienvenido al panel administrativo de EcoFood</p>

      <section className="dashboard-cards">
        <div className="card">
          <h3>Empresas</h3>
          <p>Gestiona las empresas registradas en el sistema. Crea, edita o elimina registros de empresas.</p>
          <Link to="/admin/empresas" className="card-button">
            Gestionar Empresas
          </Link>
        </div>

        <div className="card">
          <h3>Productos</h3>
          <p>Asocia productos a empresas para gestionar sus relaciones comerciales.</p>
          <Link to="/admin/productos" className="card-button">
            Gestionar Productos
          </Link>
        </div>
        
        <div className="card">
          <h3>Clientes</h3>
          <p>Visualiza y administra los clientes registrados. Accede a su información y gestiona sus cuentas.</p>
          <Link to="/admin/clientes" className="card-button">
            Gestionar Clientes
          </Link>
        </div>
        
        <div className="card">
          <h3>Administradores</h3>
          <p>Configura los usuarios administradores del sistema. Asigna permisos y gestiona accesos.</p>
          <Link to="/admin/administradores" className="card-button">
            Gestionar Administradores
          </Link>
        </div>
        
      </section>
    </div>
  );
}