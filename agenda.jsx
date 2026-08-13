import React, { useState, useEffect, useMemo, useRef } from "react";

/* ────────────────────────────── estilos ────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

.ag-root{
  --tinta:#16182C; --gris:#6B6F86; --niebla:#E9EBF2; --papel:#FFFFFF;
  --azulon:#3D3BE0; --durazno:#FF7A4D; --verde:#0E9F6E; --borde:#D6D9E6;
  position:absolute; inset:0; background:var(--niebla); color:var(--tinta);
  font-family:'Instrument Sans',system-ui,sans-serif; -webkit-font-smoothing:antialiased;
  display:flex; flex-direction:column; overflow:hidden;
}
.ag-root *{box-sizing:border-box;}
.ag-root button{font-family:inherit; cursor:pointer; border:none; background:none; color:inherit;}
.ag-root input,.ag-root select,.ag-root textarea{font-family:inherit; font-size:16px; color:inherit;}
.ag-root :focus-visible{outline:2px solid var(--azulon); outline-offset:2px; border-radius:6px;}

/* cabecera */
.ag-head{padding:18px 20px 10px; flex-shrink:0;}
.ag-eyebrow{font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.14em;
  text-transform:uppercase; color:var(--gris);}
.ag-title-row{display:flex; align-items:flex-end; justify-content:space-between; gap:12px; margin-top:2px;}
.ag-title{font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:34px;
  line-height:1; letter-spacing:-.03em; text-transform:lowercase;}
.ag-hoy{font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.1em; text-transform:uppercase;
  border:1px solid var(--borde); background:var(--papel); padding:7px 12px; border-radius:999px; color:var(--gris);}
.ag-hoy:active{transform:scale(.96);}
.ag-tabs{display:flex; gap:4px; margin-top:14px; background:#DFE2EC; padding:3px; border-radius:999px;}
.ag-tab{flex:1; padding:8px; border-radius:999px; font-size:13px; font-weight:600; color:var(--gris);}
.ag-tab[data-on="1"]{background:var(--papel); color:var(--tinta); box-shadow:0 1px 3px rgba(20,22,44,.12);}

/* tira de semana */
.ag-week{display:flex; gap:6px; padding:12px 20px 4px; flex-shrink:0;}
.ag-day{flex:1; padding:8px 0 9px; border-radius:14px; text-align:center; background:transparent; transition:background .15s;}
.ag-day .d{font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--gris);}
.ag-day .n{font-family:'Bricolage Grotesque',sans-serif; font-weight:700; font-size:17px; margin-top:3px;}
.ag-day .p{width:4px; height:4px; border-radius:50%; background:var(--azulon); margin:4px auto 0;}
.ag-day[data-sel="1"]{background:var(--tinta); color:var(--papel);}
.ag-day[data-sel="1"] .d{color:rgba(255,255,255,.65);}
.ag-day[data-sel="1"] .p{background:var(--papel);}
.ag-day[data-hoy="1"] .n{color:var(--durazno);}
.ag-day[data-sel="1"][data-hoy="1"] .n{color:var(--durazno);}
.ag-nav{display:flex; align-items:center; justify-content:space-between; padding:0 20px;}
.ag-nav button{font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--gris); padding:6px 10px;}

/* carril del día */
.ag-scroll{flex:1; overflow-y:auto; padding:6px 20px 190px;}
.ag-sec{font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em; text-transform:uppercase;
  color:var(--gris); margin:14px 0 8px;}
.ag-row{display:flex; gap:12px; align-items:stretch;}
.ag-time{width:52px; flex-shrink:0; padding-top:14px; text-align:right;
  font-family:'IBM Plex Mono',monospace; font-size:13px; font-weight:500; color:var(--gris);}
.ag-rail{width:11px; flex-shrink:0; position:relative;}
.ag-rail:before{content:''; position:absolute; left:5px; top:0; bottom:0; width:1px; background:var(--borde);}
.ag-rail i{position:absolute; left:1px; top:17px; width:9px; height:9px; border-radius:50%;
  background:var(--papel); border:2px solid var(--azulon);}
