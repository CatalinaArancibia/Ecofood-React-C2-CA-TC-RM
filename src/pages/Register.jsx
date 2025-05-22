import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../services/firebase";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import { saveUserData } from "../services/userService";
import "./Register.css";

import logo from "../assets/img/logo.png";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [comuna, setComuna] = useState("");
  const [telefono, setTelefono] = useState("");
  const tipo = "cliente"; // Tipo de usuario fijo como "Cliente"
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserData(cred.user.uid, { nombre, direccion, comuna, telefono, tipo, email });

      // Enviar correo de verificación
      await sendEmailVerification(cred.user);
      Swal.fire(
        "Registro exitoso",
        "Se ha enviado un correo de verificación. Por favor, verifica tu correo antes de iniciar sesión.",
        "success"
      );

      // Redirigir al usuario a la página de inicio de sesión
      navigate("/login");
    } catch (error) {
      let errorMessage = "No se pudo registrar";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "El correo ya está en uso";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña es demasiado débil";
      }
      Swal.fire("Error", errorMessage, "error");
    }
  };

  return (
    <div className="register-container">
      <div className="card">
        <h2 className="text-center mb-3" style={{ color: "#96a179", fontWeight: "bold" }}>
          Registro
        </h2>
        <div className="text-center mb-5">
          <img src={logo} alt="Logo EcoFood" className="img-fluid" style={{ width: "100px" }} />
        </div>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Nombre completo</label>
            <input
              type="text"
              className="form-control"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              minLength={3} // Mínimo 3 caracteres
              maxLength={50} // Máximo 50 caracteres
              required
            />
          </div>
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
            <small className="text-muted">
            mínimo 6 caracteres, combinando letras y números como recomendación
            </small>
          </div>
          <div className="mb-3">
            <label className="form-label">Dirección</label>
            <input
              type="text"
              className="form-control"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              minLength={5} // Mínimo 5 caracteres
              maxLength={100} // Máximo 100 caracteres
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Comuna</label>
            <input
              type="text"
              className="form-control"
              value={comuna}
              onChange={(e) => setComuna(e.target.value)}
              minLength={3} // Mínimo 3 caracteres
              maxLength={50} // Máximo 50 caracteres
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Teléfono (opcional)</label>
            <input
              type="tel"
              className="form-control"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              minLength={8} // Mínimo 8 caracteres
              maxLength={15} // Máximo 15 caracteres
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Tipo de usuario</label>
            <input
              type="text"
              className="form-control"
              value={tipo}
              readOnly
              style={{ backgroundColor: "#e9ecef", cursor: "not-allowed" }}
            />
          </div>
          <button
              type="submit"
              className="btn btn-animate w-100"
              style={{ backgroundColor: "#96a179", color: "white" }}
            >
              Registrar
            </button>
        </form>
        <div className="text-center mt-4">
          <p>
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" style={{ color: "#96a179", textDecoration: "none" }}>
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
