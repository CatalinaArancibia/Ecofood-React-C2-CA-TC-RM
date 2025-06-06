import React, { useEffect, useState } from "react";
import { getProductosByEmpresaId, deleteProducto } from "../../services/productoService";
import { useAuth } from "../../context/AuthContext";
import ProductoCard from "../../components/ProductoCard";
import ProductoModal from "../../components/ProductoModal";
import Swal from "sweetalert2";

const ProductosEmpresa = () => {
    const { user } = useAuth();
    const [productos, setProductos] = useState([]);
    const [filtro, setFiltro] = useState("todos");
    const [mostrarModal, setMostrarModal] = useState(false);
    const [productoEditar, setProductoEditar] = useState(null);

    const cargarProductos = async () => {
        const lista = await getProductosByEmpresaId(user.uid);
        setProductos(lista);
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    const handleEditar = (producto) => {
        setProductoEditar(producto);
        setMostrarModal(true);
    };

    const handleEliminar = async (id) => {
        const confirmacion = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esto eliminará el producto.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
        });

        if (confirmacion.isConfirmed) {
            await deleteProducto(id);
            Swal.fire("Eliminado", "Producto eliminado correctamente", "success");
            cargarProductos();
        }
    };

    const productosFiltrados = productos.filter((p) => {
        const hoy = new Date();
        const vencimiento = new Date(p.vencimiento);
        const diasRestantes = (vencimiento - hoy) / (1000 * 60 * 60 * 24);

        if (filtro === "gratuitos") return p.precio === 0;
        if (filtro === "valor") return p.precio > 0;
        if (filtro === "por-vencer") return diasRestantes <= 3 && diasRestantes >= 0;
        return true;
    });

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Gestión de Productos</h2>

            <div className="mb-3 d-flex gap-2 flex-wrap">
                <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>Crear Producto</button>
                <button className="btn btn-outline-secondary" onClick={() => setFiltro("todos")}>Todos</button>
                <button className="btn btn-outline-success" onClick={() => setFiltro("gratuitos")}>Gratuitos</button>
                <button className="btn btn-outline-info" onClick={() => setFiltro("valor")}>Con Valor</button>
                <button className="btn btn-outline-warning" onClick={() => setFiltro("por-vencer")}>Por Vencer</button>
            </div>

            <div className="row">
                {productosFiltrados.map((producto) => (
                    <div className="col-md-4 mb-4" key={producto.id}>
                        <ProductoCard
                            producto={producto}
                            onEditar={handleEditar}
                            onEliminar={handleEliminar}
                        />
                    </div>
                ))}
            </div>

            {mostrarModal && (
                <ProductoModal
                    producto={productoEditar}
                    onClose={() => {
                        setProductoEditar(null);
                        setMostrarModal(false);
                        cargarProductos();
                    }}
                />
            )}
        </div>
    );
};

export default ProductosEmpresa;
