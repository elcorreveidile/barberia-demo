# Filo Barber Studio — Web-app de barbería y estética masculina

Demo completa de una web-app para una **barbería y estética masculina en Granada**
(marca ficticia _"Filo Barber Studio"_, fácil de renombrar). Incluye web pública,
**reserva online con anti-solapamiento a nivel de base de datos**, **panel privado**
con login por _magic link_, y un **agente de IA por WhatsApp** (Claude) que agenda
citas conversando en lenguaje natural.

> **Marca placeholder.** Todo lo de la marca vive en `src/lib/negocio.ts`
> (nombre, claim, dirección, teléfono, horario…). Cámbialo ahí para renombrar.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS**
- **Neon** (Postgres) + **Drizzle ORM**
- **Resend** para email (magic link y confirmaciones de cita)
- **Anthropic Claude** (`claude-opus-4-8`, thinking adaptativo + tool use) para el bot
- **Twilio** (sandbox de WhatsApp) para la demo; documentado el salto a Meta Cloud API
- Despliegue en **Vercel**

## Identidad visual

Fondo casi negro (`#121212`/`#1C1917`), titulares serif (Fraunces), cuerpo en Inter,
acento cobre/dorado (`#B68D40`), emblema clásico y botón flotante de WhatsApp.

---

## Estructura

```
src/
├── app/
│   ├── (public)/            # Web pública (home, servicios, equipo, galería, contacto, reservar)
│   ├── dashboard/           # Panel privado (login + (panel) protegido)
│   └── api/                 # servicios, disponibilidad, reservar, auth/*, dashboard/*, whatsapp/webhook
├── components/              # Navbar, Footer, WhatsAppButton, DashboardNav
├── db/                      # schema.ts (Drizzle), index.ts, migrate.ts, seed.ts
└── lib/                     # negocio, fecha (TZ), disponibilidad, reservas, auth, email, twilio, agente
drizzle/
└── 0000_init.sql            # Migración SQL (incluye el constraint EXCLUDE gist)
```

---

## Variables de entorno

Copia `.env.example` a `.env` y rellena:

| Variable | Para qué sirve |
|---|---|
| `DATABASE_URL` | Conexión a Neon Postgres (usa la _pooled connection_). |
| `RESEND_API_KEY` | Envío de emails (magic link y confirmaciones) vía Resend. |
| `EMAIL_FROM` | Remitente, p.ej. `Filo Barber Studio <reservas@tudominio.com>`. |
| `AUTH_SECRET` | Secreto para firmar cookies de sesión y tokens. `openssl rand -base64 32`. |
| `ADMIN_EMAILS` | Email(s) autorizados al panel, separados por coma. |
| `ANTHROPIC_API_KEY` | API de Claude para el agente de WhatsApp. |
| `TWILIO_ACCOUNT_SID` | Cuenta de Twilio (sandbox WhatsApp). |
| `TWILIO_AUTH_TOKEN` | Token de Twilio. |
| `TWILIO_WHATSAPP_FROM` | Número del sandbox, formato `whatsapp:+14155238886`. |
| `NEXT_PUBLIC_BASE_URL` | URL pública del sitio (para los enlaces de los emails). |

> Si faltan `RESEND_API_KEY`, `TWILIO_*` o `ANTHROPIC_API_KEY`, la app **no se rompe**:
> en local, los emails y mensajes de WhatsApp se imprimen por consola para que puedas
> ver el magic link y las respuestas del bot sin cuentas externas.

---

## Correr en local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar el entorno
cp .env.example .env   # y rellena DATABASE_URL como mínimo

# 3. Crear el esquema en Neon (aplica drizzle/0000_init.sql, incluido el EXCLUDE)
npm run db:migrate

# 4. Cargar datos de ejemplo (2 profesionales + 10 servicios)
npm run db:seed

# 5. Arrancar
npm run dev          # http://localhost:3000
```

Para entrar al panel: ve a `/dashboard`, introduce un email de `ADMIN_EMAILS`,
y abre el enlace mágico (en local aparece en la consola si no hay Resend).

### Scripts

| Script | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Build de producción. |
| `npm run db:migrate` | Aplica los `.sql` de `drizzle/` a Neon (idempotente). |
| `npm run db:seed` | Inserta profesionales y servicios de ejemplo. |
| `npm run db:generate` | (Opcional) genera migraciones desde el schema con drizzle-kit. |

---

## Anti-solapamiento garantizado en la base de datos

La pieza clave de la reserva está en `drizzle/0000_init.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- columna de rango generada a partir de inicio/fin (incluye inicio, excluye fin)
"rango" tstzrange GENERATED ALWAYS AS (tstzrange("inicio", "fin", '[)')) STORED

