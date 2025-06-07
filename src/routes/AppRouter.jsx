import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import ProtectedRoute from "./ProtectedRoute";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminLayout from "../components/layout/admin/AdminLayout";
import Empresas from "../pages/admin/Empresas";
import Clientes from "../pages/admin/Clientes";
import Productos from "../pages/admin/Productos";
import Administradores from "../pages/admin/Administradores";

import ClienteDashboard from "../pages/cliente/ClienteDashboard";
import NotFound from "../pages/NotFound";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Ruta accesible para cualquier usuario autenticado */}
      <Route
        path="/home"
        element={
          <ProtectedRoute requiredRole="any">
            <Home />
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas solo para administradores */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="empresas" element={<Empresas />} />
        <Route path="productos" element={<Productos />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="administradores" element={<Administradores />} />
      </Route>

      {/* Ruta protegida solo para clientes */}
      <Route
        path="/cliente/dashboard"
        element={
          <ProtectedRoute requiredRole="cliente">
            <ClienteDashboard />
          </ProtectedRoute>
        }
      />

      {/* Ruta para páginas no encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}