import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Recover() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleRecover = async (e) => {
    e.preventDefault();

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      Swal.fire(
        "Correo enviado",
        "Revisa tu bandeja de entrada para restablecer tu contraseña.",
        "success"
      );
      navigate("/login");
    } catch (error) {
      console.error("Error al recuperar contraseña:", error);
      let mensaje = "No se pudo enviar el correo.";

      if (error.code === "auth/user-not-found") {
        mensaje = "No hay una cuenta registrada con ese correo.";
      } else if (error.code === "auth/invalid-email") {
        mensaje = "Correo inválido.";
      }

      Swal.fire("Error", mensaje, "error");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Recuperar contraseña</h2>
      <form onSubmit={handleRecover}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-control my-3"
        />
        <button type="submit" className="btn btn-primary">
          Enviar enlace de recuperación
        </button>
      </form>
    </div>
  );
}
