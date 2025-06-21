import React, { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import PedidoCardEmpresa from "../../components/PedidoCardEmpresa";

export default function PedidosEmpresa() {
    const { user } = useAuth();
    const [pedidos, setPedidos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [orden, setOrden] = useState("reciente");
    const [limite, setLimite] = useState(5);
    const [paginaActual, setPaginaActual] = useState(1);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const fetchPedidos = async () => {
            if (!user) return;

            const pedidosRef = collection(db, "pedidos");
            const querySnapshot = await getDocs(pedidosRef);

            const data = [];

            for (const docSnap of querySnapshot.docs) {
                const pedido = docSnap.data();
                pedido.id = docSnap.id;

                const productosEmpresa = await Promise.all(
                    (pedido.productos || []).map(async (prod) => {
                        const prodDoc = await getDoc(doc(db, "productos", prod.productoId));
                        if (!prodDoc.exists() || prod.empresaId !== user.uid) return null;
                        return {
                            ...prod,
                            nombreProducto: prodDoc.data().nombre,
                            cantidadDisponible: prodDoc.data().cantidad,
                            estadoProducto: prodDoc.data().estado || "disponible"
                        };
                    })
                );

                const productosFiltrados = productosEmpresa.filter(Boolean);

                if (productosFiltrados.length > 0) {
                    data.push({
                        ...pedido,
                        productos: productosFiltrados,
                        fecha: pedido.fecha?.toDate?.() || new Date()
                    });
                }
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

    const actualizarPedido = async (pedidoId, nuevosDatos) => {
        const pedidoRef = doc(db, "pedidos", pedidoId);
        await updateDoc(pedidoRef, nuevosDatos);
    };

    const procesarPedido = async (pedidoId, productos, aprobado) => {
        const confirm = await Swal.fire({
            title: aprobado ? "¿Confirmar pedido?" : "¿Rechazar pedido?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: aprobado ? "Confirmar" : "Rechazar",
            cancelButtonText: "Cancelar"
        });

        if (!confirm.isConfirmed) return;

        if (aprobado) {
            for (const prod of productos) {
                const prodRef = doc(db, "productos", prod.productoId);
                const prodSnap = await getDoc(prodRef);
                if (!prodSnap.exists()) continue;

                const prodData = prodSnap.data();
                const nuevoStock = prodData.cantidad - prod.cantidad;

                const updateData = { cantidad: nuevoStock };
                if (nuevoStock <= 0) {
                    updateData.estado = "inactivo";
                }

                await updateDoc(prodRef, updateData);
            }

            await actualizarPedido(pedidoId, { estado: "en_proceso" });
            Swal.fire("Confirmado", "Pedido en proceso", "success");
        } else {
            await actualizarPedido(pedidoId, { estado: "cancelado" });
            Swal.fire("Rechazado", "Pedido rechazado", "info");
        }

        setPedidos((prev) =>
            prev.map((p) =>
                p.id === pedidoId ? { ...p, estado: aprobado ? "en_proceso" : "cancelado" } : p
            )
        );
    };

    const pedidosFiltrados = pedidos.filter((pedido) =>
        pedido.productos.some((prod) =>
            prod.nombreProducto.toLowerCase().includes(busqueda.toLowerCase())
        ) &&
        (filtroEstado === "" || pedido.estado === filtroEstado)
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
            <h3 className="mb-4">📦 Pedidos recibidos</h3>

            <div className="row mb-3 align-items-end">
                <div className="col-md-3">
                    <label>Buscar por producto</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Introduce el nombre del producto"
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPaginaActual(1);
                        }}
                    />
                </div>

                <div className="col-md-3">
                    <label>Filtrar por estado</label>
                    <select
                        className="form-select"
                        value={filtroEstado}
                        onChange={(e) => {
                            setFiltroEstado(e.target.value);
                            setPaginaActual(1);
                        }}
                    >
                        <option value="">Todos</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="en_proceso">En proceso</option>
                        <option value="cancelado">Cancelado</option>
                        <option value="completado">Completado</option>
                    </select>
                </div>

                <div className="col-md-3">
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

                <div className="col-md-3">
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
                            <PedidoCardEmpresa
                                pedido={pedido}
                                onConfirmar={() => procesarPedido(pedido.id, pedido.productos, true)}
                                onRechazar={() => procesarPedido(pedido.id, pedido.productos, false)}
                            />
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



