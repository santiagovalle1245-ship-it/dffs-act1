# Ufotable Web Simulation

Este proyecto es una simulación full-stack de la página web del estudio de animación Ufotable. Su propósito principal es demostrar la creación de interfaces web y la integración fluida con un servidor backend, diseñado como pieza de portafolio.

## Tecnologías Utilizadas

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
* **Backend:** Node.js, Express.
* **Recursos Visuales:** Galería de imágenes integradas, incluyendo referencias a Demon Slayer y Fate/stay night: Unlimited Blade Works.

## Características Principales

* **Arquitectura Unificada:** El servidor Node.js/Express actúa como una API REST y, simultáneamente, sirve los archivos estáticos (HTML, CSS, JS) del frontend al cliente[cite: 1].
* **Estructura de Directorios:** Separación lógica entre la lógica del servidor (carpeta `api-tareas`) y los archivos de la interfaz gráfica[cite: 1].
* **Consumo Dinámico:** El cliente web realiza peticiones locales para consumir datos en formato JSON de manera dinámica[cite: 1].

## Cómo ejecutar el proyecto localmente

Sigue estos pasos para levantar el entorno de desarrollo en tu computadora:

1. Abre tu terminal y clona este repositorio.
2. Navega hacia la carpeta raíz del proyecto llamada `dffs-act1`.
3. Entra al directorio del servidor ejecutando el comando: `cd api-tareas`.
4. Instala las dependencias necesarias de Node ejecutando: `npm install`.
5. Inicia el servidor con el comando: `node server.js`.
6. Abre tu navegador web y visita: `http://localhost:3000`

---
*Desarrollado por Santiago Valle.*