.ag-card{flex:1; background:var(--papel); border-radius:16px; padding:13px 14px; margin-bottom:8px;
  border:1px solid var(--borde); text-align:left; display:flex; gap:11px; align-items:flex-start;
  animation:ag-in .28s cubic-bezier(.2,.8,.3,1);}
@keyframes ag-in{from{opacity:0; transform:translateY(8px) scale(.98);} to{opacity:1; transform:none;}}
.ag-check{width:21px; height:21px; border-radius:7px; border:1.5px solid var(--borde); flex-shrink:0;
  margin-top:1px; display:grid; place-items:center; font-size:12px; color:var(--papel); background:var(--papel);}
.ag-check[data-on="1"]{background:var(--verde); border-color:var(--verde);}
.ag-card .t{font-size:15px; font-weight:600; line-height:1.3; word-break:break-word;}
.ag-card[data-done="1"] .t{color:var(--gris); text-decoration:line-through;}
.ag-card .m{font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--gris); margin-top:4px;}
.ag-now{display:flex; align-items:center; gap:8px; margin:4px 0 10px; padding-left:52px;}
.ag-now span{font-family:'IBM Plex Mono',monospace; font-size:10px; color:var(--durazno); letter-spacing:.1em;}
.ag-now div{flex:1; height:1.5px; background:var(--durazno); border-radius:2px;}

/* vacío */
.ag-empty{text-align:center; padding:44px 12px;}
.ag-empty h3{font-family:'Bricolage Grotesque',sans-serif; font-weight:700; font-size:20px; letter-spacing:-.02em;}
.ag-empty p{font-size:14px; color:var(--gris); margin-top:6px; line-height:1.5;}
.ag-chips{display:flex; flex-wrap:wrap; gap:7px; justify-content:center; margin-top:16px;}
.ag-chip{font-size:12.5px; background:var(--papel); border:1px solid var(--borde); padding:7px 11px; border-radius:999px; color:var(--gris);}