-- dos citas del MISMO profesional no pueden solaparse (ignora canceladas)
ALTER TABLE "citas" ADD CONSTRAINT "citas_sin_solapamiento"
  EXCLUDE USING gist ("profesional_id" WITH =, "rango" WITH &&)
  WHERE ("estado" <> 'cancelada');
```

Así, aunque dos reservas (web y WhatsApp) lleguen en el mismo instante, **Postgres
sólo deja insertar una**; la otra recibe un error `23P01` que la app traduce a
"ese hueco se acaba de ocupar". No depende de validación en la aplicación.

El mismo camino (`src/lib/reservas.ts`) lo usan la reserva web, el panel y el bot.

---

## Bot de WhatsApp con Claude

El webhook está en `src/app/api/whatsapp/webhook/route.ts`. El agente
(`src/lib/agente.ts`) usa `claude-opus-4-8` con **thinking adaptativo** y **tool use**.
Herramientas que ejecuta el backend contra Neon:

- `listar_servicios()`
- `consultar_disponibilidad(servicio, profesional?, fecha)`
- `reservar_cita(servicio, profesional, fecha_hora, nombre)`
- `cancelar_cita()` / `mover_cita(nueva_fecha_hora)`

El historial de conversación se guarda por número de teléfono en la tabla
`conversaciones`. Si el agente no puede resolver algo, lo indica al cliente para
intervención humana.

### Probar en el sandbox de Twilio para WhatsApp

1. En la consola de Twilio entra en **Messaging → Try it out → Send a WhatsApp message**.
2. Une tu móvil al sandbox enviando el código `join <palabra>` al número del sandbox
   (p.ej. `whatsapp:+14155238886`) por WhatsApp.
3. Expón tu servidor local con un túnel: `npx localtunnel --port 3000` o `ngrok http 3000`.
4. En **Sandbox settings**, pon en _"When a message comes in"_:
   `https://TU-TUNEL/api/whatsapp/webhook` (método **POST**).
5. Rellena en `.env`: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
   y `ANTHROPIC_API_KEY`.
6. Escribe por WhatsApp, p.ej. _"Hola, quiero corte y barba el sábado por la tarde"_.
   El bot propondrá huecos reales, confirmará y reservará.

### Pasar a producción (Meta WhatsApp Cloud API)

El webhook ya contempla ambos formatos:

- **Verificación**: el `GET` responde al `hub.challenge` de Meta usando
  `WHATSAPP_VERIFY_TOKEN`.
- **Mensajes entrantes**: el `POST` detecta JSON de Meta
  (`entry[].changes[].value.messages[]`) además del form-urlencoded de Twilio.

Para producir con Meta:
1. Crea una app en Meta for Developers con el producto **WhatsApp**.
2. Configura el webhook con tu URL y `WHATSAPP_VERIFY_TOKEN`; suscríbete a `messages`.
3. Sustituye el envío saliente de `src/lib/twilio.ts` por una llamada a la
   **Graph API** (`POST /{phone-number-id}/messages`) con tu `WHATSAPP_TOKEN`.
4. Verifica la firma `X-Hub-Signature-256` en el webhook.

---

## Desplegar en Vercel

1. Sube el repo a GitHub e impórtalo en Vercel (framework Next.js, autodetectado).
2. En **Settings → Environment Variables** añade todas las variables de la tabla.
   Usa la _pooled connection_ de Neon para `DATABASE_URL`.
3. Deploy. El `next build` debe pasar sin errores.
4. **Migración y seed** (una vez), desde tu máquina apuntando a la BD de producción:
   ```bash
   DATABASE_URL="...neon-prod..." npm run db:migrate
   DATABASE_URL="...neon-prod..." npm run db:seed
   ```
5. Configura el webhook de WhatsApp (Twilio o Meta) con tu dominio de Vercel:
   `https://tu-dominio.vercel.app/api/whatsapp/webhook`.

---

## Datos de ejemplo (seed)

**Profesionales:** Marco Ferreira (Barbero) y Lucía Hernández (Esteticista).

**Servicios:** corte caballero (13€), corte + barba (18€), corte estudiantes (12€),
corte niño (11€), afeitado a navaja + toalla caliente (9,50€), tinte de barba (12€),
lavado con mentol (3,50€), tinte/mechas + matiz (desde 50€), diseño de cejas (8€),
tratamiento facial (25€).

**Horario:** L-V 10:00–14:00 y 17:00–20:30 · S 10:00–14:00 · D cerrado.
