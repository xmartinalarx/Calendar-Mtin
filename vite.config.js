import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/* En desarrollo, el frontend corre en Vite (5173) y el backend en Node (3001).
   Vite hace proxy de todo /api al servidor Node, así que desde el navegador
   las rutas son las mismas que en producción (/api/eventos, /api/interpretar).
   Ambos procesos se arrancan juntos con `npm run dev`. */
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // accesible desde el móvil en la misma red (http://<tu-ip>:5173)
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
