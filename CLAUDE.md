# Agenda — contexto del proyecto

App web personal para organizarse. La idea central: **escribes un mensaje en lenguaje natural y se agenda solo** en el día y hora correctos. Todo en español, pensada primero para móvil.

El punto de partida es `agenda.jsx`, un componente React de un solo archivo que ya funciona. Este documento explica cómo está hecho y qué hay que cambiar al sacarlo a un proyecto real.

---

## Qué hace hoy

- Barra de captura abajo: se escribe "dentista mañana 4pm" y se crea el evento.
- Vista día con carril de horas, línea de "ahora" y eventos ordenados; los eventos sin hora van arriba.
- Vista mes con puntos en los días ocupados.
- Marcar hecho, editar, eliminar, repetición diaria/semanal.
- Aviso de confirmación con botón de deshacer.

## Modelo de datos

```js
{
  id: "a1b2c3d4",
  titulo: "Almuerzo con Ana",
  fecha: "2026-08-13",      // YYYY-MM-DD, fecha de inicio
  hora: "14:00" | null,     // null = "sin hora"
  duracion: 60 | null,      // minutos
  repetir: null | "dia" | "semana",
  nota: "",
  hechos: ["2026-08-13"],   // días completados (sirve igual para eventos únicos y repetidos)
  excepciones: [],          // días borrados de una serie repetida
  crudo: "almuerzo con ana mañana a las 2"  // el mensaje original, útil para depurar el intérprete
}
```

`ocurreEn(ev, dia)` decide si un evento aparece en un día: única vez, cada día, o cada semana en el mismo día de la semana. Cualquier cambio en repetición pasa por ahí.

## Cómo se interpreta el mensaje

Dos capas, en este orden:

1. **`parsearConIA`** — manda el texto a Claude con la fecha/hora actual y pide de vuelta solo JSON. Es la que entiende frases libres ("me junto con el Pedro el jueves después de almuerzo").
2. **`parsearLocal`** — respaldo sin conexión. Trabaja sobre una versión del texto sin tildes, va marcando con una máscara los trozos que reconoce (fecha, hora, duración, repetición) y lo que sobra queda como título.

Reglas de negocio que hay que preservar si se toca el intérprete:

- Hora sin am/pm entre 1 y 7 → tarde (13:00–19:00).
- Sin fecha y con hora ya pasada → mañana.
- Sin hora → el evento va a "Sin hora", no se inventa una.
- El orden de parseo importa: duración → hora → fecha. "por 2 horas" es duración, "en 2 horas" es hora relativa, y "de la mañana" se consume como hora **antes** de que "mañana" se lea como fecha.

Cuando cambies el intérprete, prueba al menos estos casos: `hoy 20:30`, `mañana 4pm`, `el jueves a las 3 y media`, `en 2 horas`, `el 25 de agosto`, `15/9`, `gimnasio todos los lunes 7am`, `reunión por 1 hora mañana a las 10 de la mañana`.

## Diseño

No es un tema genérico; respétalo o cámbialo entero con intención.

El tema es **cálido y amigable** (redondeado, con aire, colores suaves). Las variables viven en `.ag-page` dentro de `src/Agenda.jsx`.

```
--tinta    #20223A   texto y superficies oscuras
--gris     #7C819A   texto secundario
--niebla   #EEF0F8   fondo de la app
--papel    #FFFFFF   tarjetas
--azulon   #4A47E5   acento principal (día seleccionado, botones)
--azulon-2 #ECEBFF   tinte claro del acento
--durazno  #FF7A4D   "hoy" y la línea de ahora
--durazno-2#FFE7DD   tinte claro del durazno
--verde    #12A67A   completado
--verde-2  #DCF4EC   tinte claro del verde
--borde    #E6E8F3
```

La app se muestra dentro de un **marco tipo teléfono centrado** (`.ag-page`): en móvil ocupa toda la pantalla; desde 520px de ancho se convierte en una tarjeta de 430px de ancho, redondeada y con sombra, sobre un fondo con degradado cálido. Esto es lo que hace que se vea bien en escritorio y no "estirada".

Tipografías (cargadas en `index.html`): **Bricolage Grotesque** para títulos, **Instrument Sans** para cuerpo y etiquetas, **IBM Plex Mono** solo para horas. Los títulos y días van en sentence case (capitalizados), no en minúscula forzada.

El elemento distintivo es el carril vertical del día con la línea naranja de "ahora". Si algo compite con eso visualmente, sobra.

Piso de calidad: funciona en pantallas angostas, foco de teclado visible, Enter envía y Shift+Enter hace salto de línea.

---

## Ya sacado del artifact (hecho)

El proyecto ya es un Vite + React real. Las dos cosas que había que reemplazar están resueltas:

**1. Almacenamiento.** `leer()` y `guardar()` usan `localStorage` (clave `agenda:eventos:v1`), síncronos. Para sincronizar entre dispositivos haría falta un backend.

**2. La llamada a la API.** `parsearConIA` ya no llama directo a `api.anthropic.com`. Hace `fetch` a un endpoint propio `/api/interpretar`; la llamada real a Anthropic vive en `server/interpretar.js` con la key en variable de entorno (**nunca en el navegador**). En desarrollo el endpoint lo expone un plugin de Vite (`vite.config.js`); sin key configurada, la app cae sola a `parsearLocal`. Para producción, reutilizar `server/interpretar.js` como función serverless.

## Stack

Vite + React, sin router (una sola pantalla). El CSS vive en un template string dentro del componente (`src/Agenda.jsx`); si el proyecto crece, sácalo a un archivo `.css` antes que meter una librería de estilos.

```bash
npm install
npm run dev
```

Estructura: `index.html`, `src/{main,Agenda}.jsx`, `src/index.css`, `server/interpretar.js`, `vite.config.js`. Ver `README.md`.

## Pendientes, por orden de utilidad

1. Notificaciones reales (Web Push o exportar a .ics para el calendario del teléfono). Es lo único importante que hoy no hace.
2. Búsqueda de eventos y vista "próximos 7 días".
3. Deshacer más allá del último evento creado.
4. Eventos de varios días y horarios que cruzan medianoche (hoy no se contemplan).
5. Desplegar el endpoint `/api/interpretar` como función serverless para que la IA funcione en producción (hoy solo corre en el server de desarrollo de Vite).

## Convenciones

- Toda la interfaz en español, en sentence case (los títulos y días capitalizados). Los botones dicen la acción exacta que ocurre ("Guardar", "Eliminar", "Deshacer").
- Fechas siempre como string `YYYY-MM-DD`, horas como `HH:MM`. Nada de objetos `Date` guardados.
- Los estados vacíos invitan a actuar, no decoran.
