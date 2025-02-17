import React, { useState } from "react";
import Header from "../pagina/header";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { useNavigate } from "react-router-dom";

const AgregarLibro = () => {
  const navegador = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [link_imagen, setLinkImagen] = useState("");
  const [link_descarga, setLinkDescarga] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [status_id, setStatusId] = useState(null);

  const agregarLibro = async () => {
    const nuevoLibro = {
      titulo,
      autor,
      link_imagen,
      link_descarga,
      descripcion,
      status_id,
    };

    try {
      const response = await fetch("http://localhost:5000/crear-libro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoLibro),
      });

      if (response.ok) {
        alert("Se ha agregado el Libro Correctamente");
        navegador("/");
      } else {
        console.error("Error al agregar el libro");
      }
    } catch (error) {
      console.error("Error de red al agregar el libro", error);
    }
  };

  return (
    <>
      <Header />
      <Panel header="Agregar Nuevo Libro" style={{ padding: "0 2%" }}>
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

          <label htmlFor="estado">Estado</label>
          <Dropdown
          id="estado"
            value={status_id}
            onChange={(e) => setStatusId(e.value)}
            options={[
              { label: "Activo", value: 1 },
              { label: "Inactivo", value: 2 },
            ]}
            placeholder="Selecciona una Opcion"
            className="seleccionador"
          />

          <Button label="Agregar Nuevo Libro" onClick={agregarLibro} />
        </main>
      </Panel>
    </>
  );
};

export default AgregarLibro;
