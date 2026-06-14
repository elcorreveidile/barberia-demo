# Guía de marca e imágenes — Filo Barber Studio

Documento de trabajo para **embellecer la web** con una identidad visual coherente.
Incluye: (1) el ADN de marca, (2) un diagnóstico de lo que hay hoy, (3) **todos los
prompts** para generar las imágenes (logo, hero, texturas, retratos, galería, iconos,
imagen social…) y (4) cómo integrarlas en el código.

> Marca **placeholder**: "Filo Barber Studio". Si la renombras, cambia el nombre en
> los prompts y en `src/lib/negocio.ts`.

---

## 0) ADN visual (pégalo como contexto en cualquier generador)

- **Concepto:** barbería y estética masculina **clásico‑moderna** en Granada. Sobria,
  elegante, con oficio: navaja, toalla caliente, madera, acero cepillado, cuero.
- **Paleta:**
  - Fondo casi negro: `#121212` / `#1C1917`
  - Acento cobre/dorado: `#B68D40` (claro `#D9B26A`, oscuro/cobre `#C2410C`)
  - Crema/hueso (textos y luces): `#F5F0E6`
- **Tipografías:** titulares serif **Fraunces**; cuerpo **Inter**. (No incrustar texto
  en las fotos.)
- **Iluminación/mood:** cálida, cinematográfica, contraste medio‑alto, grano de película
  sutil, reflejos cobre. Premium, editorial, masculino, atemporal.
- **Evitar:** look "stock" genérico, colores fríos/azulados, saturación excesiva,
  HDR plano, marcas/logos ajenos, texto incrustado, gente mirando a cámara con sonrisa
  publicitaria.

**Bloque de estilo reutilizable (EN)** — añádelo al final de cada prompt de *foto*:

```
dark moody barbershop aesthetic, near-black charcoal background (#121212), warm
copper/gold accents (#B68D40), cream highlights (#F5F0E6), cinematic warm side
lighting, soft shadows, subtle film grain, textures of walnut wood, brushed steel
and leather, classic-modern, masculine, premium editorial photography, 50mm, shallow
depth of field --style raw
```

Negativos habituales: `--no text, watermark, logo, lettering, extra fingers, deformed hands, cluttered background, blue tint, oversaturated`

---

## 1) Diagnóstico rápido (qué mejorar)

| Zona | Estado actual | Mejora propuesta |
|---|---|---|
| Logo / emblema | SVG genérico (círculo + líneas) | Emblema/escudo propio + logotipo (varias versiones) |
| Favicon / app icon | No hay (usa el de Next por defecto) | Icono propio (32/180/512) |
| Hero (home) | Foto de Unsplash genérica | Foto branded del local (oscura, cobre) |
| Fondos de sección | Solo degradados + ruido CSS | Texturas sutiles (madera, líneas art‑déco) |
| Equipo | 2 fotos Unsplash sueltas | 2 retratos coherentes (barbero + esteticista) |
| Galería | 8 fotos Unsplash variadas | Set cohesionado (cortes, barba, navaja, detalle) |
| Servicios | Solo texto | Iconos de línea cobre por servicio/categoría |
| Compartir en redes | Sin imagen OG | Imagen social 1200×630 |
| Detalle/atmósfera | — | Bodegones de herramientas (navaja, tijeras) |

---

## 2) Catálogo de imágenes a generar

Para cada una: **archivo sugerido**, **uso**, **tamaño/formato**, **herramienta**
recomendada y el **prompt** (en inglés, que rinde mejor en los generadores).

> Herramientas: **Midjourney / Flux** para fotos; **Ideogram / Adobe Firefly** para
> logo y cualquier cosa con texto; **Recraft / Ideogram** para iconos vectoriales.
> Recuerda añadir el *Bloque de estilo* a los prompts de foto.

---

