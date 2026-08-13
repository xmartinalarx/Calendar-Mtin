/* ─────────────── interpretación con Claude (lado servidor) ───────────────
   Recibe el texto libre y la hora de referencia, llama a la API de Anthropic
   con la key en variable de entorno, y devuelve el evento como objeto JS.

   La key vive SOLO aquí (proceso de servidor), nunca llega al navegador.
   Este módulo no depende de Vite: se puede reutilizar tal cual en una función
   serverless (Vercel/Netlify) para producción. Ver vite.config.js.        */

const DIAS_L = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES_L = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const MODELO = process.env.MODELO || "claude-haiku-4-5-20251001";

/**
 * @param {string} texto  Mensaje libre del usuario.
 * @param {string} [ahoraISO]  Hora de referencia en ISO (la del navegador).
 * @returns {Promise<{titulo:string,fecha:string,hora:string|null,duracion:number|null,repetir:("dia"|"semana"|null),nota:string}>}
 */
export async function interpretar(texto, ahoraISO) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    const e = new Error("Falta ANTHROPIC_API_KEY en el entorno");
    e.code = "SIN_KEY";
    throw e;
  }
  if (!texto || !texto.trim()) {
    const e = new Error("Texto vacío");
    e.code = "BAD_INPUT";
    throw e;
  }

  const ahora = ahoraISO ? new Date(ahoraISO) : new Date();
  const ctx = `${DIAS_L[ahora.getDay()]} ${ahora.getDate()} de ${MESES_L[ahora.getMonth()]} de ${ahora.getFullYear()}, ${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;

  const prompt = `Eres un intérprete de agenda en español. Hoy es ${ctx} (fecha ISO ${ymd(ahora)}).
Convierte el mensaje del usuario en un evento.
Responde SOLO con JSON válido, sin markdown, sin explicaciones, con esta forma exacta:
{"titulo":"texto corto","fecha":"YYYY-MM-DD","hora":"HH:MM" o null,"duracion":minutos o null,"repetir":"dia" o "semana" o null,"nota":"" }

Reglas:
- "titulo": limpio y breve, sin la parte de fecha/hora. Empieza en mayúscula.
- Si no se menciona hora, "hora" es null.
- Si dice una hora sin am/pm y es entre 1 y 7, asume tarde (13:00-19:00).
- Si la fecha no se menciona, usa hoy; si la hora ya pasó hoy, usa mañana.
- "repetir" solo si dice algo como "todos los días", "cada lunes", "todas las semanas".
- Detalles extra (lugar, persona, contexto) van en "nota".

Mensaje: """${texto}"""`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!r.ok) {
    const detalle = await r.text().catch(() => "");
    throw new Error(`API Anthropic ${r.status}: ${detalle.slice(0, 300)}`);
  }

  const data = await r.json();
  const txt = (data.content || []).map((i) => (i.type === "text" ? i.text : "")).join("").trim();
  const limpio = txt.replace(/```json|```/g, "").trim();
  const obj = JSON.parse(limpio.slice(limpio.indexOf("{"), limpio.lastIndexOf("}") + 1));

  if (!obj.titulo || !/^\d{4}-\d{2}-\d{2}$/.test(obj.fecha || "")) {
    throw new Error("Formato inesperado del modelo");
  }
  if (obj.hora && !/^\d{2}:\d{2}$/.test(obj.hora)) obj.hora = null;
  return {
    titulo: obj.titulo,
    fecha: obj.fecha,
    hora: obj.hora || null,
    duracion: obj.duracion || null,
    repetir: obj.repetir || null,
    nota: obj.nota || "",
  };
}
