// src/components/layout/empresa/EmpresaLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import NavEmpresa from "./NavEmpresa";
import "../../../pages/admin/AdminLayout.css"; // reutiliza el mismo CSS

export default function EmpresaLayout() {
  return (
    <div className="admin-layout"> {/* misma clase para que comparta estilo */}
      <aside className="sidebar">
        <NavEmpresa />
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
