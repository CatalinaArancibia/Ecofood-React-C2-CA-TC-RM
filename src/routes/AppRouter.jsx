import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import ClienteDashboard from "../pages/cliente/ClienteDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminLayout from "../components/layout/admin/AdminLayout";
import NotFound from "../pages/NotFound";
import EmpresaDashboard from "../pages/empresa/EmpresaDashboard";
import ProductosEmpresa from "../pages/empresa/ProductosEmpresa";
import PerfilEmpresa from "../pages/empresa/PerfilEmpresa";

import Empresas from "../pages/admin/Empresas";
import Clientes from "../pages/admin/Clientes";
import Productos from "../pages/admin/Productos";
import Administradores from "../pages/admin/Administradores";

import EmpresaLayout from "../components/layout/empresa/EmpresaLayout";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/cliente/dashboard"
        element={
          <ProtectedRoute requiredRole="cliente">
            <ClienteDashboard />
          </ProtectedRoute>
        }
      />

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

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/empresa/*"
        element={
          <ProtectedRoute requiredRole="empresa">
            <EmpresaLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EmpresaDashboard />} /> {/* Ahora es el dashboard */}
        <Route path="perfil" element={<PerfilEmpresa />} />         {/* Nuevo perfil editable */}
        <Route path="productos" element={<ProductosEmpresa />} />
        <Route path="*" element={<NotFound />} />

      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
