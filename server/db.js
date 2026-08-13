/* ─────────────────────────── base de datos (MySQL) ───────────────────────────
   MySQL de Hostinger: persiste entre despliegues y no tiene módulos nativos que
   compilar. Las credenciales llegan por variables de entorno (nunca en el repo).
   La tabla se crea sola al primer uso (CREATE TABLE IF NOT EXISTS), así no hace
   falta importar SQL a mano.

   Guardamos cada evento con la misma forma que usa el frontend. Los arrays
   (hechos, excepciones) se serializan como JSON en columnas de texto.          */

import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  charset: "utf8mb4",
  dateStrings: true, // devuelve DATE como "YYYY-MM-DD", no como objeto Date
  waitForConnections: true,
  connectionLimit: 5,
});

let tablaLista = null;
function asegurarTabla() {
  if (!tablaLista) {
    tablaLista = pool.query(`
      CREATE TABLE IF NOT EXISTS eventos (
        id           VARCHAR(16)  NOT NULL PRIMARY KEY,
        titulo       VARCHAR(255) NOT NULL,
        fecha        DATE         NOT NULL,
        hora         VARCHAR(5)   NULL,
        duracion     INT          NULL,
        repetir      VARCHAR(10)  NULL,
        nota         TEXT         NULL,
        hechos       TEXT         NULL,
        excepciones  TEXT         NULL,
        crudo        TEXT         NULL,
        actualizado  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_fecha (fecha)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }
  return tablaLista;
}

const uid = () => Math.random().toString(36).slice(2, 10);

/** Devuelve todos los eventos con la forma que espera el frontend. */
export async function listar() {
  await asegurarTabla();
  const [rows] = await pool.query("SELECT * FROM eventos ORDER BY fecha, hora");
  return rows.map((r) => ({
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
export async function reemplazarTodo(eventos) {
  await asegurarTabla();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM eventos");
    const sql = `
      INSERT INTO eventos (id, titulo, fecha, hora, duracion, repetir, nota, hechos, excepciones, crudo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    let n = 0;
    for (const e of eventos) {
      if (!e || !/^\d{4}-\d{2}-\d{2}$/.test(e.fecha || "")) continue;
      await conn.query(sql, [
        String(e.id || "").slice(0, 16) || uid(),
        String(e.titulo || "Recordatorio").slice(0, 255),
        e.fecha,
        e.hora || null,
        Number.isFinite(e.duracion) ? e.duracion : null,
        e.repetir === "dia" || e.repetir === "semana" ? e.repetir : null,
        e.nota || "",
        JSON.stringify(Array.isArray(e.hechos) ? e.hechos : []),
        JSON.stringify(Array.isArray(e.excepciones) ? e.excepciones : []),
        e.crudo || "",
      ]);
      n++;
    }
    await conn.commit();
    return n;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
