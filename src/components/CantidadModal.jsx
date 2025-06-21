import React, { useState } from "react";
import Swal from "sweetalert2";

const CantidadModal = ({ producto, onConfirmar, onCerrar }) => {
    const [cantidad, setCantidad] = useState("1");
    const maxDigits = producto.cantidad.toString().length;

    const handleChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= maxDigits) {
            setCantidad(value);
        }
    };

    const aumentar = () => {
        const num = Number(cantidad) || 1;
        if (num < producto.cantidad) {
            setCantidad((num + 1).toString());
        }
    };

    const disminuir = () => {
        const num = Number(cantidad) || 1;
        if (num > 1) {
            setCantidad((num - 1).toString());
        }
    };

    const confirmar = () => {
        const num = Number(cantidad);
        if (!num || num < 1) {
            Swal.fire("Error", "La cantidad mínima es 1.", "warning");
            setCantidad("1");
            return;
        }
        if (num > producto.cantidad) {
            Swal.fire("Error", "La cantidad no puede superar el stock disponible.", "warning");
            setCantidad("1");
            return;
        }
        onConfirmar(num);
        onCerrar();

    };

    const precioTotal = producto.precio * (Number(cantidad) || 0);

    return (
        <div
            className="modal d-block"
            tabIndex="-1"
            style={{
                background: "transparent",
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1050,
            }}
        >
            <div className="modal-dialog">
                <div className="modal-content shadow-sm">
                    <div className="modal-header">
                        <h5 className="modal-title">{producto.nombre}</h5>
                        <button type="button" className="btn-close" onClick={onCerrar}></button>
                    </div>
                    <div className="modal-body text-center">
                        <p className="mb-3">¿Cuántas unidades deseas agregar al carrito?</p>

                        {/* Input cantidad con botones */}
                        <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                            <button className="btn btn-outline-secondary" onClick={disminuir}>−</button>
                            <input
                                type="text"
                                value={cantidad}
                                onChange={handleChange}
                                className="form-control text-center"
                                style={{ width: "70px", fontWeight: "bold" }}
                                maxLength={maxDigits}
                            />
                            <button className="btn btn-outline-secondary" onClick={aumentar}>+</button>
                        </div>

                        {/* Visualización del stock con estilo más grande */}
                        <div className="fs-6 fw-semibold text-muted mb-2">
                            Stock disponible: {producto.cantidad}
                        </div>

                        {/* Mostrar precio total */}
                        <div className="fs-5 fw-bold mt-2">
                            {producto.precio === 0
                                ? <span className="text-success">Este producto es gratuito</span>
                                : `Total: $${precioTotal.toLocaleString("es-CL")}`}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-success" onClick={confirmar}>Confirmar</button>
                        <button className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default CantidadModal;