### 2.1 Emblema / escudo (logo principal)
- **Archivo:** `public/marca/emblema.svg` (o `.png` con fondo transparente)
- **Uso:** Navbar, footer, favicon base, papelería.
- **Tamaño:** vectorial; export 1024×1024 PNG transparente.
- **Herramienta:** Ideogram / Firefly (manejan texto y formas limpias).

```
A classic barbershop crest emblem for "FILO BARBER STUDIO", vintage-modern monoline
badge: a straight razor crossed with a comb inside a circular seal, small banner
ribbon, the word "FILO" as the focal lettering and "BARBER STUDIO · GRANADA" around
the ring. Single copper/gold color (#B68D40) on transparent background, flat vector,
clean geometry, balanced, premium, no gradients, no photo. --no background, clutter
```
Variantes a pedir: (a) **solo icono** (navaja+peine sin texto), (b) **versión en crema
`#F5F0E6`** para fondos oscuros, (c) **versión en negro** para fondos claros.

---

### 2.2 Logotipo horizontal (lockup)
- **Archivo:** `public/marca/logo-horizontal.svg`
- **Uso:** cabecera en pantallas anchas, emails, OG.
- **Herramienta:** Ideogram / Firefly.

```
Horizontal logo lockup "FILO BARBER STUDIO": elegant serif wordmark (Fraunces-like
high-contrast serif) in cream #F5F0E6, with a small copper #B68D40 razor-and-comb
icon to the left, and the tagline "Barbería & estética · Granada" in small letter-
spaced sans below. Transparent background, vector, minimal, refined. --no photo, clutter
```

---

### 2.3 Favicon / app icon
- **Archivos:** `src/app/icon.png` (512×512), `src/app/apple-icon.png` (180×180)
- **Uso:** pestaña del navegador y atajo en móvil. (Next.js los detecta solos.)
- **Herramienta:** Ideogram / Firefly o recortar el emblema.

```
App icon: the copper #B68D40 razor-and-comb monogram "F" mark, centered on a near-black
#121212 rounded-square background, simple, high contrast, legible at small sizes,
flat vector. --no text, clutter
```

---

### 2.4 Hero principal (home)
- **Archivo:** `public/hero/hero.jpg`
- **Uso:** fondo del hero de la home (hoy es una foto de Unsplash).
- **Tamaño:** 1920×1280 (horizontal), pensada para oscurecerse con degradado.
- **Herramienta:** Midjourney / Flux. `--ar 3:2`

```
Interior of a premium classic-modern barbershop at dusk: vintage barber chair in
brushed steel and oxblood leather, warm copper Edison lighting, walnut wood paneling,
a large framed mirror, subtle steam from a hot towel, deep shadows, nobody facing the
camera. Cinematic, moody, editorial. [BLOQUE DE ESTILO] --ar 3:2 --no text, people staring, blue tint
```

---

### 2.5 Textura de madera (fondo de secciones)
- **Archivo:** `public/texturas/madera.jpg` (o `.webp`)
- **Uso:** fondo sutil de secciones (overlay con opacidad baja sobre el negro).
- **Tamaño:** 1600×1000, **tileable** si es posible.
- **Herramienta:** Midjourney / Flux. `--ar 16:10`

```
Dark walnut wood texture, fine straight grain, very low contrast, almost black with
warm brown undertones, soft even lighting, seamless, photographic, premium. Subtle,
not busy — meant to sit behind text. --ar 16:10 --no text, knots, bright spots
```

---

### 2.6 Patrón art‑déco de líneas (acento)
- **Archivo:** `public/texturas/patron-deco.svg`
- **Uso:** separadores, fondo del footer, cabeceras de sección.
- **Herramienta:** Recraft / Ideogram (vector).

```
Seamless art-deco line pattern inspired by classic barbershop motifs (thin chevrons,
fine concentric arcs, razor silhouettes), single copper #B68D40 lines on transparent,
very subtle, low density, elegant, vector, tileable. --no text, fill, noise
```

---

