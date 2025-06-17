import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getUserData } from "../services/userService";
import CerrarSesion from "../components/CerrarSesion";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";



import "./Home.css";

// Importar imágenes
import logo from "../assets/img/conectela-logo.png";
import quienesSomos from "../assets/img/ejemplo1.jpg";
import conectamos from "../assets/img/ejemplo3.png";
import innovamos from "../assets/img/ejemplo4.png";

export default function Home() {
  const { user } = useContext(AuthContext);
  const [datos, setDatos] = useState({ nombre: "", tipo: "" });
  const navigate = useNavigate();

  const irAlPanel = () => {
    if (!user) return;

    if (datos.tipo === "admin") {
      navigate("/admin/dashboard");
    } else if (datos.tipo === "empresa" || datos.tipo === "enterprise") {
      navigate("/empresa/dashboard");
    } else if (datos.tipo === "cliente") {
      navigate("/cliente/dashboard");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        const data = await getUserData(user.uid);
        if (data) {
          setDatos(data);
        }
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <div>
      {/* Header y Navbar */}
      <header className="p-0 m-0 border-0">
        <nav
          className="navbar navbar-expand-lg"
          style={{
            backgroundColor: "transparent",
            boxShadow: "none",
            border: "none",
          }}
        >
          <div className="container-fluid">
            <div className="navbar-brand d-flex align-items-center">
              <img
                src={logo}
                alt="Logo ConecTela"
                width="80"
                height="80"
                className="me-2"
              />
              <h1 className="mb-0 fs-4">ConecTela</h1>
            </div>


            <button
              className="navbar-toggler ms-auto"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarButtons"
              aria-controls="navbarButtons"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div
              className="collapse navbar-collapse justify-content-end"
              id="navbarButtons"
            >
              <div className="d-flex flex-lg-row flex-column align-items-lg-center align-items-end gap-2 mt-2 mt-lg-0">
                {user && datos?.nombre ? (
                  <>
                    <span className="user-greeting">Hola, {datos.nombre}</span>
                    <button
                      onClick={irAlPanel}
                      className="btn cerrar-sesion-btn ms-2"
                    >
                      Ir al Panel
                    </button>
                    <CerrarSesion className="btn cerrar-sesion-btn" />
                  </>
                ) : (
                  <Link to="/login" className="btn btn-outline-success">
                    Iniciar sesión
                  </Link>

                )}
              </div>
            </div>
          </div>
        </nav>
      </header>


      {/* Navbar de navegación */}
      <nav className="navbar navbar-expand-md border-top border-bottom">
        <div className="container-fluid">
          <button
            className="navbar-toggler ms-auto"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav flex-column flex-md-row justify-content-around w-100">
              <li className="nav-item">
                <a className="nav-link" href="#quienes-somos">¿Quiénes Somos?</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#que-hacemos">¿Qué Hacemos?</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#vision">Visión</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#mision">Misión</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contacto">Contacto</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="container my-4">
        <section id="quienes-somos" className="mb-5">
          <h2>¿Quiénes Somos?</h2>
          <p>
            ConecTela es una plataforma que busca conectar comunidades, empresas
            y personas para fortalecer redes de apoyo, sostenibilidad y desarrollo local.
          </p>
          <img
            src={quienesSomos}
            alt="Imagen representativa"
            className="img-fluid rounded img-ajustada"
          />
        </section>

        <section id="que-hacemos" className="mb-5">
          <h2>¿Qué Hacemos?</h2>
          <div className="row g-3">
            <div className="col-md-4">
              <img
                src={conectamos}
                className="img-fluid rounded img-quehacemos"
                alt="Conectamos"
              />
              <h3 className="h5 mt-2">Conectamos</h3>
              <p>
                Generamos puentes entre sectores para lograr alianzas estratégicas que beneficien a todos los actores locales.
              </p>
            </div>
            <div className="col-md-4">
              <img
                src={innovamos}
                className="img-fluid rounded img-quehacemos"
                alt="Innovamos"
              />
              <h3 className="h5 mt-2">Innovamos</h3>
              <p>
                Usamos la tecnología y creatividad para crear soluciones prácticas que ayuden a resolver problemáticas sociales reales.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contacto" className="pt-4 border-top">
        <div className="container">
          <h3>Contacto</h3>
          <p>Dirección: Calle Conexión 456, Ciudad Inteligente</p>
          <p>Email: contacto@conectela.cl</p>
          <ul>
            <li>Facebook: @ConecTelaOficial</li>
            <li>Instagram: @conectela_cl</li>
            <li>Twitter: @ConecTela</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}