import React, { useState } from "react";
import Header from "../pagina/header";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { useNavigate } from "react-router-dom";

const AgregarUsuario = () => {
  const navegador = useNavigate();
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [cedula, setCedula] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [status_id, setStatusId] = useState(null);
  const [rol_id, setRolId] = useState(null);

  const agregarUsuario = async () => {
    const nuevoUsuario = {
      nombres,
      apellidos,
      cedula,
      correo,
      telefono,
      status_id,
      rol_id,
    };

    try {
      const response = await fetch("http://localhost:5000/crear-usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoUsuario),
      });

      if (response.ok) {
        alert("Se ha agregado el Usuario Correctamente");
        navegador("/usuarios");
      } else {
        console.error("Error al agregar el usuario");
      }
    } catch (error) {
      console.error("Error de red al agregar el usuario", error);
    }
  };

  return (
    <>
      <Header />
      <Panel header="Agregar Nuevo Usuario" style={{ padding: "0 2%" }}>
        <main
          style={{ display: "flex", flexDirection: "column", padding: "10px" }}
        >
          <label htmlFor="nombres">Nombres</label>
          <InputText
            id="nombres"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
          />

          <label htmlFor="apellidos">Apellidos</label>
          <InputText
            id="apellidos"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
          />

          <label htmlFor="cedula">Cedula</label>
          <InputText
            id="cedula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
          />

          <label htmlFor="correo">Correo</label>
          <InputText
            type="email"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />

          <label htmlFor="telefono">Telefono</label>
          <InputText
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
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

          <label htmlFor="rol">Rol</label>
          <Dropdown
            id="rol"
            value={rol_id}
            onChange={(e) => setRolId(e.value)}
            options={[
              { label: "Administrador", value: 1 },
              { label: "Usuario", value: 2 },
            ]}
            placeholder="Selecciona una Opcion"
            className="seleccionador"
          />

          <Button label="Agregar Nuevo Usuario" onClick={agregarUsuario} />
        </main>
      </Panel>
    </>
  );
};

export default AgregarUsuario;
