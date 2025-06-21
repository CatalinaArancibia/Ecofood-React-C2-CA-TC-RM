import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import CambiarContrasenaModal from "../../components/CambiarContrasenaModal";

export default function PerfilCliente() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    comuna: "",
    direccion: "",
  });

  const [comunas, setComunas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModalPassword, setMostrarModalPassword] = useState(false);

  // Cargar perfil
  const cargarDatos = async () => {
    try {
      const ref = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setFormData((prev) => ({
          ...prev,
          nombre: data.nombre || "",
          correo: data.email || "",
          comuna: data.comuna || "",
          direccion: data.direccion || "",
        }));
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      Swal.fire("Error", "No se pudo cargar el perfil", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchComunas = async () => {
      try {
        const docRef = doc(db, "config", "comuna");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setComunas(docSnap.data().lista || []);
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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const guardarCambios = async () => {
    if (!formData.nombre.trim() || !formData.direccion.trim() || !formData.comuna) {
      return Swal.fire("Campos incompletos", "Debes completar nombre, comuna y dirección", "warning");
    }

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
        ubicacion: `${formData.comuna}, ${formData.direccion}`,
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
      <h3>Editar Perfil</h3>
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
          <label className="form-label">Correo</label>
          <input type="email" className="form-control" value={formData.correo} disabled />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Comuna</label>
          <select
            className="form-select"
            name="comuna"
            value={formData.comuna}
            onChange={handleChange}
          >
            <option value="">Seleccione una comuna</option>
            {comunas.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
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
      </div>

      <button className="btn btn-success me-2" onClick={guardarCambios}>
        Guardar Cambios
      </button>
      <button
        className="btn btn-outline-primary"
        onClick={() => setMostrarModalPassword(true)}
      >
        Cambiar contraseña 🔒
      </button>

      {/* Modal estructurado con Bootstrap */}
      {mostrarModalPassword && (
        <CambiarContrasenaModal onClose={() => setMostrarModalPassword(false)} />
      )}
    </div>
  );
}

