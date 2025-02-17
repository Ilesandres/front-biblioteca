import React, { useState, useEffect } from "react";
import Header from "../pagina/header";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { useNavigate, useParams } from "react-router-dom";

const ActualizarUsuario = () => {
    const { id } = useParams();
  const navegador = useNavigate();
  const [usuario, setUsuario] = useState()
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [cedula, setCedula] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [status_id, setStatusId] = useState(null);
  const [rol_id, setRolId] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/usuarios/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setUsuario(data[0]);
      });
  }, [id]);

  useEffect(() => {
    if (usuario) {
      setNombres(usuario.nombres);
      setApellidos(usuario.apellidos);
      setCedula(usuario.cedula);
      setCorreo(usuario.correo);
      setTelefono(usuario.telefono);
      setStatusId(usuario.status_id);
      setRolId(usuario.rol_id);
    }
  }, [usuario]);

  const actualizarUsuario = async () => {
    const datosActualizados = {
      nombres,
      apellidos,
      cedula,
      correo,
      telefono,
      status_id,
      rol_id,
    };

    try {
      const response = await fetch(`http://localhost:5000/actualizar-usuario/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosActualizados),
      });

      if (response.ok) {
        alert("Se ha actualizado el Usuario Correctamente");
        navegador("/usuarios");
      } else {
        alert("Error al actualizar el usuario");
      }
    } catch (error) {
      alert("Error de red al actualizar el usuario", error);
    }
  };

  if (!usuario) {
    return <p>No se encontro el usuario</p>;
  }

  return (
    <>
      <Header />
      <Panel header="Actualizar Datos de Usuario" style={{ padding: "0 2%" }}>
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

          <Button label="Agregar Nuevo Usuario" onClick={actualizarUsuario} />
        </main>
      </Panel>
    </>
  );
};

export default ActualizarUsuario;
