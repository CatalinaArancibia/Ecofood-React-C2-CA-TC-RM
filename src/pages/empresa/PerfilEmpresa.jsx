// src/pages/empresa/PerfilEmpresa.jsx
import React, { useEffect, useState } from "react";
import { getEmpresaById as getEmpresa, updateEmpresa } from "../../services/empresaService";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

const PerfilEmpresa = () => {
    const { user } = useAuth();
    const [empresa, setEmpresa] = useState(null);
    const [ubicacion, setUbicacion] = useState("");
    const [editando, setEditando] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            console.log("UID del usuario:", user.uid);
            const datos = await getEmpresa(user.uid);
            setEmpresa(datos);
            setUbicacion(datos?.ubicacion || "");
        };
        cargarDatos();
    }, [user.uid]);

    const guardarCambios = async () => {
        if (!ubicacion.trim()) {
            Swal.fire("Error", "La ubicación no puede estar vacía", "error");
            return;
        }

        await updateEmpresa(user.uid, { ubicacion });
        Swal.fire("Éxito", "Ubicación actualizada correctamente", "success");
        setEditando(false);
    };

    if (!empresa) return <div className="container mt-5">Cargando perfil...</div>;

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Perfil de Empresa</h2>
            <div className="card p-4 shadow">
                <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input className="form-control" value={empresa.nombre} disabled />
                </div>
                <div className="mb-3">
                    <label className="form-label">Correo</label>
                    <input className="form-control" value={empresa.correo} disabled />
                </div>
                <div className="mb-3">
                    <label className="form-label">Ubicación</label>
                    <input
                        className="form-control"
                        value={ubicacion}
                        disabled={!editando}
                        onChange={(e) => setUbicacion(e.target.value)}
                    />
                </div>
                <div className="d-flex gap-2">
                    {!editando ? (
                        <button className="btn btn-primary" onClick={() => setEditando(true)}>
                            Editar Ubicación
                        </button>
                    ) : (
                        <>
                            <button className="btn btn-success" onClick={guardarCambios}>
                                Guardar Cambios
                            </button>
                            <button className="btn btn-secondary" onClick={() => setEditando(false)}>
                                Cancelar
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PerfilEmpresa;
