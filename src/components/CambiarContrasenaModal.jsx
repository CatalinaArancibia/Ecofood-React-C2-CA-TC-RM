import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

export default function CambiarContrasenaModal({ onClose }) {
  const [form, setForm] = useState({ actual: "", nueva: "", repetir: "" });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const { actual, nueva, repetir } = form;
    const auth = getAuth();
    const usuario = auth.currentUser;

    if (!actual || !nueva || !repetir) {
      return Swal.fire("Error", "Todos los campos son obligatorios", "warning");
    }

    if (nueva.length < 6) {
      return Swal.fire("Error", "La nueva contraseña debe tener al menos 6 caracteres", "warning");
    }

    if (nueva !== repetir) {
      return Swal.fire("Error", "Las nuevas contraseñas no coinciden", "warning");
    }

    if (nueva === actual) {
      return Swal.fire("Error", "La nueva contraseña no puede ser igual a la actual", "warning");
    }

    try {
      const credencial = EmailAuthProvider.credential(usuario.email, actual);
      await reauthenticateWithCredential(usuario, credencial);
      await updatePassword(usuario, nueva);

      await Swal.fire("Éxito", "Contraseña actualizada correctamente", "success");
      onClose();
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      Swal.fire("Error", "La contraseña actual es incorrecta o el cambio falló", "error");
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleGuardar}>
            <div className="modal-header">
              <h5 className="modal-title">Cambiar contraseña</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <div className="mb-2">
                <label>Contraseña actual</label>
                <input
                  type="password"
                  name="actual"
                  className="form-control"
                  value={form.actual}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-2">
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  name="nueva"
                  className="form-control"
                  value={form.nueva}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>Repetir nueva contraseña</label>
                <input
                  type="password"
                  name="repetir"
                  className="form-control"
                  value={form.repetir}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

