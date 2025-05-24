import './ClienteDashboard.css';

export default function ClienteDashboard() {
  return (
    <div className="cliente-dashboard">
      <h1>Panel del Cliente</h1>
      <p className="welcome-msg">Bienvenido a EcoFood, disfruta de tu experiencia sostenible.</p>

      <section className="order-summary">
        <h2>Resumen de pedidos</h2>
        <p>Aún no tienes pedidos registrados.</p>
        <button className="btn-eco">Explorar productos</button>
      </section>
    </div>
  );
}
