// src/components/layout/cliente/ClienteLayout.jsx
import NavCliente from "./NavCliente";
import { Outlet } from "react-router-dom";

export default function ClienteLayout() {
    return (
        <div className="d-flex">
            <NavCliente />
            <div className="flex-grow-1 p-3">
                <Outlet />
            </div>
        </div>
    );
}
