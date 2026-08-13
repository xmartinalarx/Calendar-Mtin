/* Punto de entrada para el despliegue.
   Algunos hosts (como Hostinger) esperan un `server.js` en la raíz del
   proyecto. Este archivo solo arranca el servidor real en server/index.js.
   Alternativa: configurar el "Entry File" del despliegue como server/index.js. */
import "./server/index.js";
