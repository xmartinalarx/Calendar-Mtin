import React, { useState, useEffect, useMemo, useRef } from "react";

/* ────────────────────────────── estilos ──────────────────────────────
   Tema cálido y amigable. Las fuentes se cargan desde index.html.
   La app vive dentro de un "marco de teléfono" centrado (.ag-page) para que
   se vea bien tanto en móvil como en escritorio. El carril del día con la
   línea naranja de "ahora" sigue siendo el elemento distintivo.            */
const CSS = `
.ag-page{
  --tinta:#20223A; --gris:#7C819A; --niebla:#EEF0F8; --papel:#FFFFFF;
  --azulon:#4A47E5; --azulon-2:#ECEBFF; --durazno:#FF7A4D; --durazno-2:#FFE7DD;
  --verde:#12A67A; --verde-2:#DCF4EC; --borde:#E6E8F3;
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  background:linear-gradient(160deg,#E7E6FB 0%,#F1ECF4 55%,#FCEDE6 100%);
  font-family:'Instrument Sans',system-ui,sans-serif; -webkit-font-smoothing:antialiased;
}
.ag-page *{box-sizing:border-box;}
.ag-root{
  position:relative; width:100%; height:100%; overflow:hidden;
  display:flex; flex-direction:column; background:var(--niebla); color:var(--tinta);
}
@media(min-width:520px){
  .ag-root{width:430px; height:min(880px,100% - 44px); border-radius:34px;
    box-shadow:0 24px 60px rgba(31,29,80,.20);}
}
.ag-root button{font-family:inherit; cursor:pointer; border:none; background:none; color:inherit;}
.ag-root input,.ag-root select,.ag-root textarea{font-family:inherit; font-size:16px; color:inherit;}
.ag-root :focus-visible{outline:2px solid var(--azulon); outline-offset:2px; border-radius:8px;}

/* cabecera */
.ag-head{padding:22px 22px 12px; flex-shrink:0;}
.ag-eyebrow{font-size:13px; font-weight:600; color:var(--gris); text-transform:capitalize;}
.ag-title-row{display:flex; align-items:flex-end; justify-content:space-between; gap:12px; margin-top:4px;}
.ag-title{font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:36px;
  line-height:1; letter-spacing:-.03em; text-transform:capitalize;}
.ag-hoy{font-size:13px; font-weight:600; background:var(--papel); border:1px solid var(--borde);
  padding:9px 14px; border-radius:999px; color:var(--azulon); box-shadow:0 2px 6px rgba(31,29,80,.06);}
.ag-hoy:active{transform:scale(.96);}
.ag-tabs{display:flex; gap:4px; margin-top:18px; background:#E2E4F0; padding:4px; border-radius:16px;}
.ag-tab{flex:1; padding:10px; border-radius:12px; font-size:14px; font-weight:600; color:var(--gris); transition:.15s;}
.ag-tab[data-on="1"]{background:var(--papel); color:var(--tinta); box-shadow:0 2px 6px rgba(31,29,80,.10);}

/* tira de semana */
.ag-week{display:flex; gap:6px; padding:14px 18px 4px; flex-shrink:0;}
.ag-day{flex:1; padding:9px 0 10px; border-radius:16px; text-align:center; background:transparent; transition:.15s;}
.ag-day .d{font-size:11px; font-weight:600; text-transform:capitalize; color:var(--gris);}
.ag-day .n{font-family:'Bricolage Grotesque',sans-serif; font-weight:700; font-size:18px; margin-top:4px;}
.ag-day .p{width:5px; height:5px; border-radius:50%; background:var(--azulon); margin:5px auto 0;}
.ag-day[data-sel="1"]{background:var(--azulon); color:#fff; box-shadow:0 6px 16px rgba(74,71,229,.35);}
.ag-day[data-sel="1"] .d{color:rgba(255,255,255,.8);}
.ag-day[data-sel="1"] .p{background:#fff;}
.ag-day[data-hoy="1"] .n{color:var(--durazno);}
.ag-day[data-sel="1"][data-hoy="1"]{background:var(--durazno); box-shadow:0 6px 16px rgba(255,122,77,.4);}
.ag-day[data-sel="1"][data-hoy="1"] .n{color:#fff;}
.ag-nav{display:flex; align-items:center; justify-content:space-between; padding:2px 18px;}
.ag-nav button{font-size:13px; font-weight:600; color:var(--gris); padding:8px 12px; border-radius:10px;}
.ag-nav button:active{background:rgba(0,0,0,.04);}

/* carril del día */
.ag-scroll{flex:1; overflow-y:auto; padding:8px 18px 200px;}
.ag-sec{font-size:13px; font-weight:700; color:var(--gris); margin:18px 4px 10px;}
.ag-row{display:flex; gap:12px; align-items:stretch;}
.ag-time{width:50px; flex-shrink:0; padding-top:16px; text-align:right;
  font-family:'IBM Plex Mono',monospace; font-size:13px; font-weight:500; color:var(--gris);}
.ag-rail{width:12px; flex-shrink:0; position:relative;}
.ag-rail:before{content:''; position:absolute; left:5px; top:2px; bottom:2px; width:2px; background:var(--borde); border-radius:2px;}
.ag-rail i{position:absolute; left:0; top:18px; width:11px; height:11px; border-radius:50%;
  background:var(--papel); border:2.5px solid var(--azulon);}
.ag-card{flex:1; background:var(--papel); border-radius:18px; padding:15px 16px; margin-bottom:10px;
  border:1px solid var(--borde); text-align:left; display:flex; gap:12px; align-items:flex-start;
  box-shadow:0 4px 14px rgba(31,29,80,.05); animation:ag-in .28s cubic-bezier(.2,.8,.3,1);}
.ag-card:active{transform:scale(.99);}
@keyframes ag-in{from{opacity:0; transform:translateY(8px) scale(.98);} to{opacity:1; transform:none;}}
.ag-check{width:24px; height:24px; border-radius:9px; border:2px solid var(--borde); flex-shrink:0;
  margin-top:1px; display:grid; place-items:center; font-size:13px; color:#fff; background:var(--papel); transition:.15s;}
.ag-check[data-on="1"]{background:var(--verde); border-color:var(--verde);}
.ag-card .t{font-size:15.5px; font-weight:600; line-height:1.35; word-break:break-word;}
.ag-card[data-done="1"]{background:#F7F8FC;}
.ag-card[data-done="1"] .t{color:var(--gris); text-decoration:line-through;}
.ag-card .m{font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:var(--gris); margin-top:5px;}
.ag-now{display:flex; align-items:center; gap:8px; margin:6px 0 12px; padding-left:50px;}
.ag-now span{font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:600; color:var(--durazno);
  background:var(--durazno-2); padding:2px 8px; border-radius:999px;}
.ag-now div{flex:1; height:2px; background:var(--durazno); border-radius:2px;}

/* vacío */
.ag-empty{text-align:center; padding:40px 16px;}
.ag-empty-emoji{font-size:46px; line-height:1;}
.ag-empty h3{font-family:'Bricolage Grotesque',sans-serif; font-weight:700; font-size:22px; letter-spacing:-.02em; margin-top:14px;}
.ag-empty p{font-size:14.5px; color:var(--gris); margin-top:8px; line-height:1.55;}
.ag-chips{display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:22px;}
.ag-chip{font-size:13px; font-weight:500; background:var(--papel); border:1px solid var(--borde);
  padding:9px 13px; border-radius:999px; color:var(--tinta); box-shadow:0 2px 6px rgba(31,29,80,.05); transition:.15s;}
.ag-chip:active{transform:scale(.96); background:var(--azulon-2);}

/* mes */
.ag-mes{padding:4px 14px 200px;}
.ag-grid{display:grid; grid-template-columns:repeat(7,1fr); gap:5px;}
.ag-gh{font-size:11px; font-weight:600; color:var(--gris); text-align:center; padding:6px 0;}
.ag-cell{aspect-ratio:1/1.05; border-radius:14px; background:var(--papel); border:1px solid var(--borde);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px;
  box-shadow:0 2px 8px rgba(31,29,80,.04);}
.ag-cell.off{background:transparent; border-color:transparent; box-shadow:none; color:#B4B8CC;}
.ag-cell .n{font-size:14px; font-weight:600;}
.ag-cell[data-hoy="1"]{border-color:var(--durazno); border-width:2px;}
.ag-cell[data-sel="1"]{background:var(--azulon); color:#fff; border-color:var(--azulon); box-shadow:0 6px 16px rgba(74,71,229,.3);}
.ag-dots{display:flex; gap:3px; height:5px;}
.ag-dots i{width:5px; height:5px; border-radius:50%; background:var(--azulon);}
.ag-cell[data-sel="1"] .ag-dots i{background:#fff;}

/* barra de captura */
.ag-bar{position:absolute; left:0; right:0; bottom:0; padding:14px 16px calc(16px + env(safe-area-inset-bottom));
  background:linear-gradient(to top,var(--niebla) 66%,rgba(238,240,248,0));}
.ag-input{display:flex; align-items:flex-end; gap:8px; background:var(--papel); border:1px solid var(--borde);
  border-radius:22px; padding:8px 8px 8px 16px; box-shadow:0 10px 30px rgba(31,29,80,.14);}
.ag-input textarea{flex:1; border:none; outline:none; resize:none; background:none; max-height:100px;
  line-height:1.45; padding:9px 0; font-size:16px;}
.ag-input textarea::placeholder{color:#A2A7BE;}
.ag-send{width:42px; height:42px; border-radius:50%; background:var(--azulon); color:#fff; flex-shrink:0;
  display:grid; place-items:center; font-size:19px; box-shadow:0 4px 12px rgba(74,71,229,.4); transition:.15s;}
.ag-send:disabled{opacity:.35; box-shadow:none;}
.ag-send:active:not(:disabled){transform:scale(.9);}
.ag-pending{font-size:12.5px; color:var(--gris); padding:2px 6px 10px; display:flex; align-items:center; gap:8px;}
.ag-dot{width:7px;height:7px;border-radius:50%;background:var(--azulon);animation:ag-pulse 1s infinite;}
@keyframes ag-pulse{0%,100%{opacity:.3;}50%{opacity:1;}}

/* aviso */
.ag-toast{position:absolute; left:16px; right:16px; bottom:100px; background:var(--tinta); color:#fff;
  border-radius:18px; padding:14px 16px; display:flex; align-items:center; gap:12px;
  box-shadow:0 14px 34px rgba(20,22,44,.34); animation:ag-in .25s ease;}
.ag-toast .x{flex:1; font-size:14px; line-height:1.4;}
.ag-toast b{font-family:'IBM Plex Mono',monospace; font-weight:500; color:#FFC3AD;}
.ag-toast button{font-size:13.5px; font-weight:700; color:#FFC3AD; padding:8px 4px; flex-shrink:0;}

/* hoja de edición */
.ag-veil{position:absolute; inset:0; background:rgba(20,22,44,.42); display:flex; align-items:flex-end; z-index:5;
  animation:ag-fade .2s ease;}
@keyframes ag-fade{from{opacity:0;} to{opacity:1;}}
.ag-sheet{width:100%; background:var(--niebla); border-radius:26px 26px 0 0;
  padding:8px 20px calc(22px + env(safe-area-inset-bottom)); max-height:92%; overflow-y:auto;
  animation:ag-up .28s cubic-bezier(.2,.8,.3,1);}
@keyframes ag-up{from{transform:translateY(100%);} to{transform:none;}}
.ag-grab{width:42px; height:5px; border-radius:3px; background:#CBCFE0; margin:8px auto 16px;}
.ag-lab{font-size:12.5px; font-weight:700; color:var(--gris); margin:16px 2px 8px;}
.ag-field{width:100%; background:var(--papel); border:1px solid var(--borde); border-radius:14px;
  padding:13px 14px; outline:none; box-shadow:0 2px 6px rgba(31,29,80,.04);}
.ag-field:focus{border-color:var(--azulon);}
.ag-two{display:flex; gap:10px;}
.ag-two>*{flex:1; min-width:0;}
.ag-btns{display:flex; gap:10px; margin-top:24px;}
.ag-btn{flex:1; padding:15px; border-radius:16px; font-weight:700; font-size:15px;
  background:var(--azulon); color:#fff; box-shadow:0 6px 16px rgba(74,71,229,.3); transition:.15s;}
.ag-btn:active{transform:scale(.98);}
.ag-btn.ghost{background:transparent; border:1px solid var(--borde); color:var(--gris); box-shadow:none; flex:0 0 auto; padding:15px 20px;}
.ag-btn.del{background:transparent; border:1px solid #F3C7B8; color:#D0522E; box-shadow:none;}
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

/* ──────────────────────── conexión con el backend ────────────────────────
   El backend Node (server/) expone estas rutas; en desarrollo Vite les hace
   proxy al servidor en el puerto 3001 (ver vite.config.js):
     GET  /api/eventos      → lista de eventos (SQLite)
     POST /api/eventos      → guarda la lista completa
     POST /api/interpretar  → interpreta el mensaje con IA (key en el servidor)
   Si defines un token (AGENDA_TOKEN en el servidor), ponlo también en .env
   como VITE_AGENDA_TOKEN para que el navegador lo mande.                    */
const API_EVENTOS = "/api/eventos";
const API_IA = "/api/interpretar";
const TOKEN = import.meta.env.VITE_AGENDA_TOKEN || "";
const cabecerasAuth = () => (TOKEN ? { "X-Agenda-Token": TOKEN } : {});
const horaLocal = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

/* ─────────────── intérprete con Claude (mejor comprensión) ───────────────
   Manda el texto al backend, que llama a la API de Anthropic con la key en
   variable de entorno. La key NUNCA viaja al navegador. Si el endpoint no está
   disponible (sin key, sin conexión, sin servidor) se lanza un error y
   enviar() cae a parsearLocal. Ver server/interpretar.js.                  */
async function parsearConIA(texto, ahora) {
  const r = await fetch(API_IA, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...cabecerasAuth() },
    body: JSON.stringify({ texto, ahora: horaLocal(ahora) }),
  });
  if (!r.ok) throw new Error("api");
  const obj = await r.json();
  if (!obj.titulo || !/^\d{4}-\d{2}-\d{2}$/.test(obj.fecha || "")) throw new Error("formato");
  if (obj.hora && !/^\d{2}:\d{2}$/.test(obj.hora)) obj.hora = null;
  return obj;
}

/* ──────────────────────── almacenamiento ────────────────────────
   Fuente de verdad: la base de datos del backend (SQLite, vía /api/eventos).
   localStorage es un cache local: da respuesta instantánea y permite seguir
   usando la app sin conexión (o en desarrollo si el servidor no está arriba). */
const CLAVE = "agenda:eventos:v1";

const cacheLocal = () => {
  try {
    const r = localStorage.getItem(CLAVE);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
};

async function leer() {
  try {
    const r = await fetch(API_EVENTOS, { headers: cabecerasAuth() });
    if (!r.ok) throw new Error("http");
    const data = await r.json();
    if (!Array.isArray(data)) throw new Error("forma");
    try { localStorage.setItem(CLAVE, JSON.stringify(data)); } catch { /* cache lleno */ }
    return data;
  } catch {
    // sin servidor (offline o desarrollo sin backend): usa el cache local
    return cacheLocal();
  }
}

function guardar(evs) {
  // 1) cache local inmediato: la interfaz nunca espera al servidor
  try { localStorage.setItem(CLAVE, JSON.stringify(evs)); } catch { /* cache lleno */ }
  // 2) sincroniza con la base de datos en segundo plano
  fetch(API_EVENTOS, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...cabecerasAuth() },
    body: JSON.stringify(evs),
  }).catch(() => { /* sin conexión: queda guardado en el cache local */ });
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
    <div className="ag-page">
      <style>{CSS}</style>
      <div className="ag-root">

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
                <div className="ag-empty-emoji">🗓️</div>
                <h3>Tu día está libre</h3>
                <p>Escríbeme abajo lo que quieras recordar<br />y lo agendo por ti al instante.</p>
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
    </div>
  );
}
