/* ─────────────────────────── base de datos (SQLite) ───────────────────────────
   SQLite es perfecto para una app personal: un solo archivo, sin servidor de
   base de datos aparte, transaccional y muy rápido. El archivo vive en
   DB_FILE (por defecto data/agenda.db) y persiste en el disco del VPS.

   Guardamos cada evento con la misma forma que usa el frontend. Los arrays
   (hechos, excepciones) se serializan como JSON en columnas de texto.        */

import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const FILE = process.env.DB_FILE || "data/agenda.db";
mkdirSync(dirname(FILE), { recursive: true });

const db = new Database(FILE);
db.pragma("journal_mode = WAL"); // mejor concurrencia lectura/escritura

db.exec(`
  CREATE TABLE IF NOT EXISTS eventos (
    id           TEXT PRIMARY KEY,
    titulo       TEXT NOT NULL,
    fecha        TEXT NOT NULL,
    hora         TEXT,
    duracion     INTEGER,
    repetir      TEXT,
    nota         TEXT,
    hechos       TEXT,
    excepciones  TEXT,
    crudo        TEXT,
    actualizado  TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos (fecha);
`);

const stmtListar = db.prepare("SELECT * FROM eventos ORDER BY fecha, hora");
const stmtBorrarTodo = db.prepare("DELETE FROM eventos");
const stmtInsertar = db.prepare(`
  INSERT INTO eventos (id, titulo, fecha, hora, duracion, repetir, nota, hechos, excepciones, crudo)
  VALUES (@id, @titulo, @fecha, @hora, @duracion, @repetir, @nota, @hechos, @excepciones, @crudo)
`);

const uid = () => Math.random().toString(36).slice(2, 10);

/** Devuelve todos los eventos con la forma que espera el frontend. */
export function listar() {
  return stmtListar.all().map((r) => ({
    id: r.id,
    titulo: r.titulo,
    fecha: r.fecha,
    hora: r.hora ?? null,
    duracion: r.duracion ?? null,
    repetir: r.repetir ?? null,
    nota: r.nota ?? "",
    hechos: JSON.parse(r.hechos || "[]"),
    excepciones: JSON.parse(r.excepciones || "[]"),
    crudo: r.crudo ?? "",
  }));
}

/* Reemplaza toda la tabla por la lista recibida, en una sola transacción.
   El frontend siempre guarda la agenda completa, así que este modelo es simple
   y consistente. Los eventos con fecha inválida se ignoran por seguridad. */
export const reemplazarTodo = db.transaction((eventos) => {
  stmtBorrarTodo.run();
  let n = 0;
  for (const e of eventos) {
    if (!e || !/^\d{4}-\d{2}-\d{2}$/.test(e.fecha || "")) continue;
    stmtInsertar.run({
      id: String(e.id || "").slice(0, 16) || uid(),
      titulo: String(e.titulo || "Recordatorio").slice(0, 255),
      fecha: e.fecha,
      hora: e.hora || null,
      duracion: Number.isFinite(e.duracion) ? e.duracion : null,
      repetir: e.repetir === "dia" || e.repetir === "semana" ? e.repetir : null,
      nota: e.nota || "",
      hechos: JSON.stringify(Array.isArray(e.hechos) ? e.hechos : []),
      excepciones: JSON.stringify(Array.isArray(e.excepciones) ? e.excepciones : []),
      crudo: e.crudo || "",
    });
    n++;
  }
  return n;
});
