# Roadmap V2.0 — Filo Barber Studio

V1.0 cerrada: web pública, reserva online con anti‑solapamiento, panel de gestión,
área de cliente y **bot de WhatsApp con IA**. Este documento recoge las funcionalidades
candidatas para la **V2.0**, priorizadas, con una propuesta de orden de construcción.

## Cómo leer las prioridades

- **Impacto**: cuánto mueve la aguja del negocio (menos *no-shows*, más ingresos, fidelización).
- **Esfuerzo**: coste de desarrollo aproximado.
- ⭐ = recomendada para arrancar.

---

## 1) Reservas y agenda

| Funcionalidad | Impacto | Esfuerzo | Notas |
|---|---|---|---|
| ⭐ Recordatorios automáticos (WhatsApp/email) 24 h y 2 h antes, con confirmación "Sí/No" | Muy alto | Medio | Lo que más reduce *no-shows*. Requiere un *cron* (Vercel Cron) + plantillas. |
| ⭐ Horario por profesional (vacaciones, días libres, descansos) + bloqueos en el panel | Alto | Medio | Hoy el horario es global; conviene por persona. |
| Lista de espera ("avísame si se libera") | Medio | Medio | Notifica al liberarse un hueco. |
| Servicios combinados en una cita (corte + barba + cejas) | Alto | Medio | Suma duraciones; afecta al motor de disponibilidad. |
| Festivos locales (Granada) automáticos | Medio | Bajo | Calendario de festivos. |
| Citas recurrentes (cliente fijo cada X semanas) | Medio | Medio | |

## 2) Pagos (Stripe)

| Funcionalidad | Impacto | Esfuerzo | Notas |
|---|---|---|---|
| ⭐ Seña / pago anticipado al reservar | Muy alto | Medio | Frena cancelaciones de última hora. |
| Bonos / packs (5 cortes) y tarjetas regalo | Alto | Medio‑alto | Nueva entidad "saldo/bono". |
| Propinas | Bajo | Bajo | |

## 3) Clientes y fidelización

| Funcionalidad | Impacto | Esfuerzo | Notas |
|---|---|---|---|
| ⭐ Ficha de cliente (historial + notas: preferencias, alergias) | Alto | Medio | Tabla `clientes` enlazada por teléfono/email. |
| Programa de fidelidad (sello digital, 10º gratis) | Alto | Medio | Sobre la ficha de cliente. |
| Felicitación de cumpleaños con descuento | Medio | Bajo | |
| Reseñas tras la cita (enlace a Google Reviews) | Alto | Bajo | El bot lo pide automáticamente. |

## 4) Panel del negocio

| Funcionalidad | Impacto | Esfuerzo | Notas |
|---|---|---|---|
| ⭐ Estadísticas (ocupación, ingresos por profesional/servicio, horas punta) | Alto | Medio | |
| Calendario visual semana/día (drag & drop) | Alto | Alto | Mejora gran la gestión diaria. |
| Roles (cada barbero ve su agenda) | Medio | Medio | |
| Multi‑sede | Medio | Alto | Solo si hay expansión. |
| Sincronización con Google Calendar | Medio | Medio | |

## 5) Bot de WhatsApp / IA

| Funcionalidad | Impacto | Esfuerzo | Notas |
|---|---|---|---|
| Reactivación inteligente ("hace 6 semanas que no vienes…") | Alto | Medio | Combina con recordatorios/cron. |
| FAQ (precios, ubicación, parking) + derivación a humano | Medio | Bajo | |
| Cola de "pendiente de intervención humana" en el panel | Medio | Bajo | El bot ya marca; falta la bandeja. |
| Notas de voz (audio → texto) | Medio | Medio | |
| Multi‑idioma (inglés para turistas) | Medio | Bajo | |

## 6) Web y marketing

| Funcionalidad | Impacto | Esfuerzo | Notas |
|---|---|---|---|
| Multidioma ES/EN | Medio‑alto | Medio | Granada es muy turística. |
| Blog / SEO + feed de Instagram | Medio | Medio | Captación orgánica. |
| PWA instalable + notificaciones push | Medio | Medio | |
| Tienda de productos (ceras, aceites) | Medio | Alto | E‑commerce. |

## 7) Calidad / técnico

| Funcionalidad | Impacto | Esfuerzo | Notas |
|---|---|---|---|
| CI (build + checks en cada push) | Alto (interno) | Bajo | Evita romper producción. |
| Verificación de firma del webhook + rate limiting | Alto (seguridad) | Bajo | Twilio/Meta. |
| Tests, accesibilidad y monitorización | Medio | Medio | |

---

## Plan por fases (propuesta)

**Fase 1 — "Menos huecos vacíos, menos plantones" (el mayor ROI)**
1. Recordatorios automáticos + confirmación por WhatsApp (anti *no-show*).
2. Seña / pago anticipado con Stripe.
3. Horario por profesional + bloqueos en el panel.

**Fase 2 — "Conocer y fidelizar al cliente"**
4. Ficha de cliente (historial + notas).
5. Programa de fidelidad + reseñas automáticas.
6. Estadísticas en el panel.

**Fase 3 — "Crecer"**
7. Multidioma ES/EN + SEO/Instagram.
8. Calendario visual drag & drop.
9. Tienda de productos / bonos / multi‑sede.

> Transversal desde el día 1 de V2: **CI** y **verificación de firma del webhook** (poco esfuerzo, mucha tranquilidad).

## Dependencias y notas de arquitectura

- **Cron**: recordatorios y reactivación necesitan tareas programadas → **Vercel Cron**.
- **Ficha de cliente**: nueva tabla `clientes` (clave por teléfono/email) de la que cuelgan fidelidad, historial y notas; varias features de Fase 2 dependen de ella.
- **Pagos**: Stripe (checkout/intents) + estados de pago en la tabla `citas`.
- **Disponibilidad**: los servicios combinados y el horario por profesional tocan el motor de huecos; conviene hacerlos juntos.
