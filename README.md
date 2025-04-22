# Biblioteca Frontend

Este proyecto fue creado con [Create React App](https://github.com/facebook/create-react-app).

## Configuración SSL para Desarrollo Local

Este proyecto requiere HTTPS para el desarrollo local. Sigue estos pasos para configurar los certificados SSL:


### Instalación de mkcert

```bash
# Windows (con Chocolatey)
choco install mkcert

# macOS (con Homebrew)
brew install mkcert

# Linux
sudo apt install libnss3-tools
sudo apt install mkcert
```

### Generación de Certificados

1. Configura mkcert y genera los certificados:
```bash
mkcert -install
mkdir ssl
cd ssl
mkcert localhost
```

2. Esto generará dos archivos en la carpeta `ssl`:
   - `localhost.pem` (certificado)
   - `localhost-key.pem` (llave privada)

### Estructura de Archivos SSL

Asegúrate de que los archivos SSL estén en la siguiente ubicación:
```
front-biblioteca/
  ├── ssl/
  │   ├── localhost.pem
  │   └── localhost-key.pem
  └── ...
```

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
```env
HTTPS=true
SSL_CRT_FILE=./ssl/localhost.pem
SSL_KEY_FILE=./ssl/localhost-key.pem
```

### Consideraciones de Seguridad

- Los certificados generados son solo para desarrollo local
- No compartas los archivos de certificados en el control de versiones
- Agrega la carpeta `ssl/` a tu `.gitignore`

## Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

### `npm start`

Ejecuta la aplicación en modo desarrollo.
Abre [https://localhost:3000](https://localhost:3000) para verla en tu navegador.

La página se recargará cuando hagas cambios.
También podrás ver errores de lint en la consola.

### `npm test`

Inicia el ejecutor de pruebas en modo interactivo.
Consulta la sección sobre [ejecutar pruebas](https://facebook.github.io/create-react-app/docs/running-tests) para más información.

### `npm run build`

Compila la aplicación para producción en la carpeta `build`.
Empaqueta React en modo producción y optimiza la compilación para obtener el mejor rendimiento.

La compilación está minificada y los nombres de archivo incluyen los hashes.
¡Tu aplicación está lista para ser desplegada!

Consulta la sección sobre [despliegue](https://facebook.github.io/create-react-app/docs/deployment) para más información.

### `npm run eject`

**Nota: esta es una operación de un solo sentido. Una vez que hagas `eject`, ¡no podrás volver atrás!**

Si no estás satisfecho con la herramienta de compilación y las opciones de configuración, puedes hacer `eject` en cualquier momento. Este comando removerá la única dependencia de compilación de tu proyecto.

En su lugar, copiará todos los archivos de configuración y las dependencias transitivas (webpack, Babel, ESLint, etc) directamente en tu proyecto para que tengas control total sobre ellos. Todos los comandos excepto `eject` seguirán funcionando, pero apuntarán a los scripts copiados para que puedas ajustarlos. En este punto estás por tu cuenta.

No tienes que usar `eject`. El conjunto de funciones seleccionadas es adecuado para despliegues pequeños y medianos, y no deberías sentirte obligado a usar esta función. Sin embargo, entendemos que esta herramienta no sería útil si no pudieras personalizarla cuando estés listo para ello.

## Más Información

Puedes aprender más en la [documentación de Create React App](https://facebook.github.io/create-react-app/docs/getting-started).

Para aprender React, consulta la [documentación de React](https://reactjs.org/).
