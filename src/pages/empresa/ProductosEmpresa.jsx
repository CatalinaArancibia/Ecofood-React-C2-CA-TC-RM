import React, { useState, useEffect } from "react";
import ProductoModal from "../../components/ProductoModal";
import ProductoCard from "../../components/ProductoCard";
import { getProductosByEmpresaId, deleteProducto } from "../../services/productoService";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

export default function ProductosEmpresa() {
    const { user } = useAuth();
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    const [estadoFiltro, setEstadoFiltro] = useState("todos");
    const [orden, setOrden] = useState("nombre-asc");
    const [limite, setLimite] = useState(5);
    const [paginaActual, setPaginaActual] = useState(1);

    const cargarProductos = async () => {
        if (!user) return;
        const data = await getProductosByEmpresaId(user.uid);
        setProductos(data);
    };

    useEffect(() => {
        cargarProductos();
    }, [busqueda, mostrarModal]);

    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    const handleEliminar = async (id) => {
        const confirm = await Swal.fire({
            title: "¿Eliminar producto?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (confirm.isConfirmed) {
            await deleteProducto(id);
            Swal.fire("Eliminado", "Producto eliminado correctamente", "success");
            cargarProductos();
        }
    };

    // Filtro + búsqueda
    const productosFiltrados = productos.filter((p) => {
        const term = busqueda.toLowerCase();
        const coincideBusqueda =
            p.nombre.toLowerCase().includes(term) ||
            (p.categoria && p.categoria.toLowerCase().includes(term));

        const hoy = new Date();
        const vencimiento = new Date(p.vencimiento);
        let coincideEstado = true;

        if (estadoFiltro === "disponibles") {
            coincideEstado = p.estado === "disponible";
        } else if (estadoFiltro === "por-vencer") {
            const diferencia = vencimiento - hoy;
            coincideEstado = diferencia <= 3 * 86400000 && diferencia >= 0;
        } else if (estadoFiltro === "vencidos") {
            coincideEstado = vencimiento < hoy;
        }

        return coincideBusqueda && coincideEstado;
    });

    // Ordenamiento
    const productosOrdenados = [...productosFiltrados].sort((a, b) => {
        if (orden === "nombre-asc") return a.nombre.localeCompare(b.nombre);
        if (orden === "nombre-desc") return b.nombre.localeCompare(a.nombre);
        if (orden === "precio-asc") return a.precio - b.precio;
        if (orden === "precio-desc") return b.precio - a.precio;
        return 0;
    });

    // Paginación
    const inicio = (paginaActual - 1) * limite;
    const productosPaginados = productosOrdenados.slice(inicio, inicio + limite);
    const totalPaginas = Math.ceil(productosOrdenados.length / limite);

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>Mis Productos</h3>
                <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>
                    Agregar Producto
                </button>
            </div>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Introduce el nombre del producto para buscarlo"
                    value={busqueda}
                    onChange={(e) => {
                        setBusqueda(e.target.value);
                        setPaginaActual(1);
                    }}
                />
            </div>

            <div className="row mb-4">
                <div className="col-md-3">
                    <label>Estado</label>
                    <select
                        className="form-select"
                        value={estadoFiltro}
                        onChange={(e) => {
                            setEstadoFiltro(e.target.value);
                            setPaginaActual(1);
                        }}
                    >
                        <option value="todos">Todos</option>
                        <option value="disponibles">Disponibles</option>
                        <option value="por-vencer">Por vencer</option>
                        <option value="vencidos">Vencidos</option>
                    </select>
                </div>

                <div className="col-md-3">
                    <label>Ordenar por</label>
                    <select
                        className="form-select"
                        value={orden}
                        onChange={(e) => setOrden(e.target.value)}
                    >
                        <option value="nombre-asc">Nombre (A-Z)</option>
                        <option value="nombre-desc">Nombre (Z-A)</option>
                        <option value="precio-asc">Precio (↑)</option>
                        <option value="precio-desc">Precio (↓)</option>
                    </select>
                </div>

                <div className="col-md-3">
                    <label>Productos por página</label>
                    <select
                        className="form-select"
                        value={limite}
                        onChange={(e) => {
                            setLimite(Number(e.target.value));
                            setPaginaActual(1);
                        }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>
                </div>
            </div>

            <div className="row row-cols-1 row-cols-md-3 g-4">
                {productosPaginados.length === 0 && <p>No hay productos disponibles.</p>}
                {productosPaginados.map((p) => (
                    <div key={p.id} className="col">
                        <ProductoCard
                            producto={p}
                            onEditar={(p) => {
                                setProductoSeleccionado(p);
                                setMostrarModal(true);
                            }}
                            onEliminar={handleEliminar}
                        />
                    </div>
                ))}
            </div>

            {/* Paginación */}
            <div className="mt-4 d-flex justify-content-center gap-2 flex-wrap">
                <button
                    className="btn btn-outline-success"
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                >
                    ← Página anterior
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
                    Página siguiente →
                </button>
            </div>




            {mostrarModal && (
                <ProductoModal
                    producto={productoSeleccionado}
                    empresaId={user?.uid}
                    onClose={() => {
                        setProductoSeleccionado(null);
                        setMostrarModal(false);
                    }}
                />
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
                        boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
                    }}
                    title="Volver arriba"
                >
                    ↑
                </button>
            )}

        </div>
    );
}


