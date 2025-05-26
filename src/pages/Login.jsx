import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../services/firebase";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext"; // Importa el hook de contexto

import "./Login.css";
import logo from "../assets/img/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth(); // Obtén el usuario actual

  // REDIRECCIONAR SI YA ESTÁ LOGUEADO
  useEffect(() => {
    if (user) {
      const tipo = user?.tipo || user?.userType; 
      if (tipo === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (tipo === "client") {
        navigate("/cliente/dashboard", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const loggedUser = userCredential.user;

      if (!loggedUser.emailVerified) {
        Swal.fire(
          "Correo no verificado",
          "Por favor, verifica tu correo antes de iniciar sesión.",
          "warning"
        );
        return;
      }

      // Esperar a que el contexto Auth se actualice automáticamente, no navegues aquí
    } catch (error) {
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
                maxLength={100}
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
                minLength={6}
                maxLength={20}
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