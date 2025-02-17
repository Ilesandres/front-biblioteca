import Header from "../pagina/header";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

const PaginaUsuarios = () => {
  const navegador = useNavigate()
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/usuarios")
      .then((res) => res.json())
      .then((data) => {
        setUsuarios(data);
      });
  }, []);

  const nombreEstado = (rowData) => {
    return rowData.status_id === 1 ? "Activo" : "Inactivo";
  };

  const nombreRol = (rowData) => {
    return rowData.rol_id === 1 ? "Administrador" : "Usuario";
  };

  const acciones = (rowData) => {
    return (
      <div>
        <Button
          label="Editar"
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success"
          style={{ marginRight: ".5em" }}
          onClick={() => btnEditar(rowData)}
        />
        <Button
          label="Eliminar"
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger"
          onClick={() => btnEliminar(rowData)}
        />
      </div>
    );
  };

  const btnEditar = (usuario) => {
    navegador(`/actualizar-usuario/${usuario.id}`)
  };

  const btnEliminar = async (usuario) => {
    const id = usuario.id;
    try {
      const response = await fetch(
        `http://localhost:5000/eliminar-usuario/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert("Se ha Eliminado el usuario");
      window.location.reload()

      if (!response.ok) {
        throw new Error("Error en la solicitud");
      }
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="card">
        <DataTable value={usuarios} tableStyle={{ minWidth: "50rem" }}>
          <Column field="nombres" header="Nombres"></Column>
          <Column field="apellidos" header="Apellidos"></Column>
          <Column field="cedula" header="Cedula"></Column>
          <Column field="correo" header="Correo"></Column>
          <Column field="telefono" header="Telefono"></Column>
          <Column
            field="status_id"
            header="Estado"
            body={nombreEstado}
          ></Column>
          <Column field="rol_id" header="Rol" body={nombreRol}></Column>
          <Column header="Acciones" body={acciones}></Column>
        </DataTable>
      </div>
    </>
  );
};

export default PaginaUsuarios;
