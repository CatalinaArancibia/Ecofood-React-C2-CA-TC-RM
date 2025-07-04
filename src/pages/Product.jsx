import React from "react";
import "./Product.css";
import { useNavigate } from "react-router-dom";

import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Product = () => {
  const navigate = useNavigate();

  return (
    <>
      <section id="product-card">
        <div className="contenedor-principal">
          <div
            className="header-productos"
            style={{ position: "relative", marginBottom: "18px" }}
          >
            <button
              type="button"
              className="btn-volver"
              onClick={() => navigate("/home")}
              style={{
                left: 0,
                top: 0,
              }}
            >
              Volver
            </button>
            <h2 className="titl" style={{ margin: 0, textAlign: "center" }}>
              Productos Disponibles
            </h2>
          </div>
          <div className="tarjetas" id="contenedorProductos">
            <div className="tarjeta">
              <div className="contenido">
                <h3 className="nombre">Mani Picante</h3>
                <p className="precio">$1090</p>
                <p className="descripcion">Mani de los chinos</p>
                <button className="btn-Product">Detalles</button>
              </div>
            </div>
            <div className="tarjeta">
              <div className="contenido">
                <h3 className="nombre">Tajin Salsero</h3>
                <p className="precio">$1000</p>
                <p className="descripcion">Tajin de los Mexicanos</p>
                <button className="btn-Product">Detalles</button>
              </div>
            </div>
            <div className="tarjeta">
              <div className="contenido">
                <h3 className="nombre">Doritos</h3>
                <p className="precio">$1030</p>
                <p className="descripcion">3 Doritos despues</p>
                <button className="btn-Product">Detalles</button>
              </div>
            </div>
            {/* Puedes mapear aquí tus productos */}
          </div>
        </div>
      </section>

      <section id="comentarios">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "18px",
          }}
        >
          <h2 className="title" style={{ margin: 0 }}>Comentarios</h2>
        </div>
        <div className="comments-list">
          <div className="comment-card">
            <div className="comment-author">Meowl</div>
            <div className="comment-text">
              Los productos llegaron en buen estado y el empaque es ecológico.
            </div>
          </div>
          <div className="comment-card">
            <div className="comment-author">John Pork</div>
            <div className="comment-text">
              Excelente calidad, se nota el compromiso con la sostenibilidad.
            </div>
          </div>
          <div className="comment-card">
            <div className="comment-author">Mohamed Amurali</div>
            <div className="comment-text">
              Muy buena iniciativa, ojalá más empresas se sumen a esto.
            </div>
          </div>
        </div>
      </section>

      <div className="centro">
        <a href="/comments" className="btn-Product">
          Deja tu comentario
        </a>
      </div>
    </>
  );
};

export default Product;
