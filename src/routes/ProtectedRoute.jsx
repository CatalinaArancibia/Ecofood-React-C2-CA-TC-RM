import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  // Usuario no autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificación de rol
  if (requiredRole && user.tipo !== requiredRole) {
    // Redirigir siempre al dashboard correspondiente
    if (user.tipo === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/cliente/dashboard" replace />;
    }
  }

  // Usuario con rol correcto
  return children;
}