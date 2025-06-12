import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

export default function PerfilEmpresa() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        nombre: "",
        correo: "",
        rut: "",
        comuna: "",
        direccion: ""
    });

    const [comunas, setComunas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cargar perfil
    const cargarDatos = async () => {
        try {
            const ref = doc(db, "usuarios", user.uid);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                const data = snap.data();
                setFormData({
                    nombre: data.nombre || "",
                    correo: data.email || "",
                    rut: data.rut || "",
                    comuna: data.comuna || "",
                    direccion: data.direccion || ""
                });
            }
        } catch (error) {
            console.error("Error al cargar perfil:", error);
            Swal.fire("Error", "No se pudo cargar el perfil", "error");
        } finally {
            setLoading(false);
        }
    };

    // Cargar comunas desde Firestore
    useEffect(() => {
        const fetchComunas = async () => {
            try {
                const docRef = doc(db, "config", "comuna");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setComunas(docSnap.data().lista || []);
                } else {
                    console.error("No se encontró el documento de comunas");
                }
            } catch (error) {
                console.error("Error al obtener comunas:", error);
            }
        };

        fetchComunas();
    }, []);

    useEffect(() => {
        if (user?.uid) cargarDatos();
    }, [user]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const guardarCambios = async () => {
        // Validación de campos vacíos
        if (!formData.nombre.trim() || !formData.direccion.trim() || !formData.comuna) {
            return Swal.fire("Campos incompletos", "Debes completar nombre, comuna y dirección", "warning");
        }

        // Validaciones de longitud
        if (formData.nombre.length < 3 || formData.nombre.length > 60) {
            return Swal.fire("Error", "El nombre debe tener entre 3 y 60 caracteres", "warning");
        }

        if (formData.direccion.length < 5 || formData.direccion.length > 100) {
            return Swal.fire("Error", "La dirección debe tener entre 5 y 100 caracteres", "warning");
        }

        try {
            const ref = doc(db, "usuarios", user.uid);
            await updateDoc(ref, {
                nombre: formData.nombre,
                comuna: formData.comuna,
                direccion: formData.direccion,
                ubicacion: `${formData.comuna}, ${formData.direccion}`
            });

            Swal.fire("Guardado", "Perfil actualizado correctamente", "success");
        } catch (error) {
            console.error("Error al guardar perfil:", error);
            Swal.fire("Error", "No se pudieron guardar los cambios", "error");
        }
    };




    if (loading) return <p>Cargando perfil...</p>;

    return (
        <div className="container py-4">
            <h3>Perfil de la Empresa</h3>

            <div className="row mt-4">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                        type="text"
                        className="form-control"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                    />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label">Correo electrónico</label>
                    <input
                        type="email"
                        className="form-control"
                        name="correo"
                        value={formData.correo}
                        disabled
                    />
                </div>

                <div className="col-md-12 mb-3">
                    <label className="form-label">Ubicación completa</label>
                    <input
                        type="text"
                        className="form-control"
                        value={`${formData.comuna || ""}, ${formData.direccion || ""}`}
                        disabled
                    />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label">Comuna</label>
                    <select
                        className="form-select"
                        name="comuna"
                        value={formData.comuna}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione una comuna</option>
                        {comunas.map((c, i) => (
                            <option key={i} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label">Dirección</label>
                    <input
                        type="text"
                        className="form-control"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                    />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label">RUT</label>
                    <input
                        type="text"
                        className="form-control"
                        name="rut"
                        value={formData.rut}
                        disabled
                    />
                </div>
            </div>

            <button className="btn btn-success mt-3" onClick={guardarCambios}>
                Guardar Cambios
            </button>
        </div>
    );
}


