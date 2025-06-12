import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./NotFound.css";

export default function NotFound() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRedirect = () => {
    if (!user) {
      navigate("/home");
    } else if (user.tipo === "admin") {
      navigate("/admin/dashboard");
    } else if (user.tipo === "empresa" || user.tipo === "enterprise") {
      navigate("/empresa/dashboard");
    } else if (user.tipo === "cliente") {
      navigate("/cliente/dashboard");
    } else {
      navigate("/home"); // fallback por si no tiene tipo
    }
  };

  return (
    <div className="not-found-container">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-message">Lo sentimos, la página que buscas no existe.</p>
      <button className="btn btn-success" onClick={handleRedirect}>
        Volver
      </button>
    </div>
  );
}
