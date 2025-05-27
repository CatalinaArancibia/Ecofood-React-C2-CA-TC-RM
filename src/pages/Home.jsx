import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { getUserData } from "../services/userService";
import CerrarSesion from "../components/CerrarSesion";
import { useNavigate } from "react-router-dom";


import "./Home.css";

// Importar imágenes
import logo from "../assets/img/logo.png";
import quienesSomos from "../assets/img/quienesomos.jpg";
import educamos from "../assets/img/educamos.jpg";
import conectamos from "../assets/img/conectamos.jpg";
import comidafuturista from "../assets/img/comidafuturista.jpg";


export default function Home() {
  const { user } = useContext(AuthContext);



  const [datos, setDatos] = useState({ nombre: "", tipo: "" });
  const navigate = useNavigate();

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


  const redirigirRegistro = () => navigate("/register");
  const redirigirLogin = () => navigate("/login");


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
            <a className="navbar-brand d-flex align-items-center" href="/home">

              <img src={logo} alt="Logo EcoFood" width="50" height="60" className="me-2" />

              <h1 className="mb-0 fs-4">EcoFood</h1>
            </a>
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
                {user && (
                  <>

                    <span className="user-greeting">
                      Hola, {datos.nombre}
                    </span>
                    <CerrarSesion className="btn cerrar-sesion-btn" />
                  </>
                )}
                {!user && (
                  <>
                    <button
                      className="btn btn-outline-success"
                      onClick={redirigirLogin}
                    >
                      Iniciar Sesión
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={redirigirRegistro}
                    >
                      Registrarse
                    </button>
                  </>
                )}

              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Navbar */}
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
                <a className="nav-link" href="#quienes-somos">
                  ¿Quiénes Somos?
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#que-hacemos">
                  ¿Qué Hacemos?
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#vision">
                  Visión
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#mision">
                  Misión
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/comments">
                  Comentarios
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/productos">
                  Productos
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contacto">
                  Contacto
                </a>
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

            EcoFood es una organización comprometida con la reducción del desperdicio alimentario mediante iniciativas
            educativas, tecnológicas y prácticas cotidianas. Somos un equipo diverso formado por expertos en medio
            ambiente, tecnología y desarrollo comunitario, unidos por un propósito común: generar conciencia, educar y
            activar soluciones para enfrentar este desafío global.
          </p>
          <img src={quienesSomos} alt="Imagen representativa" className="img-fluid rounded img-ajustada" />

        </section>

        <section id="que-hacemos" className="mb-5">
          <h2>¿Qué Hacemos?</h2>
          <div className="row g-3">
            <div className="col-md-4">

              <img src={educamos} className="img-fluid rounded img-quehacemos" alt="Educamos" />
              <h3 className="h5 mt-2">Educamos</h3>
              <p>
                Ofrecemos materiales educativos gratuitos y talleres comunitarios para fomentar prácticas sostenibles en el
                consumo de alimentos.
              </p>
            </div>
            <div className="col-md-4">
              <img src={conectamos} className="img-fluid rounded img-quehacemos" alt="Conectamos" />
              <h3 className="h5 mt-2">Conectamos</h3>
              <p>
                Promovemos alianzas entre productores, comerciantes, consumidores y comunidades para reducir excedentes y
                aprovechar al máximo los alimentos disponibles.
              </p>
            </div>
            <div className="col-md-4">
              <img src={comidafuturista} className="img-fluid rounded img-quehacemos" alt="Innovamos" />
              <h3 className="h5 mt-2">Innovamos</h3>
              <p>
                Utilizamos la tecnología para desarrollar soluciones prácticas, como aplicaciones móviles, plataformas web
                y redes comunitarias que faciliten la reducción del desperdicio alimentario.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contacto" className="pt-4 border-top">
        <div className="container">
          <h3>Contacto</h3>
          <p>Dirección: Calle Verde 123, Ciudad Sostenible</p>
          <p>Email: contacto@ecofood.org</p>
          <ul>
            <li>Facebook: @EcoFoodOfficial</li>
            <li>Instagram: @ecofood_oficial</li>
            <li>Twitter: @EcoFood_org</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
