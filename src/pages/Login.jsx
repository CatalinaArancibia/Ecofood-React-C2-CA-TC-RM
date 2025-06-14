import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserData } from "../services/userService";

import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../services/firebase";
import Swal from "sweetalert2";

import "./Login.css"; // Asegúrate de tener un archivo CSS para los estilos personalizados
import logo from "../assets/img/conectela-logo.png"; // Importa el logo desde la carpeta `src/assets/img`



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        Swal.fire(
          "Correo no verificado",
          "Por favor, verifica tu correo antes de iniciar sesión.",
          "warning"
        );
        return;
      }

      // Obtener tipo de usuario desde Firestore
      const datos = await getUserData(user.uid);

      if (datos.tipo === "admin") {
        navigate("/admin/dashboard");
      } else if (datos.tipo === "empresa") {
        navigate("/empresa/dashboard");
      } else if (datos.tipo === "proveedor") {
        navigate("/proveedor/dashboard");
      } else {
        navigate("/"); // si no tiene tipo definido, va al home
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      Swal.fire(
        "Error",
        "No se pudo iniciar sesión. Verifica tus credenciales.",
        "error"
      );
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      Swal.fire("Error", "Por favor, ingresa tu correo electrónico", "error");

      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Swal.fire(
        "Correo enviado",
        "Revisa tu bandeja de entrada para restablecer tu contraseña",
        "success"
      );
    } catch (error) {
      Swal.fire(
        "Error",
        "No se pudo enviar el correo de recuperación",
        "error"
      );
    }
  };

  return (
    <div className="login-container">
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="card shadow-lg">
          <h2
            className="text-center mb-3"
            style={{ color: "#96a179", fontWeight: "bold" }}
          >
            Inicio de sesión
          </h2>
          <div className="text-center mb-5">
            <img
              src={logo}
              alt="Logo EcoFood"
              className="img-fluid"
              style={{ width: "100px" }}
            />
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Correo</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={100} // Máximo 100 caracteres
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6} // Mínimo 6 caracteres
                maxLength={20} // Máximo 20 caracteres
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-animate w-100"
              style={{ backgroundColor: "#96a179", color: "white" }}
            >
              Entrar
            </button>
          </form>
          <div className="text-center mt-3">
            <button
              type="button"
              className="btn btn-link"
              style={{ color: "#96a179", textDecoration: "none" }}
              onClick={handlePasswordReset}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="text-center mt-4">
            <p style={{ fontSize: "0.9rem", color: "#96a179" }}>
              ¿No tienes una cuenta?{" "}
              <a
                href="/Register"
                style={{ color: "#96a179", textDecoration: "none" }}
              >
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