/* mes */
.ag-mes{padding:4px 16px 190px;}
.ag-grid{display:grid; grid-template-columns:repeat(7,1fr); gap:4px;}
.ag-gh{font-family:'IBM Plex Mono',monospace; font-size:10px; color:var(--gris); text-align:center; padding:6px 0;}
.ag-cell{aspect-ratio:1/1.05; border-radius:12px; background:var(--papel); border:1px solid var(--borde);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px;}
.ag-cell.off{background:transparent; border-color:transparent; color:#AFB4C6;}
.ag-cell .n{font-size:14px; font-weight:600;}
.ag-cell[data-hoy="1"]{border-color:var(--durazno);}
.ag-cell[data-sel="1"]{background:var(--tinta); color:var(--papel); border-color:var(--tinta);}
.ag-dots{display:flex; gap:2px; height:4px;}
.ag-dots i{width:4px; height:4px; border-radius:50%; background:var(--azulon);}
.ag-cell[data-sel="1"] .ag-dots i{background:var(--papel);}

/* barra de captura */
.ag-bar{position:absolute; left:0; right:0; bottom:0; padding:12px 16px calc(14px + env(safe-area-inset-bottom));
  background:linear-gradient(to top,var(--niebla) 62%,rgba(233,235,242,0));}
.ag-input{display:flex; align-items:flex-end; gap:8px; background:var(--papel); border:1px solid var(--borde);
  border-radius:20px; padding:7px 7px 7px 15px; box-shadow:0 8px 26px rgba(20,22,44,.13);}
.ag-input textarea{flex:1; border:none; outline:none; resize:none; background:none; max-height:96px;
  line-height:1.4; padding:9px 0; font-size:16px;}
.ag-input textarea::placeholder{color:#9AA0B5;}
.ag-send{width:38px; height:38px; border-radius:50%; background:var(--azulon); color:#fff; flex-shrink:0;
  display:grid; place-items:center; font-size:17px; transition:transform .15s,opacity .15s;}
.ag-send:disabled{opacity:.32;}
.ag-send:active:not(:disabled){transform:scale(.92);}
.ag-pending{font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--gris);
  padding:0 4px 8px; display:flex; align-items:center; gap:7px;}
.ag-dot{width:6px;height:6px;border-radius:50%;background:var(--azulon);animation:ag-pulse 1s infinite;}
@keyframes ag-pulse{0%,100%{opacity:.3;}50%{opacity:1;}}

/* aviso */
.ag-toast{position:absolute; left:16px; right:16px; bottom:96px; background:var(--tinta); color:var(--papel);
  border-radius:16px; padding:12px 14px; display:flex; align-items:center; gap:10px;
  box-shadow:0 10px 30px rgba(20,22,44,.3); animation:ag-in .25s ease;}
.ag-toast .x{flex:1; font-size:13.5px; line-height:1.35;}
.ag-toast b{font-family:'IBM Plex Mono',monospace; font-weight:500; color:#FFB59A;}
.ag-toast button{font-size:12.5px; font-weight:600; color:#FFB59A; padding:6px 2px; flex-shrink:0;}

/* hoja de edición */
.ag-veil{position:absolute; inset:0; background:rgba(20,22,44,.4); display:flex; align-items:flex-end; z-index:5;}
.ag-sheet{width:100%; background:var(--niebla); border-radius:22px 22px 0 0; padding:8px 18px calc(20px + env(safe-area-inset-bottom));
  max-height:92%; overflow-y:auto; animation:ag-up .26s cubic-bezier(.2,.8,.3,1);}
@keyframes ag-up{from{transform:translateY(100%);} to{transform:none;}}
.ag-grab{width:38px; height:4px; border-radius:2px; background:var(--borde); margin:6px auto 14px;}
.ag-lab{font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em; text-transform:uppercase;
  color:var(--gris); margin:14px 0 6px;}
.ag-field{width:100%; background:var(--papel); border:1px solid var(--borde); border-radius:13px;
  padding:12px 13px; outline:none;}
.ag-two{display:flex; gap:9px;}
.ag-two>*{flex:1; min-width:0;}
.ag-btns{display:flex; gap:9px; margin-top:22px;}
.ag-btn{flex:1; padding:14px; border-radius:14px; font-weight:600; font-size:15px;
  background:var(--tinta); color:var(--papel);}
.ag-btn.ghost{background:transparent; border:1px solid var(--borde); color:var(--gris); flex:0 0 auto; padding:14px 18px;}
.ag-btn.del{background:transparent; border:1px solid #F0C0B0; color:#C24A28;}
`;

/* ────────────────────────────── utilidades ────────────────────────────── */
const DIAS_L = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const DIAS_C = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES_L = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const deYmd = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const sumaDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const mismoDia = (a, b) => ymd(a) === ymd(b);
const norm = (s) => s.toLowerCase().replace(/[áà]/g, "a").replace(/[éè]/g, "e").replace(/[íì]/g, "i").replace(/[óò]/g, "o").replace(/[úùü]/g, "u");
const uid = () => Math.random().toString(36).slice(2, 10);

function etiquetaFecha(fecha, hoy) {
  const d = deYmd(fecha);
  const diff = Math.round((d - new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())) / 86400000);
  if (diff === 0) return "hoy";
  if (diff === 1) return "mañana";
  if (diff === -1) return "ayer";
  if (diff > 1 && diff < 7) return DIAS_L[d.getDay()];
  return `${DIAS_C[d.getDay()]} ${d.getDate()} ${MESES_L[d.getMonth()].slice(0, 3)}`;
}

/* ──────────────────── intérprete local (sin conexión) ──────────────────── */
const DIA_N = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 };
const MES_N = { enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5, julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11 };

function parsearLocal(texto, ahora) {
  const low = norm(texto);
  const mask = new Array(texto.length).fill(false);
  const tomar = (re) => {
    re.lastIndex = 0;
    const m = re.exec(low);
    if (!m) return null;
    for (let i = m.index; i < m.index + m[0].length; i++) mask[i] = true;
    return m;
  };

  let hora = null, fecha = null, duracion = null, repetir = null;

  // repetición
  const rep = tomar(/\b(todos los dias|todos los d|cada dia|diariamente|todas las semanas|cada semana|todos los (lunes|martes|miercoles|jueves|viernes|sabados?|domingos?))\b/);
  if (rep) repetir = /dia|diaria/.test(rep[0]) ? "dia" : "semana";

  // duración
  const dur = tomar(/\b(?:por|durante|dura)\s+(\d{1,3})\s*(minutos?|mins?|m|horas?|hrs?|h)\b/);
  if (dur) duracion = /^h/.test(dur[2]) ? Number(dur[1]) * 60 : Number(dur[1]);

  // hora relativa: "en 2 horas"
  const rel = tomar(/\ben\s+(\d{1,2})\s*(minutos?|mins?|horas?|hrs?|h)\b/);
  if (rel) {
    const base = new Date(ahora.getTime() + Number(rel[1]) * (/^h/.test(rel[2]) ? 3600000 : 60000));
    hora = `${String(base.getHours()).padStart(2, "0")}:${String(base.getMinutes()).padStart(2, "0")}`;
    fecha = ymd(base);
  }

  // hora explícita
  if (hora === null) {
    let h = null, min = 0;
    let m = tomar(/\b(?:a\s+las?\s+|las\s+)?(\d{1,2})[:.](\d{2})\s*(am|pm|hs|h)?/);
    if (m) { h = +m[1]; min = +m[2]; if (/pm/.test(m[3] || "") && h < 12) h += 12; if (/am/.test(m[3] || "") && h === 12) h = 0; }
    if (h === null) {
      m = tomar(/\b(?:a\s+las?\s+|las\s+)(\d{1,2})\s*(y media|y cuarto|en punto)?\s*(am|pm|de la mañana|de la manana|de la tarde|de la noche|hs|h)?/);
      if (m) {
        h = +m[1];
        if (/media/.test(m[2] || "")) min = 30;
        if (/cuarto/.test(m[2] || "")) min = 15;
        const suf = m[3] || "";
        if (/pm|tarde|noche/.test(suf) && h < 12) h += 12;
        else if (/am|mañana|manana/.test(suf) && h === 12) h = 0;
        else if (!suf && h >= 1 && h <= 7) h += 12;
      }
    }
    if (h === null) {
      m = tomar(/\b(\d{1,2})\s*(am|pm)\b/);
      if (m) { h = +m[1]; if (m[2] === "pm" && h < 12) h += 12; if (m[2] === "am" && h === 12) h = 0; }
    }
    if (h === null) {
      m = tomar(/\b(mediodia|medianoche)\b/);
      if (m) h = m[1] === "mediodia" ? 12 : 0;
    }
    if (h !== null) hora = `${String(Math.min(h, 23)).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  }

  // fecha
  if (fecha === null) {
    const hoy0 = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    let m;
    if ((m = tomar(/\bpasado\s+mañana\b|\bpasado\s+manana\b/))) fecha = ymd(sumaDias(hoy0, 2));
    else if ((m = tomar(/\bhoy\b|\besta\s+noche\b|\besta\s+tarde\b/))) fecha = ymd(hoy0);
    else if ((m = tomar(/\bmañana\b|\bmanana\b/))) fecha = ymd(sumaDias(hoy0, 1));
    else if ((m = tomar(/\ben\s+(\d{1,2})\s+dias?\b/))) fecha = ymd(sumaDias(hoy0, +m[1]));
    else if ((m = tomar(/\b(?:el\s+|este\s+|proximo\s+|el\s+proximo\s+)?(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/))) {
      const obj = DIA_N[m[1]];
      let diff = (obj - hoy0.getDay() + 7) % 7;
      if (diff === 0 && /proximo/.test(m[0])) diff = 7;
      fecha = ymd(sumaDias(hoy0, diff));
    } else if ((m = tomar(/\b(?:el\s+)?(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b/))) {
      let y = ahora.getFullYear();
      let f = new Date(y, MES_N[m[2]], +m[1]);
      if (f < hoy0) f = new Date(y + 1, MES_N[m[2]], +m[1]);
      fecha = ymd(f);
    } else if ((m = tomar(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/))) {
      let y = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : ahora.getFullYear();
      let f = new Date(y, +m[2] - 1, +m[1]);
      if (!m[3] && f < hoy0) f = new Date(y + 1, +m[2] - 1, +m[1]);
      fecha = ymd(f);
    }
  }

  if (fecha === null) {
    const hoy0 = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    if (hora) {
      const [hh, mm] = hora.split(":").map(Number);
      const cuando = new Date(hoy0); cuando.setHours(hh, mm, 0, 0);
      fecha = ymd(cuando < ahora ? sumaDias(hoy0, 1) : hoy0);
    } else fecha = ymd(hoy0);
  }

  // título = lo que sobra
  let titulo = "";
  for (let i = 0; i < texto.length; i++) if (!mask[i]) titulo += texto[i];
  titulo = titulo.replace(/\s+/g, " ")
    .replace(/^[\s,.\-–]+|[\s,.\-–]+$/g, "")
    .replace(/^(a|de|el|la|los|las|en|para|que|y)\s+/i, "")
    .replace(/\s+(a|de|el|la|en|para|y)$/i, "")
    .trim();
  if (!titulo) titulo = "Recordatorio";
  titulo = titulo[0].toUpperCase() + titulo.slice(1);

  return { titulo, fecha, hora, duracion, repetir };
}

/* ─────────────── intérprete con Claude (mejor comprensión) ─────────────── */
async function parsearConIA(texto, ahora) {
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) throw new Error("api");
  const data = await r.json();
  const txt = (data.content || []).map((i) => (i.type === "text" ? i.text : "")).join("").trim();
  const limpio = txt.replace(/```json|```/g, "").trim();
  const obj = JSON.parse(limpio.slice(limpio.indexOf("{"), limpio.lastIndexOf("}") + 1));
  if (!obj.titulo || !/^\d{4}-\d{2}-\d{2}$/.test(obj.fecha || "")) throw new Error("formato");
  if (obj.hora && !/^\d{2}:\d{2}$/.test(obj.hora)) obj.hora = null;
  return obj;
}

/* ──────────────────────── almacenamiento ──────────────────────── */
const CLAVE = "agenda:eventos:v1";
let memoria = null;
async function leer() {
  try {
    const r = await window.storage.get(CLAVE);
    return r && r.value ? JSON.parse(r.value) : [];
  } catch {
    return memoria || [];
  }
}
async function guardar(evs) {
  memoria = evs;
  try { await window.storage.set(CLAVE, JSON.stringify(evs)); } catch { /* modo memoria */ }
}

/* ──────────────────────── lógica de ocurrencias ──────────────────────── */
function ocurreEn(ev, dia) {
  if ((ev.excepciones || []).includes(dia)) return false;
  if (dia < ev.fecha) return false;
  if (!ev.repetir) return ev.fecha === dia;
  if (ev.repetir === "dia") return true;
  if (ev.repetir === "semana") return deYmd(dia).getDay() === deYmd(ev.fecha).getDay();
  return false;
}
const hechoEn = (ev, dia) => (ev.hechos || []).includes(dia);

/* ────────────────────────────── app ────────────────────────────── */
export default function Agenda() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [ahora, setAhora] = useState(new Date());
  const [sel, setSel] = useState(ymd(new Date()));
  const [vista, setVista] = useState("dia");
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [editando, setEditando] = useState(null);
  const [anclaMes, setAnclaMes] = useState(new Date());
  const area = useRef(null);

  useEffect(() => { leer().then((e) => { setEventos(e); setCargando(false); }); }, []);
  useEffect(() => { const t = setInterval(() => setAhora(new Date()), 30000); return () => clearInterval(t); }, []);
  useEffect(() => { if (!aviso) return; const t = setTimeout(() => setAviso(null), 6000); return () => clearTimeout(t); }, [aviso]);

  const actualizar = (nuevos) => { setEventos(nuevos); guardar(nuevos); };

  const delDia = useMemo(() => {
    const l = eventos.filter((e) => ocurreEn(e, sel));
    return l.sort((a, b) => (a.hora || "zz").localeCompare(b.hora || "zz"));
  }, [eventos, sel]);

  const conHora = delDia.filter((e) => e.hora);
  const sinHora = delDia.filter((e) => !e.hora);

  /* añadir desde el mensaje */
  async function enviar() {
    const t = texto.trim();
    if (!t || pensando) return;
    setPensando(true);
    setTexto("");
    const ref = new Date();
    let campos;
    try { campos = await parsearConIA(t, ref); }
    catch { campos = parsearLocal(t, ref); }
    const ev = {
      id: uid(),
      titulo: campos.titulo || "Recordatorio",
      fecha: campos.fecha,
      hora: campos.hora || null,
      duracion: campos.duracion || null,
      repetir: campos.repetir || null,
      nota: campos.nota || "",
      hechos: [],
      excepciones: [],
      crudo: t,
    };
    actualizar([...eventos, ev]);
    setSel(ev.fecha);
    setVista("dia");
    setPensando(false);
    setAviso(ev);
  }

  const alternarHecho = (ev, dia) => {
    const hechos = hechoEn(ev, dia) ? ev.hechos.filter((d) => d !== dia) : [...(ev.hechos || []), dia];
    actualizar(eventos.map((e) => (e.id === ev.id ? { ...e, hechos } : e)));
  };
  const deshacer = (id) => { actualizar(eventos.filter((e) => e.id !== id)); setAviso(null); };

  /* semana visible */
  const inicioSemana = useMemo(() => {
    const d = deYmd(sel);
    return sumaDias(d, -((d.getDay() + 6) % 7));
  }, [sel]);
  const semana = Array.from({ length: 7 }, (_, i) => sumaDias(inicioSemana, i));

  const selD = deYmd(sel);
  const esHoy = mismoDia(selD, ahora);
  const horaAhora = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;

  const descripcion = (ev) => {
    const p = [];
    if (ev.hora) p.push(ev.hora + (ev.duracion ? ` · ${ev.duracion >= 60 ? (ev.duracion / 60) + " h" : ev.duracion + " min"}` : ""));
    if (ev.repetir) p.push(ev.repetir === "dia" ? "cada día" : "cada semana");
    if (ev.nota) p.push(ev.nota);
    return p.join(" · ");
  };

  return (
    <div className="ag-root">
      <style>{CSS}</style>

      <header className="ag-head">
        <div className="ag-eyebrow">{MESES_L[selD.getMonth()]} {selD.getFullYear()}</div>
        <div className="ag-title-row">
          <h1 className="ag-title">{esHoy ? "hoy" : DIAS_L[selD.getDay()]} {selD.getDate()}</h1>
          {!esHoy && <button className="ag-hoy" onClick={() => { setSel(ymd(new Date())); setAnclaMes(new Date()); }}>ir a hoy</button>}
        </div>
        <div className="ag-tabs">
          <button className="ag-tab" data-on={vista === "dia" ? 1 : 0} onClick={() => setVista("dia")}>Día</button>
          <button className="ag-tab" data-on={vista === "mes" ? 1 : 0} onClick={() => { setVista("mes"); setAnclaMes(selD); }}>Mes</button>
        </div>
      </header>

      {vista === "dia" && (
        <>
          <div className="ag-week">
            {semana.map((d) => {
              const k = ymd(d);
              const tiene = eventos.some((e) => ocurreEn(e, k));
              return (
                <button key={k} className="ag-day" data-sel={k === sel ? 1 : 0} data-hoy={mismoDia(d, ahora) ? 1 : 0} onClick={() => setSel(k)}>
                  <div className="d">{DIAS_C[d.getDay()]}</div>
                  <div className="n">{d.getDate()}</div>
                  {tiene ? <div className="p" /> : <div style={{ height: 8 }} />}
                </button>
              );
            })}
          </div>
          <div className="ag-nav">
            <button onClick={() => setSel(ymd(sumaDias(selD, -7)))}>← semana</button>
            <button onClick={() => setSel(ymd(sumaDias(selD, 7)))}>semana →</button>
          </div>

          <div className="ag-scroll">
            {cargando && <div className="ag-empty"><p>Cargando tu agenda…</p></div>}

            {!cargando && delDia.length === 0 && (
              <div className="ag-empty">
                <h3>Día libre</h3>
                <p>Escribe abajo lo que quieras agendar,<br />como si le mandaras un mensaje a alguien.</p>
                <div className="ag-chips">
                  {["dentista mañana 4pm", "gimnasio todos los lunes 7am", "llamar a mamá hoy 20:30", "entregar informe el 25 de agosto"].map((c) => (
                    <button key={c} className="ag-chip" onClick={() => { setTexto(c); area.current?.focus(); }}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {sinHora.length > 0 && (
              <>
                <div className="ag-sec">Sin hora</div>
                {sinHora.map((ev) => (
                  <div className="ag-row" key={ev.id}>
                    <div className="ag-time" />
                    <div className="ag-rail"><i /></div>
                    <button className="ag-card" data-done={hechoEn(ev, sel) ? 1 : 0} onClick={() => setEditando({ ...ev, _dia: sel })}>
                      <span className="ag-check" data-on={hechoEn(ev, sel) ? 1 : 0}
                        onClick={(e) => { e.stopPropagation(); alternarHecho(ev, sel); }}>✓</span>
                      <span style={{ flex: 1 }}>
                        <span className="t">{ev.titulo}</span>
                        {descripcion(ev) && <span className="m" style={{ display: "block" }}>{descripcion(ev)}</span>}
                      </span>
                    </button>
                  </div>
                ))}
              </>
            )}

            {conHora.length > 0 && <div className="ag-sec">Horario</div>}
            {conHora.map((ev, i) => {
              const previa = conHora[i - 1];
              const marcarAhora = esHoy && ev.hora > horaAhora && (!previa || previa.hora <= horaAhora);
              return (
                <React.Fragment key={ev.id}>
                  {marcarAhora && (
                    <div className="ag-now"><span>{horaAhora}</span><div /></div>
                  )}
                  <div className="ag-row">
                    <div className="ag-time">{ev.hora}</div>
                    <div className="ag-rail"><i /></div>
                    <button className="ag-card" data-done={hechoEn(ev, sel) ? 1 : 0} onClick={() => setEditando({ ...ev, _dia: sel })}>
                      <span className="ag-check" data-on={hechoEn(ev, sel) ? 1 : 0}
                        onClick={(e) => { e.stopPropagation(); alternarHecho(ev, sel); }}>✓</span>
                      <span style={{ flex: 1 }}>
                        <span className="t">{ev.titulo}</span>
                        {descripcion(ev) && <span className="m" style={{ display: "block" }}>{descripcion(ev)}</span>}
                      </span>
                    </button>
                  </div>
                </React.Fragment>
              );
            })}
            {esHoy && conHora.length > 0 && conHora[conHora.length - 1].hora <= horaAhora && (
              <div className="ag-now"><span>{horaAhora}</span><div /></div>
            )}
          </div>
        </>
      )}

      {vista === "mes" && (
        <div className="ag-scroll">
          <div className="ag-nav" style={{ padding: "4px 0 10px" }}>
            <button onClick={() => setAnclaMes(new Date(anclaMes.getFullYear(), anclaMes.getMonth() - 1, 1))}>← mes</button>
            <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 16 }}>
              {MESES_L[anclaMes.getMonth()]} {anclaMes.getFullYear()}
            </span>
            <button onClick={() => setAnclaMes(new Date(anclaMes.getFullYear(), anclaMes.getMonth() + 1, 1))}>mes →</button>
          </div>
          <div className="ag-mes" style={{ padding: 0 }}>
            <div className="ag-grid">
              {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <div className="ag-gh" key={i}>{d}</div>)}
              {(() => {
                const primero = new Date(anclaMes.getFullYear(), anclaMes.getMonth(), 1);
                const desde = sumaDias(primero, -((primero.getDay() + 6) % 7));
                return Array.from({ length: 42 }, (_, i) => {
                  const d = sumaDias(desde, i);
                  const k = ymd(d);
                  const fuera = d.getMonth() !== anclaMes.getMonth();
                  const n = eventos.filter((e) => ocurreEn(e, k)).length;
                  return (
                    <button key={k} className={"ag-cell" + (fuera ? " off" : "")} data-sel={k === sel ? 1 : 0}
                      data-hoy={mismoDia(d, ahora) ? 1 : 0}
                      onClick={() => { setSel(k); setVista("dia"); }}>
                      <span className="n">{d.getDate()}</span>
                      <span className="ag-dots">
                        {Array.from({ length: Math.min(n, 3) }, (_, j) => <i key={j} />)}
                      </span>
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {aviso && (
        <div className="ag-toast">
          <div className="x">
            Agendado: {aviso.titulo}<br />
            <b>{etiquetaFecha(aviso.fecha, ahora)}{aviso.hora ? ` · ${aviso.hora}` : " · sin hora"}</b>
          </div>
          <button onClick={() => deshacer(aviso.id)}>Deshacer</button>
        </div>
      )}

      <div className="ag-bar">
        {pensando && <div className="ag-pending"><span className="ag-dot" />entendiendo tu mensaje…</div>}
        <div className="ag-input">
          <textarea
            ref={area}
            rows={1}
            value={texto}
            placeholder="Reunión con Ana mañana 4pm"
            onChange={(e) => {
              setTexto(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
            }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
          />
          <button className="ag-send" onClick={enviar} disabled={!texto.trim() || pensando} aria-label="Agendar">↑</button>
        </div>
      </div>

      {editando && (
        <div className="ag-veil" onClick={() => setEditando(null)}>
          <div className="ag-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="ag-grab" />
            <div className="ag-lab">Qué</div>
            <input className="ag-field" value={editando.titulo}
              onChange={(e) => setEditando({ ...editando, titulo: e.target.value })} />

            <div className="ag-lab">Cuándo</div>
            <div className="ag-two">
              <input className="ag-field" type="date" value={editando.fecha}
                onChange={(e) => setEditando({ ...editando, fecha: e.target.value })} />
              <input className="ag-field" type="time" value={editando.hora || ""}
                onChange={(e) => setEditando({ ...editando, hora: e.target.value || null })} />
            </div>

            <div className="ag-lab">Duración y repetición</div>
            <div className="ag-two">
              <select className="ag-field" value={editando.duracion || ""}
                onChange={(e) => setEditando({ ...editando, duracion: e.target.value ? +e.target.value : null })}>
                <option value="">Sin duración</option>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="60">1 hora</option>
                <option value="120">2 horas</option>
              </select>
              <select className="ag-field" value={editando.repetir || ""}
                onChange={(e) => setEditando({ ...editando, repetir: e.target.value || null })}>
                <option value="">Una vez</option>
                <option value="dia">Cada día</option>
                <option value="semana">Cada semana</option>
              </select>
            </div>

            <div className="ag-lab">Nota</div>
            <textarea className="ag-field" rows={2} value={editando.nota || ""}
              onChange={(e) => setEditando({ ...editando, nota: e.target.value })} />

            <div className="ag-btns">
              <button className="ag-btn del" onClick={() => {
                if (editando.repetir) {
                  actualizar(eventos.map((e) => e.id === editando.id
                    ? { ...e, excepciones: [...(e.excepciones || []), editando._dia] } : e));
                } else {
                  actualizar(eventos.filter((e) => e.id !== editando.id));
                }
                setEditando(null);
              }}>{editando.repetir ? "Quitar este día" : "Eliminar"}</button>
              <button className="ag-btn" onClick={() => {
                const { _dia, ...limpio } = editando;
                actualizar(eventos.map((e) => (e.id === limpio.id ? limpio : e)));
                setSel(limpio.fecha);
                setEditando(null);
              }}>Guardar</button>
            </div>
            {editando.repetir && (
              <button className="ag-btn ghost" style={{ width: "100%", marginTop: 9 }}
                onClick={() => { actualizar(eventos.filter((e) => e.id !== editando.id)); setEditando(null); }}>
                Eliminar toda la serie
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
