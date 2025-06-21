import React from "react";
import { Link } from "react-router-dom";
import "../admin/AdminDashboard.css";

export default function ClienteDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Panel del Cliente</h1>
      <p>Bienvenido a tu panel de usuario en Ecofood</p>

      <section className="dashboard-cards">
        <div className="card-dashboard">
          <h3>Mi Perfil</h3>
          <p>Revisa o actualiza tu información personal.</p>
          <Link to="/cliente/perfil" className="card-button">
            Ver Perfil
          </Link>
        </div>

        <div className="card-dashboard">
          <h3>Productos</h3>
          <p>Explora los productos disponibles para compra.</p>
          <Link to="/cliente/productos" className="card-button">
            Ver Productos
          </Link>
        </div>

        <div className="card-dashboard">
          <h3>Mis Pedidos</h3>
          <p>Consulta tus compras realizadas.</p>
          <Link to="/cliente/pedidos" className="card-button">
            Ver Pedidos
          </Link>
        </div>
      </section>
    </div>
  );
}

