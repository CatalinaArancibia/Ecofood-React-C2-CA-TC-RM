import React, { useState } from "react";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

export default function CambiarContrasenaModal({ onClose }) {
  const auth = getAuth();
  const firebaseUser = auth.currentUser;

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verificado, setVerificado] = useState(false);

  const verificarActual = async () => {
    try {
      const credencial = EmailAuthProvider.credential(firebaseUser.email, actual);
      await reauthenticateWithCredential(firebaseUser, credencial);
      setVerificado(true);
      Swal.fire("Verificado", "Contraseña actual correcta", "success");
    } catch (err) {
      Swal.fire("Error", "Contraseña actual incorrecta", "error");
    }
  };

  const cambiarContrasena = async () => {
    if (nueva !== confirmar) {
      return Swal.fire("Error", "Las contraseñas nuevas no coinciden", "warning");
    }

    if (nueva.length < 6) {
      return Swal.fire("Error", "La nueva contraseña debe tener al menos 6 caracteres", "warning");
    }

    try {
      await updatePassword(firebaseUser, nueva);
      Swal.fire("Éxito", "Contraseña actualizada correctamente", "success");
      onClose();
    } catch (err) {
      console.error("Error al cambiar contraseña:", err);
      Swal.fire("Error", "No se pudo cambiar la contraseña", "error");
    }
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{
        background: "rgba(0,0,0,0.5)",
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Cambiar contraseña</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Contraseña actual */}
            <div className="mb-3">
              <label className="form-label">Contraseña actual</label>
              <input
                type="password"
                className="form-control"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                disabled={verificado}
              />
            </div>

            {!verificado ? (
              <button className="btn btn-primary w-100" onClick={verificarActual}>
                Verificar contraseña actual
              </button>
            ) : (
              <>
                <div className="mb-3">
                  <label className="form-label">Nueva contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={nueva}
                    onChange={(e) => setNueva(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                  />
                </div>

                <button className="btn btn-success w-100" onClick={cambiarContrasena}>
                  Cambiar contraseña
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
