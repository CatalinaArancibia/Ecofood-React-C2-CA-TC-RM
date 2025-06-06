import React, { useEffect, useState } from "react";
import { addProducto as createProducto, updateProducto } from "../services/productoService";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

const ProductoModal = ({ producto, onClose }) => {
    const { user } = useAuth();

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [cantidad, setCantidad] = useState(0);
    const [precio, setPrecio] = useState(0);
    const [estado, setEstado] = useState("activo");
    const [vencimiento, setVencimiento] = useState("");

    useEffect(() => {
        if (producto) {
            setNombre(producto.nombre);
            setDescripcion(producto.descripcion);
            setCantidad(producto.cantidad);
            setPrecio(producto.precio);
            setEstado(producto.estado);
            setVencimiento(producto.vencimiento?.split("T")[0] || "");
        }
    }, [producto]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nombre || !descripcion || !vencimiento || cantidad < 0 || precio < 0) {
            Swal.fire("Error", "Completa todos los campos correctamente", "error");
            return;
        }

        const data = {
            nombre,
            descripcion,
            cantidad: Number(cantidad),
            precio: Number(precio),
            estado,
            vencimiento,
            empresaId: user.uid,
        };

        try {
            if (producto) {
                await updateProducto(producto.id, data);
                Swal.fire("Actualizado", "Producto editado correctamente", "success");
            } else {
                await createProducto(data);
                Swal.fire("Creado", "Producto agregado correctamente", "success");
            }
            onClose();
        } catch (err) {
            Swal.fire("Error", "Ocurrió un problema al guardar", "error");
        }
    };

    return (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{producto ? "Editar Producto" : "Nuevo Producto"}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Nombre</label>
                                    <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Cantidad</label>
                                    <input type="number" className="form-control" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required min="0" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Precio</label>
                                    <input type="number" className="form-control" value={precio} onChange={(e) => setPrecio(e.target.value)} required min="0" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Estado</label>
                                    <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Vencimiento</label>
                                    <input type="date" className="form-control" value={vencimiento} onChange={(e) => setVencimiento(e.target.value)} required />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Descripción</label>
                                    <textarea className="form-control" rows="3" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="submit" className="btn btn-success">Guardar</button>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductoModal;
