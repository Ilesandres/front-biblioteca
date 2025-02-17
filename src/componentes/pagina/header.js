import { TabMenu } from "primereact/tabmenu";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navegar = useNavigate();

  const paginaPrincipal = () => {
    navegar("/");
  };

  const agregarLibro = () => {
    navegar("/agregar-libro");
  };

  const verUsuarios = () => {
    navegar("/usuarios");
  };

  const agregarUsuario = () => {
    navegar("/agregar-usuario");
  };

  const items = [
    {
      label: "producto",
      icon: "pi pi-book",
      command: () => {
        paginaPrincipal();
      },
    },
    {
      label: "Agrega producto",
      icon: "pi pi-plus",
      command: () => {
        agregarLibro();
      },
    },
    {
      label: "Ver Usuarios",
      icon: "pi pi-users",
      command: () => {
        verUsuarios();
      },
    },
    {
      label: "Agregar Usuario",
      icon: "pi pi-user-plus",
      command: () => {
        agregarUsuario();
      },
    },
  ];

  return (
    <div className="card header-nav">
      <h1>INVENTARIO</h1>
      <TabMenu model={items} />
    </div>
  );
};

export default Header;
