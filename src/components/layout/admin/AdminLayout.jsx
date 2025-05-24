import { Outlet } from "react-router-dom";
import NavAdmin from "./NavAdmin";
import "../../../pages/admin/AdminStyles.css";

export default function AdminLayout() {
  return (
    <div className="admin-panel">
      <NavAdmin />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}