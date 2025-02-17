import React, { useState, useEffect } from "react";
import LibroCarta from "./libroCarta.js";
import Header from "../pagina/header.js";

const PaginaPrincipal = () => {
  const [libros, setLibros] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/libros")
      .then((res) => res.json())
      .then((data) => {
        setLibros(data);
      });
  }, []);

  return (
    <div className="App">
      <Header />
      <section className="seccion-libros">
        {libros.map((libro) => (
          <LibroCarta key={libro.id} libro={libro} />
        ))}
      </section>
    </div>
  );
};

export default PaginaPrincipal;
