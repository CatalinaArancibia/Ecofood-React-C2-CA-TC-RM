import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { getAuth } from "firebase/auth";


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
  const [passwordForm, setPasswordForm] = useState({
    actual: "",
    nueva: "",
    repetir: "",
  });

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

  const handlePasswordChange = async () => {
    const { actual, nueva, repetir } = passwordForm;
    const auth = getAuth();
    const firebaseUser = auth.currentUser;

    if (!actual || !nueva || !repetir) {
      return Swal.fire("Error", "Todos los campos son obligatorios", "warning");
    }

    if (nueva !== repetir) {
      return Swal.fire("Error", "Las nuevas contraseñas no coinciden", "warning");
    }

    if (nueva.length < 6) {
      return Swal.fire("Error", "La nueva contraseña debe tener al menos 6 caracteres", "warning");
    }

    try {
      const credential = EmailAuthProvider.credential(firebaseUser.email, actual);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, nueva);

      Swal.fire("Éxito", "Contraseña actualizada correctamente", "success");
      setMostrarModalPassword(false);
      setPasswordForm({ actual: "", nueva: "", repetir: "" });
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      Swal.fire("Error", "La contraseña actual es incorrecta o el cambio falló", "error");
    }
  };


  if (loading) return <p>Cargando perfil...</p>;

  return (
    <div className="container py-4">
      <h3>Editar Perfil</h3>
      <div className="row mt-4">
        <div className="col-md-6 mb-3">
          <label className="form-label">Nombre</label>
          <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleChange} />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Correo</label>
          <input type="email" className="form-control" value={formData.correo} disabled />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Comuna</label>
          <select className="form-select" name="comuna" value={formData.comuna} onChange={handleChange}>
            <option value="">Seleccione una comuna</option>
            {comunas.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Dirección</label>
          <input type="text" className="form-control" name="direccion" value={formData.direccion} onChange={handleChange} />
        </div>
      </div>

      <button className="btn btn-success me-2" onClick={guardarCambios}>
        Guardar Cambios
      </button>
      <button className="btn btn-outline-primary" onClick={() => setMostrarModalPassword(true)}>
        Cambiar contraseña 🔒
      </button>

      {/* Modal contraseña */}
      {mostrarModalPassword && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
          }}
        >
          <div className="bg-white p-4 rounded shadow" style={{ minWidth: "300px" }}>
            <h5>Cambiar contraseña</h5>
            <div className="mb-2">
              <label>Contraseña actual</label>
              <input
                type="password"
                className="form-control"
                value={passwordForm.actual}
                onChange={(e) => setPasswordForm({ ...passwordForm, actual: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label>Nueva contraseña</label>
              <input
                type="password"
                className="form-control"
                value={passwordForm.nueva}
                onChange={(e) => setPasswordForm({ ...passwordForm, nueva: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label>Repetir nueva contraseña</label>
              <input
                type="password"
                className="form-control"
                value={passwordForm.repetir}
                onChange={(e) => setPasswordForm({ ...passwordForm, repetir: e.target.value })}
              />
            </div>
            <div className="d-flex justify-content-between">
              <button className="btn btn-secondary" onClick={() => setMostrarModalPassword(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handlePasswordChange}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

