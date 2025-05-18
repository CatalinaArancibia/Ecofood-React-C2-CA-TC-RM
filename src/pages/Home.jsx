import React from "react";
import CardProducto from "../components/CardProducto";

function Home() {
  return (
    <>
      <header className="p-0 m-0 border-0">
        <nav
          className="navbar navbar-expand-lg"
          style={{ backgroundColor: "transparent", boxShadow: "none", border: "none" }}
        >
          <div className="container-fluid">
            {/* Logo e identidad */}
            <a className="navbar-brand d-flex align-items-center" href="index.html">
              <img src="./assets/img/logo.png" alt="Logo EcoFood" width="50" height="60" className="me-2" />
              <h1 className="mb-0 fs-4">EcoFood</h1>
            </a>

            {/* Botón de hamburguesa para móviles */}
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

            {/* Menú colapsable */}
            <div className="collapse navbar-collapse justify-content-end" id="navbarButtons">
              <div className="d-flex flex-lg-row flex-column align-items-lg-center align-items-end gap-2 mt-2 mt-lg-0">
                <a href="login.html" className="btn btn-outline-success">
                  Iniciar Sesión
                </a>
                <a href="registro.html" className="btn btn-success">
                  Registrarse
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* navbar */}
      <nav className="navbar navbar-expand-md border-top border-bottom">
        <div className="container-fluid">
          {/* Botón para colapsar el menú */}
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

          {/* Contenido colapsable */}
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
                <a className="nav-link" href="comments.html">
                  Comentarios
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="home.html">
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

      {/* contenido principal */}
      <main className="container my-4">
        {/* quiénes somos */}
        <section id="quienes-somos" className="mb-5">
          <h2>¿Quiénes Somos?</h2>
          <p>
            EcoFood es una organización comprometida con la reducción del desperdicio alimentario mediante iniciativas
            educativas, tecnológicas y prácticas cotidianas. Somos un equipo diverso formado por expertos en medio
            ambiente, tecnología y desarrollo comunitario, unidos por un propósito común: generar conciencia, educar y
            activar soluciones para enfrentar este desafío global.
          </p>
          <img src="./assets/img/quienesomos.jpg" alt="Imagen representativa" className="img-fluid rounded img-ajustada" />
        </section>

        {/* qué hacemos */}
        <section id="que-hacemos" className="mb-5">
          <h2>¿Qué Hacemos?</h2>
          <div className="row g-3">
            <div className="col-md-4">
              <img src="./assets/img/educamos.jpg" className="img-fluid rounded img-quehacemos" alt="Educamos" />
              <h3 className="h5 mt-2">Educamos</h3>
              <p>
                Ofrecemos materiales educativos gratuitos y talleres comunitarios para fomentar prácticas sostenibles en el
                consumo de alimentos.
              </p>
            </div>
            <div className="col-md-4">
              <img src="./assets/img/conectamos.jpg" className="img-fluid rounded img-quehacemos" alt="Conectamos" />
              <h3 className="h5 mt-2">Conectamos</h3>
              <p>
                Promovemos alianzas entre productores, comerciantes, consumidores y comunidades para reducir excedentes y
                aprovechar al máximo los alimentos disponibles.
              </p>
            </div>
            <div className="col-md-4">
              <img src="./assets/img/comidafuturista.jpg" className="img-fluid rounded img-quehacemos" alt="Innovamos" />
              <h3 className="h5 mt-2">Innovamos</h3>
              <p>
                Utilizamos la tecnología para desarrollar soluciones prácticas, como aplicaciones móviles, plataformas web
                y redes comunitarias que faciliten la reducción del desperdicio alimentario.
              </p>
            </div>
          </div>
        </section>

        <div>
          <img src="./assets/img/separador2.jpg" alt="Separador" className="separador-img" />
        </div>

        <section>
          <div id="vision">
            <div className="vision-text">
              <h2>Visión</h2>
              <p className="justificado">
                Nuestra visión es un mundo en el cual los alimentos se valoren y aprovechen responsablemente, en donde la
                seguridad alimentaria esté garantizada para todos y el desperdicio alimentario sea mínimo, generando un
                impacto positivo significativo en el medio ambiente, la economía y la sociedad.
              </p>
            </div>
            <div className="vision-image">
              <img src="./assets/img/vision.jpg" alt="Visión" />
            </div>
          </div>

          <div id="mision">
            <div className="mision-text">
              <h2>Misión</h2>
              <p className="justificado">
                Nuestra misión es sensibilizar y movilizar a las comunidades locales y globales sobre la importancia de
                reducir el desperdicio de alimentos, brindando herramientas prácticas, educativas y tecnológicas que
                permitan a las personas adoptar hábitos sostenibles y responsables para mejorar la seguridad alimentaria y
                proteger el medio ambiente.
              </p>
            </div>
            <div className="mision-image">
              <img src="./assets/img/mision.jpg" alt="Misión" />
            </div>
          </div>
        </section>
      </main>

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

      {/* Modal de bienvenida */}
      <div className="modal fade" id="bienvenidaModal" tabIndex="-1" aria-labelledby="bienvenidaModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center">
            <div className="modal-header">
              <h5 className="modal-title" id="bienvenidaModalLabel">
                ¡Bienvenido a EcoFood Community!
              </h5>
            </div>
            <div className="modal-body">
              <p>Únete a la reducción del desperdicio de alimentos.</p>

              {/* Frase dinámica */}
              <div id="fraseMotivadora" className="alert alert-success text-center mt-3 frase-transparente" role="alert">
                {/* Se cargará una frase aquí */}
              </div>

              {/* Botones */}
              <div className="d-grid gap-2 col-8 mx-auto mt-3">
                <button className="btn btn-success" onClick={() => redirigirRegistro()}>
                  Registrarse
                </button>
                <button className="btn btn-outline-success" onClick={() => redirigirLogin()}>
                  Iniciar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
