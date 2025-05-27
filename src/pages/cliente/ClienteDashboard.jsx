import "./ClienteDashboard.css";
import { useNavigate } from "react-router-dom";


export default function ClienteDashboard() {
  const navigate = useNavigate();
  return (
    <div className="cliente-dashboard">
      <h1>Panel del Cliente</h1>
      <p className="welcome-msg">
        Bienvenido a EcoFood, disfruta de tu experiencia sostenible.
      </p>

      <section className="order-summary">
        <h2>Resumen de pedidos</h2>
        <p>Aún no tienes pedidos registrados.</p>
        <button
          onClick={() => navigate("/productos")}
          className="btn-eco"
        >
          Explorar productos
        </button>
        
        <button
          onClick={() => navigate("/home")}
          className="btn-eco mt-3"
        >
          Ir al sitio público
        </button>
      </section>
      
    </div>
  );
}
