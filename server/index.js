/* ─────────────────────────────── servidor ───────────────────────────────
   Backend Node/Express para el VPS. Hace tres cosas:
     GET  /api/eventos      → lista de eventos (desde SQLite)
     POST /api/eventos      → guarda la lista completa
     POST /api/interpretar  → interpreta el mensaje con IA (key en el servidor)
   Y en producción sirve el frontend compilado de dist/.

   En desarrollo, Vite (puerto 5173) hace proxy de /api aquí (puerto 3001),
   así que corres ambos con `npm run dev`.                                    */

import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

import { listar, reemplazarTodo } from "./db.js";
import { interpretar } from "./interpretar.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "2mb" }));

/* Token opcional: si defines AGENDA_TOKEN, la API exige la cabecera
   X-Agenda-Token. El frontend la manda si compilas con VITE_AGENDA_TOKEN.
   Es protección ligera (el token viaja en el navegador); para seguridad real
   haría falta login. Déjalo vacío para desactivar. */
const TOKEN = process.env.AGENDA_TOKEN || "";
app.use("/api", (req, res, next) => {
  if (!TOKEN) return next();
  if (req.get("X-Agenda-Token") === TOKEN) return next();
  return res.status(401).json({ error: "no autorizado" });
});

app.get("/api/eventos", async (req, res) => {
  try {
    res.json(await listar());
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post("/api/eventos", async (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ error: "se esperaba un array de eventos" });
  }
  try {
    const n = await reemplazarTodo(req.body);
    res.json({ ok: true, n });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.post("/api/interpretar", async (req, res) => {
  try {
    const { texto, ahora } = req.body || {};
    const obj = await interpretar(texto, ahora);
    res.json(obj);
  } catch (e) {
    // 501 si falta la key: el cliente lo trata como "sin IA" y usa parsearLocal.
    res.status(e.code === "SIN_KEY" ? 501 : 500).json({ error: String(e.message || e) });
  }
});

/* Servir el frontend compilado (solo en producción, cuando existe dist/). */
const dist = join(__dirname, "..", "dist");
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.use((req, res) => res.sendFile(join(dist, "index.html")));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Agenda escuchando en http://localhost:${PORT}`);
});
