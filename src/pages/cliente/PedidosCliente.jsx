import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import PedidoCard from "../../components/PedidoCard";

export default function PedidosCliente() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("reciente");
  const [limite, setLimite] = useState(5);
  const [paginaActual, setPaginaActual] = useState(1);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!user) return;

      const pedidosRef = collection(db, "pedidos");
      const q = query(pedidosRef, where("clienteId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const data = [];

      for (const docSnap of querySnapshot.docs) {
        const pedido = docSnap.data();
        pedido.id = docSnap.id;

        const productosConNombres = await Promise.all(
          (pedido.productos || []).map(async (prod) => {
            const prodDocRef = doc(db, "productos", prod.productoId);
            const empresaDocRef = doc(db, "usuarios", prod.empresaId);

            const [prodSnap, empresaSnap] = await Promise.all([
              getDoc(prodDocRef),
              getDoc(empresaDocRef)
            ]);

            return {
              ...prod,
              nombreProducto: prodSnap.exists() ? prodSnap.data().nombre : "Producto desconocido",
              nombreEmpresa: empresaSnap.exists() ? empresaSnap.data().nombre : "Empresa desconocida"
            };
          })
        );

        data.push({
          ...pedido,
          productos: productosConNombres,
          fecha: pedido.fecha?.toDate?.() || new Date()
        });
      }

      setPedidos(data);
    };

    fetchPedidos();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cancelarPedido = async (pedidoId) => {
    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!pedido) return;

    if (pedido.estado === "pendiente") {
      const confirm = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará tu pedido pendiente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No, volver"
      });

      if (confirm.isConfirmed) {
        await deleteDoc(doc(db, "pedidos", pedidoId));
        setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
        Swal.fire("Cancelado", "Tu pedido fue eliminado.", "success");
      }
    } else {
      Swal.fire("No permitido", "Este pedido ya no se puede cancelar.", "warning");
    }
  };

  const pedidosFiltrados = pedidos.filter((pedido) =>
    pedido.productos.some((prod) =>
      prod.nombreProducto.toLowerCase().includes(busqueda.toLowerCase()) ||
      prod.nombreEmpresa.toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  const pedidosOrdenados = [...pedidosFiltrados].sort((a, b) => {
    if (orden === "reciente") return b.fecha - a.fecha;
    if (orden === "antiguo") return a.fecha - b.fecha;
    if (orden === "estado") return a.estado.localeCompare(b.estado);
    return 0;
  });

  const totalPaginas = Math.ceil(pedidosOrdenados.length / limite);
  const inicio = (paginaActual - 1) * limite;
  const pedidosPaginados = pedidosOrdenados.slice(inicio, inicio + limite);

  return (
    <div className="container py-4">
      <h3 className="mb-4">🧾 Mis pedidos</h3>

      <div className="row mb-3 align-items-end">
        <div className="col-md-4">
          <label>Buscar por producto o empresa</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej. arroz, EcoFood..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />
        </div>

        <div className="col-md-4">
          <label>Ordenar por</label>
          <select
            className="form-select"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="reciente">Más reciente</option>
            <option value="antiguo">Más antiguo</option>
            <option value="estado">Estado</option>
          </select>
        </div>

        <div className="col-md-4">
          <label>Pedidos por página</label>
          <select
            className="form-select"
            value={limite}
            onChange={(e) => {
              setLimite(Number(e.target.value));
              setPaginaActual(1);
            }}
          >
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </div>
      </div>

      {pedidosPaginados.length === 0 ? (
        <p className="text-muted">No hay pedidos que coincidan con tu búsqueda.</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {pedidosPaginados.map((pedido) => (
            <div key={pedido.id} className="col">
              <PedidoCard pedido={pedido} onCancelar={cancelarPedido} />
            </div>
          ))}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="mt-4 d-flex justify-content-center gap-2 flex-wrap">
          <button
            className="btn btn-outline-success"
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
          >
            ← Anterior
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              className={`btn ${paginaActual === i + 1 ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setPaginaActual(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="btn btn-outline-success"
            disabled={paginaActual === totalPaginas}
            onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
          >
            Siguiente →
          </button>
        </div>
      )}

      {scrollY > 100 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="btn btn-success rounded-circle"
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            zIndex: 9999,
            width: "50px",
            height: "50px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
          title="Volver arriba"
        >
          ↑
        </button>
      )}
    </div>
  );
}


