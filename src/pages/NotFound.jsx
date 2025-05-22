import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="not-found-container">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-message">Lo sentimos, la página que buscas no existe.</p>
      <Link to="/home" className="btn btn-success">
        Volver al inicio
      </Link>
    </div>
  );
}