### 2.7 Retrato — Barbero (Marco)
- **Archivo:** `public/equipo/barbero.jpg`
- **Uso:** página **Equipo** (sustituye la foto de Unsplash).
- **Tamaño:** 1200×1500 (vertical 4:5).
- **Herramienta:** Midjourney / Flux. `--ar 4:5`

```
Editorial portrait of a Spanish male barber in his late 30s, short textured haircut,
well-groomed dark beard, wearing a charcoal apron over a rolled-sleeve shirt, holding
a straight razor, standing in a dark barbershop, three-quarter view, looking slightly
off camera, confident and calm. [BLOQUE DE ESTILO] --ar 4:5 --no text, logo, extra fingers
```

---

### 2.8 Retrato — Esteticista (Lucía)
- **Archivo:** `public/equipo/esteticista.jpg`
- **Uso:** página **Equipo**.
- **Tamaño:** 1200×1500 (4:5).
- **Herramienta:** Midjourney / Flux. `--ar 4:5`

```
Editorial portrait of a Spanish female esthetician in her early 30s, hair tied back,
neat minimal makeup, wearing a dark elegant work tunic, in the same dark barbershop /
beauty studio setting, three-quarter view, professional and warm, soft copper light.
Consistent style with the barber portrait. [BLOQUE DE ESTILO] --ar 4:5 --no text, logo
```

> Para que los dos retratos "casen", genera ambos con el mismo *seed*/sesión y el
> mismo fondo e iluminación.

---

### 2.9 Galería de trabajos (set cohesionado)
- **Archivos:** `public/galeria/01.jpg` … `08.jpg`
- **Uso:** rejilla de la página **Galería**.
- **Tamaños:** mezcla 1000×1250 (4:5) y 1000×1000 (1:1) para la rejilla tipo *masonry*.
- **Herramienta:** Midjourney / Flux (genera en la misma sesión para coherencia).

Prompts (uno por foto):

```
1. Close-up of a fresh men's fade haircut, clipper detail, sharp lines, nape, dark studio. [ESTILO] --ar 4:5
2. Hot-towel straight-razor shave in progress, steam, copper light, hands and razor. [ESTILO] --ar 1:1
3. Beard trimming with scissors and comb, profile of a groomed beard. [ESTILO] --ar 4:5
4. Top-down flatlay of barber tools on dark walnut: straight razor, scissors, comb, brush. [ESTILO] --ar 1:1
5. Finished classic side-part haircut with product shine, three-quarter back view. [ESTILO] --ar 4:5
6. Beard line-up detail with a straight razor, crisp cheek line, macro. [ESTILO] --ar 1:1
7. Barber chair and mirror reflection, atmospheric wide detail, nobody posing. [ESTILO] --ar 4:5
8. Eyebrow grooming / esthetics detail close-up, precise and clean, soft light. [ESTILO] --ar 1:1
```
(Sustituye `[ESTILO]` por el Bloque de estilo.)

---

### 2.10 Iconos de servicios / categorías (línea cobre)
- **Archivos:** `public/iconos/corte.svg`, `barba.svg`, `navaja.svg`, `color.svg`,
  `cejas.svg`, `facial.svg`, `lavado.svg`, `nino.svg`
- **Uso:** junto a cada servicio o como categorías en `/servicios` y la home.
- **Herramienta:** Recraft / Ideogram (vector, set coherente en una tirada).

```
A set of 8 minimalist line icons for a barbershop, single copper #B68D40 stroke,
consistent 2px weight, rounded caps, on transparent background, flat vector, simple:
(1) scissors haircut, (2) beard, (3) straight razor with towel, (4) hair color brush
& bowl, (5) eyebrow, (6) facial/face with sparkle, (7) shampoo/mentol wash drop,
(8) child haircut. Cohesive grid, same style. --no text, fill, shadow
```

---

### 2.11 Imagen social / Open Graph
- **Archivo:** `src/app/opengraph-image.png` (Next la usa automáticamente)
- **Uso:** miniatura al compartir el enlace en WhatsApp/redes.
- **Tamaño:** **1200×630**.
- **Herramienta:** Ideogram / Firefly (lleva texto).

