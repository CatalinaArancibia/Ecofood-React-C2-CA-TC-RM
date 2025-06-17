// src/components/layout/cliente/ClienteLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import NavCliente from "./NavCliente";
import "../../../pages/admin/AdminLayout.css"; // Reutiliza el mismo CSS que empresa

export default function ClienteLayout() {
    return (
        <div className="admin-layout"> {/* Usa misma clase que empresa */}
            <aside className="sidebar">
                <NavCliente />
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}



