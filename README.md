# agenda

App web personal para organizarse. Escribes un mensaje en lenguaje natural
—"dentista mañana 4pm"— y se agenda solo en el día y hora correctos. Todo en
español, pensada primero para móvil.

El contexto de diseño y las reglas del intérprete están en [`CLAUDE.md`](./CLAUDE.md).

## Arrancar

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (por defecto `http://localhost:5173`). Como el
server está con `host: true`, también puedes abrirla desde el móvil en la misma
red WiFi entrando a `http://<ip-de-tu-pc>:5173`.

## Interpretación con IA (opcional)

La app tiene dos capas para entender el mensaje:

1. **Con IA** — más lista para frases libres. Necesita una API key de Anthropic.
2. **Local** — respaldo sin conexión; funciona siempre, sin key.

Para activar la IA, copia `.env.example` a `.env` y pon tu clave:

```bash
cp .env.example .env
# edita .env y pega tu ANTHROPIC_API_KEY
```

La clave se usa **solo en el servidor** (`server/interpretar.js`), expuesto en
desarrollo por el endpoint `/api/interpretar` (ver `vite.config.js`). Nunca
viaja al navegador. Sin `.env`, la app cae automáticamente al intérprete local.

## Estructura

```
index.html            punto de entrada
src/
  main.jsx            monta React
  Agenda.jsx          la app entera (componente + estilos + intérprete local)
  index.css           reset mínimo
server/
  interpretar.js      llamada a la API de Anthropic (key en el servidor)
vite.config.js        config + endpoint /api/interpretar para desarrollo
```

## Build de producción

```bash
npm run build      # genera dist/
npm run preview    # sirve dist/ localmente
```

> Nota: el endpoint `/api/interpretar` solo corre con el server de desarrollo de
> Vite. Para desplegar con IA en producción, reutiliza `server/interpretar.js`
> como función serverless (Vercel/Netlify) en la ruta `/api/interpretar`. El
> `dist/` estático funciona por sí solo con el intérprete local.

## Almacenamiento

Los eventos se guardan en `localStorage` de este navegador (clave
`agenda:eventos:v1`). Para sincronizar entre dispositivos haría falta un backend.
