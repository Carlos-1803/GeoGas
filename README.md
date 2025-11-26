
# GeoGas

## ⛽ GeoGas: Gestión y Precios de Gasolineras

GeoGas es una **API REST** desarrollada en **.NET 9** que tiene como objetivo principal la gestión de datos de gasolineras, precios de combustible y rutas. Su diseño permite a los usuarios acceder a información actualizada y autenticada para la administración de datos relacionados con el sector.



## 🛠️ Tecnologías y Prerrequisitos

Para ejecutar y contribuir a este proyecto, necesitarás:

  * **.NET SDK 9.0.0** o superior.
  * **MySQL Server** (Versión 8.0 o superior recomendada).
  * **Git** para clonar el repositorio.

### Dependencias Principales (NuGet)

| Paquete | Versión | Propósito |
| :--- | :--- | :--- |
| **Microsoft.EntityFrameworkCore** | v9.0.0 | Core del ORM para la interacción con la DB. |
| **Pomelo.EntityFrameworkCore.MySql** | v9.0.0 | Proveedor MySQL para EF Core. |
| **Microsoft.AspNetCore.Authentication.JwtBearer** | - | Implementación del manejo de tokens JWT para la autenticación. |
| **Microsoft.AspNetCore.Identity.Core** | - | Núcleo para la identificación y gestión de usuarios. |
| **Microsoft.EntityFrameworkCore.Design** | - | Herramientas de diseño para migraciones de EF Core. |
| **Microsoft.Extensions.Configuration.Json** | - | Para cargar configuraciones desde archivos JSON. |


## ⚙️ Instalación y Configuración

Sigue estos pasos para poner en marcha el proyecto:

### 1\. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/GeoGas.git
cd GeoGas
```

### 2\. Configuración de la Base de Datos

El proyecto se conecta a una base de datos MySQL llamada **GEOGAS1**.

1.  Asegúrate de tener un servidor MySQL en funcionamiento.
2.  Actualiza la cadena de conexión en el archivo de configuración (usualmente `appsettings.json`) con tus credenciales de MySQL.
3.  Aplica las migraciones de la base de datos:



```bash

dotnet ef database update
```

> **Nota:** Se utiliza `MyDbContextFactory.cs` para facilitar la creación de instancias del contexto de la DB para las herramientas de línea de comandos de EF Core.

### 3\. Ejecutar la Aplicación

```bash
dotnet run
# La API se iniciará y estará disponible en el puerto configurado (ej. https://localhost:7000)
```



## 🗺️ Estructura del Proyecto

Las carpetas principales y su función:

  * **`Models`**: Contiene las clases C\# que representan las tablas de la base de datos (Ej. `RUTAS`, `USER`, `Gasolineras`, `Precios`).
  * **`Data`**: Contiene el contexto de la base de datos (`MyDbContext`) y la lógica de configuración.
  * **`Controllers`**: Contiene los controladores API que manejan las solicitudes HTTP.

### Endpoints Principales

| Controlador | Funcionalidad Principal | Versión de Implementación |
| :--- | :--- | :--- |
| **`GasolinerasController`** | CRUD básico para la gestión de gasolineras. | v1.0.0 |
| **`UsersController`** | Creación de nuevos usuarios y generación de tokens de autenticación JWT. | v1.1.0 |



## 🔑 Autenticación (JWT Bearer)

El controlador de usuarios (v1.1.0) implementa un sistema de autenticación basado en **JSON Web Tokens (JWT)**.

  * Al crear un usuario, se genera un token.
  * Para probar los endpoints protegidos, se debe incluir este token en el encabezado `Authorization` de la solicitud (formato `Bearer [token]`).

 **Advertencia:** Actualmente, la **validación** del token está deshabilitada temporalmente para facilitar el testeo de los endpoints (comentando `// [Authorize]` en los controladores).



## 📜 Historial de Versiones

| Versión | Resumen de Cambios |
|**v2.4.0**|Se creó el `RutaController` y se añadieron los DTOs de Ruta`RutaDTS` para manejar mejor los datos que recibe y envía la API, aplicar validaciones básicas y mantener separado el modelo interno de lo que se expone al cliente |
|**v2.3.0**|Se creo la carpeta FROND-END para trabajar en las vistas|
| **v2.1.0**| Se crearon los controladores para el resgistro y logeo de los usuarios (`AuthController`), Tambien se implementaron 2 nuevos servicios (`ImServicioJWT` y `JwtServices`) para que funcione el logeo y el registro de usuarios.|
| **v2.0.0** | Versión 2.0.0 ( Presio_GasController,CocheController ) Se crearon los controles para manejar los precios de las gasolinas y también el control para los coches. Además, se agregó la tabla necesaria para que todo funcione correctamente en el Controlador de coches.  |
| **v1.1.2** | Actualización de la documentación (`README.md`). |
| **v1.1.1** | Corrección de errores mínimos y eliminación de archivos de proyecto redundantes (`GeoGasNuevo.*`). |
| **v1.1.0** |  Creación del **`UsersController`** (Autenticación JWT, creación de usuarios). Inclusión de **`Microsoft.AspNetCore.Identity.Core`** y **`Microsoft.AspNetCore.Authentication.JwtBearer`**. |
| **v1.0.1** |  Actualización de la documentación (`README.md`). |
| **v1.0.0** | Inicio de la creación de controladores. Implementación del **`GasolinerasController`**. |
| **v0.2.1** |  Creación de las tablas **`Gasolineras`** y **`Precios`**. |
| **v0.2** |  Creación de la **migración `Version 0.2` de la DB**. Actualización a **.NET 9.0.0**. Implementación de `MyDbContextFactory.cs`. |
| **v0.1** | Inicio del proyecto. Conexión a DB `GEOGAS1`. Creación de carpetas (`Models`, `DATA`, `Controllers`) y tablas iniciales (`RUTAS`, `USER`). |

