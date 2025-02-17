import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

const LibroCarta = ({ libro }) => {
  const navegar = useNavigate();
  
  const mostrarInformacion = () => {
    navegar(`/info-libro/${libro.id}`)
  };

  const header = (
    <img alt="Card" className="imagen-libro" src={libro.link_imagen} />
  );

  const footer = (
    <>
      <Button
        onClick={mostrarInformacion}
        label="Ver más"
        icon="pi pi-list"
        size="small"
      />
      <Button
        onClick={() => window.open(`${libro.link_descarga}`, "_blank")}
        label="Leer Libro"
        icon="pi pi-file-pdf"
        severity="help"
        size="small"
        style={{ marginLeft: "8px" }}
      />
    </>
  );

  return (
    <div className="card flex justify-content-center">
      <Card
        title={libro.titulo}
        subTitle={libro.autor}
        header={header}
        footer={footer}
        className="md:w-25rem"
      >
      </Card>
    </div>
  );
};

export default LibroCarta;
