import React, { useState, useEffect } from "react";
import ProductoModal from "../../components/ProductoModal";
import ProductoCard from "../../components/ProductoCard";
import { getProductosByEmpresaId } from "../../services/productoService";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { deleteProducto } from "../../services/productoService";

export default function ProductosEmpresa() {
    const { user } = useAuth();
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    const cargarProductos = async () => {
        if (!user) return;
        const data = await getProductosByEmpresaId(user.uid);
        setProductos(data);
    };

    useEffect(() => {
        cargarProductos();
    }, [busqueda, mostrarModal]);

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

    const productosFiltrados = productos.filter((p) => {
        const term = busqueda.toLowerCase();
        return (
            p.nombre.toLowerCase().includes(term) ||
            (p.categoria && p.categoria.toLowerCase().includes(term))
        );
    });

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
                    placeholder="Buscar por nombre o categoría..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>

            <div className="row row-cols-1 row-cols-md-3 g-4">
                {productosFiltrados.length === 0 && <p>No hay productos disponibles.</p>}
                {productosFiltrados.map((p) => (
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

            {mostrarModal && (
                <ProductoModal
                    producto={productoSeleccionado}
                    empresaId={user?.uid} // ← SE AGREGA AQUÍ
                    onClose={() => {
                        setProductoSeleccionado(null);
                        setMostrarModal(false);
                    }}
                />
            )}
        </div>
    );
}

