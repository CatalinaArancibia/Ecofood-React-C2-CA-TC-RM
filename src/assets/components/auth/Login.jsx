import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      if (!userCredential.user.emailVerified) {
        Swal.fire("Verifica tu correo", "Debes verificar tu cuenta antes de ingresar", "warning");
        return;
      }
      Swal.fire("¡Bienvenido!", "Inicio de sesión correcto", "success");
      navigate("/"); // Cambia a la ruta principal
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label>Email:</label>
          <input type="email" name="email" className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Contraseña:</label>
          <input type="password" name="password" className="form-control" onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-success">Iniciar Sesión</button>
      </form>
    </div>
  );
}

export default Login;
