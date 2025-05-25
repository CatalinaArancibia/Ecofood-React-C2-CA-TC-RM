import React from "react";
import "./AdminDashboard.css"; // Estilos específicos del dashboard

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard container">
      <h1>Panel del Administrador</h1>
      <p>Bienvenido al panel administrativo de EcoFood.</p>

      <section className="dashboard-cards">
        <div className="card">
          <h3>Empresas</h3>
          <p>Gestiona las empresas registradas.</p>
        </div>
        <div className="card">
          <h3>Clientes</h3>
          <p>Visualiza y administra los clientes.</p>
        </div>
        <div className="card">
          <h3>Administradores</h3>
          <p>Configura los usuarios administradores.</p>
        </div>
      </section>
    </div>
  );
}
