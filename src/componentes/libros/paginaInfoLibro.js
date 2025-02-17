import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../pagina/header";

import { Panel } from "primereact/panel";
import { Button } from "primereact/button";
import { Image } from "primereact/image";

const InfoLibro = () => {
  const navegador = useNavigate();
  const { id } = useParams();
  const [libro, setLibro] = useState();

  useEffect(() => {
    fetch(`http://localhost:5000/libros/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setLibro(data[0]);
      });
  }, [id]);

  const eliminarLibro = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/eliminar-libro/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert("Se ha Eliminado el libro")
      navegador("/")

      if (!response.ok) {
        throw new Error("Error en la solicitud");
      }
    } catch (error) {
      console.error("Error al eliminar la pelicula:", error);
    }
  };

  if (!libro) {
    return <p>No se encontro el libro</p>;
  }

  return (
    <>
      <Header />
      <Panel
        header={`${libro.titulo} | ${libro.autor}`}
        style={{ padding: "0 2%" }}
      >
        <main style={{ display: "flex", padding: "10px" }}>
          <Image
            src={libro.link_imagen}
            alt="Image"
            width="300"
            height="350"
            style={{ marginRight: "40px" }}
            preview
          />

          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <h2>Descripcion del Libro</h2>
            <p>{libro.descripcion}</p>

            <div
              style={{ display: "flex", gap: "8px", justifyContent: "center" }}
            >
              <Button
                onClick={() =>{
                    navegador(`/actualizar-libro/${id}`)
                }}
                icon="pi pi-refresh"
                label="Actualizar Datos del Libro"
                severity="secondary"
              />
              <Button
              onClick={() =>{
                eliminarLibro(id)
              }}
                icon="pi pi-trash"
                label="Eliminar Libro"
                severity="danger"
              />
            </div>
          </aside>
        </main>
      </Panel>
    </>
  );
};

export default InfoLibro;
