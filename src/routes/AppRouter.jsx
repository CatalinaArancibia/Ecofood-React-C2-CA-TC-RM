import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import ProtectedRoute from "./ProtectedRoute";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminLayout from "../components/layout/admin/AdminLayout";
import Empresas from "../pages/admin/Empresas";
import Clientes from "../pages/admin/Clientes";
import Administradores from "../pages/admin/Administradores";

import ClienteDashboard from "../pages/cliente/ClienteDashboard";
import NotFound from "../pages/NotFound";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas protegidas para administradores */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="empresas" element={<Empresas />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="administradores" element={<Administradores />} />
      </Route>

      {/* Rutas cliente */}
      <Route
        path="/cliente/dashboard"
        element={
          <ProtectedRoute>
            <ClienteDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}