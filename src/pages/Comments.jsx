import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home-comments.css';



const Comments = () => {
  const [comentarios, setComentarios] = useState([
    { nombre: 'Meowl', texto: 'Los productos llegaron en buen estado y el empaque es ecológico.' },
    { nombre: 'John Pork', texto: 'Excelente calidad, se nota el compromiso con la sostenibilidad.' },
    { nombre: 'Mohamed Amurali', texto: 'Muy buena iniciativa, ojalá más empresas se sumen a esto.' }
  ]);

  const [nombre, setNombre] = useState('');
  const [comentario, setComentario] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nombre.trim() && comentario.trim()) {
      setComentarios([...comentarios, { nombre, texto: comentario }]);
      setNombre('');
      setComentario('');
    }
  };

  return (
    <main className="comments-container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          justifyContent: "center",
          
        }}
      >
        <button
          type="button"
          className="btn-volver"
          onClick={() => navigate('/home')}
        >
          Volver
        </button>
        <h2 className="titl" style={{ margin: 0 }}>Comentarios</h2>
      </div>

      <form className="comments-form" onSubmit={handleSubmit}>
        <input
          type="text"
          id="nombre"
          name="nombre"
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <textarea
          id="comentario"
          name="comment"
          placeholder="Escribe tu comentario . . ."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        ></textarea>
        <button type="submit">Enviar comentario</button>
      </form>

      <section className="comments-list">
        {comentarios.map((c, index) => (
          <div className="comentario" key={index}>
            <h3>{c.nombre}</h3>
            <p>{c.texto}</p>
          </div>
        ))}
      </section>
    </main>
  );
};

export default Comments;