```
Social share banner 1200x630 for "FILO BARBER STUDIO": near-black #121212 background
with subtle walnut texture, copper razor-and-comb emblem, large cream serif headline
"Barbería & estética masculina" and small "Granada · Reserva online", elegant, premium,
balanced composition, lots of negative space. --ar 1.91:1 --no clutter
```

---

### 2.12 Bodegón de atmósfera (acentos de sección)
- **Archivos:** `public/detalle/navaja.jpg`, `public/detalle/herramientas.jpg`
- **Uso:** bandas/acentos entre secciones (home, contacto).
- **Tamaño:** 1600×900 (16:9).
- **Herramienta:** Midjourney / Flux. `--ar 16:9`

```
Still life of a vintage straight razor and a badger shaving brush resting on dark
walnut with a folded warm towel, single copper light from the side, deep shadows,
macro, premium product photography. [BLOQUE DE ESTILO] --ar 16:9 --no text, hands
```

---

## 3) Mejoras de estilo que NO necesitan imágenes (CSS/UX)

Pequeños retoques que suman mucho (te los puedo implementar cuando quieras):

- **Texturas reales** sobre el negro: usar `public/texturas/madera.jpg` con
  `opacity` baja + `mix-blend-mode: overlay` en secciones clave.
- **Iconos cobre** en las tarjetas de la home y en la lista de servicios (sección 2.10).
- **Microinteracciones:** hover con leve `scale` + sombra cobre en tarjetas y botones
  (ya hay algo; reforzar).
- **Divisores** con el patrón art‑déco (2.6) en vez de líneas planas.
- **Tipografía:** subir el contraste de los titulares (peso 700/900 de Fraunces) y dar
  más `letter-spacing` a las "etiquetas".
- **Hero:** añadir un degradado cobre muy sutil arriba + grano para dar profundidad.
- **Favicon y OG** (2.3 y 2.11): hoy faltan; dan sensación de marca cuidada.
- **Foto del local real** en Contacto (sobre el mapa) cuando la tengas.

---

## 4) Dónde se colocan en el código

| Imagen | Archivo en el repo | Dónde se usa |
|---|---|---|
| Emblema | `public/marca/emblema.svg` | `src/components/Navbar.tsx`, `Footer.tsx` |
| Favicon / app icon | `src/app/icon.png`, `src/app/apple-icon.png` | Automático (Next.js) |
| OG | `src/app/opengraph-image.png` | Automático (Next.js) |
| Hero | `public/hero/hero.jpg` | `src/app/(public)/page.tsx` (hero) |
| Texturas | `public/texturas/*` | `globals.css` (clases de fondo) |
| Retratos | `public/equipo/*.jpg` | seed / tabla `profesionales` (`foto_url`) o página Equipo |
| Galería | `public/galeria/0X.jpg` | `src/app/(public)/galeria/page.tsx` (array `fotos`) |
| Iconos | `public/iconos/*.svg` | home y `/servicios` |
| Bodegones | `public/detalle/*.jpg` | bandas de acento en home/contacto |

> Nota técnica: si usas imágenes **locales** en `/public`, recuerda que `next.config.ts`
> solo restringe dominios **remotos**; las locales no necesitan configuración. Para los
> retratos del equipo puedes (a) poner las URLs en la columna `foto_url` de
> `profesionales`, o (b) cambiar la página de Equipo para usar archivos locales.

---

## 5) Orden recomendado (de mayor a menor impacto)

1. **Emblema + favicon + OG** (identidad inmediata).
2. **Hero** propio.
3. **Retratos** del equipo coherentes.
4. **Galería** cohesionada.
5. **Iconos** de servicios.
6. **Texturas y bodegones** (acabado fino).

Cuando tengas las imágenes generadas, dímelo y las **integro en el código** (rutas,
`next/image`, clases de fondo, seed de profesionales, etc.) en un PR.
