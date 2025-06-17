import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";

export default function PedidosCliente() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);

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
            const empresaDocRef = doc(db, "usuarios", prod.empresaId); // CORREGIDO AQUÍ

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

        data.push({ ...pedido, productos: productosConNombres });
      }

      setPedidos(data);
    };

    fetchPedidos();
  }, [user]);

  const cancelarPedido = async (pedidoId) => {
    await updateDoc(doc(db, "pedidos", pedidoId), { estado: "cancelado" });
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedidoId ? { ...p, estado: "cancelado" } : p))
    );
  };

  return (
    <div className="container py-4">
      <h3>🧾 Mis pedidos</h3>
      {pedidos.length === 0 ? (
        <p className="text-muted">No tienes pedidos realizados.</p>
      ) : (
        pedidos.map((pedido) => (
          <div key={pedido.id} className="card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                Estado: <span className="badge bg-info text-dark">{pedido.estado}</span>
              </h5>
              <ul className="list-group list-group-flush">
                {pedido.productos.map((prod, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between">
                    <span>
                      <strong>{prod.nombreProducto}</strong><br />
                      <small className="text-muted">Empresa: {prod.nombreEmpresa}</small>
                    </span>
                    <span className="badge bg-secondary">{prod.cantidad} unidad(es)</span>
                  </li>
                ))}
              </ul>
              {pedido.estado === "pendiente" && (
                <button
                  className="btn btn-danger mt-3"
                  onClick={() => cancelarPedido(pedido.id)}
                >
                  ❌ Cancelar solicitud
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
