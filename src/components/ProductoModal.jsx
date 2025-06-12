import React, { useEffect, useState } from "react";
import { addProducto as createProducto, updateProducto } from "../services/productoService";
import Swal from "sweetalert2";

const ProductoModal = ({ producto, empresaId, onClose }) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [estado, setEstado] = useState("disponible");
  const [vencimiento, setVencimiento] = useState("");

  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre || "");
      setDescripcion(producto.descripcion || "");
      setCantidad(producto.cantidad?.toString() || "");
      setPrecio(producto.precio?.toString() || "");
      setEstado(producto.estado || "disponible");
      setVencimiento(producto.vencimiento?.split("T")[0] || "");
    }
  }, [producto]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hoy = new Date().toISOString().split("T")[0];

    if (
      !nombre.trim() ||
      !descripcion.trim() ||
      !vencimiento ||
      isNaN(cantidad) || Number(cantidad) < 0 ||
      isNaN(precio) || Number(precio) < 0
    ) {
      Swal.fire("Error", "Completa todos los campos correctamente", "error");
      return;
    }

    if (vencimiento < hoy) {
      Swal.fire("Error", "La fecha de vencimiento no puede ser anterior a hoy", "error");
      return;
    }

    const data = {
      nombre,
      descripcion,
      cantidad: Number(cantidad),
      precio: Number(precio),
      estado,
      vencimiento,
      ...(empresaId && { empresaId }),
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

  const diasParaVencer = vencimiento
    ? Math.ceil((new Date(vencimiento) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

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
                  <input
                    type="text"
                    className="form-control"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre del producto"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Cantidad</label>
                  <input
                    type="number"
                    className="form-control"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Ej: 20"
                    min="0"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Precio</label>
                  <input
                    type="number"
                    className="form-control"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="Ej: 1000"
                    min="0"
                  />
                  {Number(precio) === 0 && (
                    <div className="form-text text-success fw-bold">Este producto es gratuito</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Vencimiento</label>
                  <input
                    type="date"
                    className="form-control"
                    value={vencimiento}
                    onChange={(e) => setVencimiento(e.target.value)}
                    required
                  />
                  {diasParaVencer !== null && diasParaVencer <= 3 && diasParaVencer >= 0 && (
                    <div className="form-text text-danger fw-bold">
                      ⚠ Este producto vence en {diasParaVencer} día(s)
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe brevemente el producto"
                    required
                  ></textarea>
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
