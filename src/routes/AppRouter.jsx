import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";

import ProtectedRoute from "./ProtectedRoute";

import AdminLayout from "../components/layout/admin/AdminLayout";
import EmpresaLayout from "../components/layout/empresa/EmpresaLayout";
import ClienteLayout from "../components/layout/cliente/ClienteLayout"; // <-- IMPORTANTE

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import Empresas from "../pages/admin/Empresas";
import Clientes from "../pages/admin/Clientes";
import Productos from "../pages/admin/Productos";
import Administradores from "../pages/admin/Administradores";

// Empresa
import EmpresaDashboard from "../pages/empresa/EmpresaDashboard";
import ProductosEmpresa from "../pages/empresa/ProductosEmpresa";
import PerfilEmpresa from "../pages/empresa/PerfilEmpresa";
import PedidosEmpresa from "../pages/empresa/PedidosEmpresa";

// Cliente
import ClienteDashboard from "../pages/cliente/ClienteDashboard";
import ProductosCliente from "../pages/cliente/ProductosCliente";
import PedidosCliente from "../pages/cliente/PedidosCliente";
import PerfilCliente from "../pages/cliente/PerfilCliente";

export default function AppRouter() {
  return (
    <Routes>
      {/* Redirección base */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Página pública protegida para cualquier rol */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* ADMIN */}
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

      {/* EMPRESA */}
      <Route
        path="/empresa/*"
        element={
          <ProtectedRoute requiredRole="empresa">
            <EmpresaLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EmpresaDashboard />} />
        <Route path="perfil" element={<PerfilEmpresa />} />
        <Route path="productos" element={<ProductosEmpresa />} />
        <Route path="pedidos" element={<PedidosEmpresa />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* CLIENTE */}
      <Route
        path="/cliente/*"
        element={
          <ProtectedRoute requiredRole="cliente">
            <ClienteLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClienteDashboard />} />
        <Route path="productos" element={<ProductosCliente />} />
        <Route path="pedidos" element={<PedidosCliente />} />
        <Route path="perfil" element={<PerfilCliente />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Cualquier otra ruta no encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
