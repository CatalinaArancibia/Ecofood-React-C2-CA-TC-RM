import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../admin/AdminDashboard.css";

export default function EmpresaDashboard() {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">
      <h1>Perfil de Empresa</h1>
      <p>Bienvenido al perfil de empresa en EcoFood</p>

      <section className="dashboard-cards">
        <div className="card-dashboard">
          <h3>Mi Empresa</h3>
          <p>Visualiza o edita la información de tu empresa registrada.</p>
          <Link to="/empresa/perfil" className="card-button">
            Ver Perfil
          </Link>
        </div>

        <div className="card-dashboard">
          <h3>Mis Productos</h3>
          <p>Gestiona los productos asociados a tu empresa.</p>
          <Link to="/empresa/productos" className="card-button">
            Ver Productos
          </Link>
        </div>

        <div className="card-dashboard">
          <h3>Pedidos</h3>
          <p>Consulta los pedidos realizados por clientes a tu empresa.</p>
          <Link to="/empresa/pedidos" className="card-button">
            Ver Pedidos
          </Link>


        </div>
      </section>
    </div>
  );
}

