import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Cargando autenticación...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si hay un rol requerido y el usuario no lo cumple
  if (requiredRole !== "any" && user?.tipo !== requiredRole) {
    console.warn(
      `Acceso denegado: necesitas tipo ${requiredRole}, pero eres ${user?.tipo}`
    );
    return <Navigate to="/home" replace />;
  }

  return children;
}