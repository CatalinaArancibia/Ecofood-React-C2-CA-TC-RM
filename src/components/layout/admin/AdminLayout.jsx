import React from "react";
import NavAdmin from "./NavAdmin";
import { Outlet } from "react-router-dom";
import "../../../pages/admin/AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <NavAdmin />
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}