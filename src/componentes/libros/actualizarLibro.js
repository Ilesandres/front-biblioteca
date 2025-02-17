import React, { useState, useEffect } from "react";
import Header from "../pagina/header";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { useNavigate, useParams } from "react-router-dom";

const ActualizarLibro = () => {
  const { id } = useParams();
  const [libro, setLibro] = useState();
  const navegador = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [link_imagen, setLinkImagen] = useState("");
  const [link_descarga, setLinkDescarga] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [status_id, setStatusId] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/libros/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setLibro(data[0]);
      });
  }, [id]);

  useEffect(() => {
    if (libro) {
      setTitulo(libro.titulo);
      setAutor(libro.autor);
      setLinkImagen(libro.link_imagen);
      setLinkDescarga(libro.link_descarga);
      setDescripcion(libro.descripcion);
      setStatusId(libro.status_id);
    }
  }, [libro]);

  const ActualizarDatosLibro = async () => {
    const datosActualizados = {
      titulo,
      autor,
      link_imagen,
      link_descarga,
      descripcion,
      status_id,
    };

    try {
      const response = await fetch(
        `http://localhost:5000/actualizar-libro/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosActualizados),
        }
      );

      if (response.ok) {
        alert("Se han actualizado los datos de el Libro Correctamente");
        navegador("/");
      } else {
        alert("Error al actualizar el libro");
      }
    } catch (error) {
      alert("Error de red al actualizar el libro", error);
    }
  };

  if (!libro) {
    return <p>No se encontro el libro</p>;
  }

  return (
    <>
      <Header />
      <Panel
        header={`Actualizar Datos de: ${libro.titulo}`}
        style={{ padding: "0 2%" }}
      >
        <main
          style={{ display: "flex", flexDirection: "column", padding: "10px" }}
        >
          <label htmlFor="titulo">Titulo del Libro</label>
          <InputText
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <label htmlFor="autor">Autor del Libro</label>
          <InputText
            id="autor"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
          />

          <label htmlFor="link_imagen">Link Imagen del Libro</label>
          <InputText
            id="link_imagen"
            value={link_imagen}
            onChange={(e) => setLinkImagen(e.target.value)}
          />

          <label htmlFor="link_descarga">Link de Lectura o Descarga</label>
          <InputText
            id="link_descarga"
            value={link_descarga}
            onChange={(e) => setLinkDescarga(e.target.value)}
          />

          <label htmlFor="descripcion">Descripcion o Sipnosis del Libro</label>
          <InputTextarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <Dropdown
            value={status_id}
            onChange={(e) => setStatusId(e.value)}
            options={[
              { label: "Activo", value: 1 },
              { label: "Inactivo", value: 2 },
            ]}
            placeholder="Selecciona una Opcion"
            className="seleccionador"
          />

          <Button onClick={ActualizarDatosLibro} label="Actualizar Datos del Libro" />
        </main>
      </Panel>
    </>
  );
};

export default ActualizarLibro;
