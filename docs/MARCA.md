# PACK DE IMÁGENES — "Filo Barber Studio" (Barbería y estética masculina · Granada)

Inventario completo de imágenes con su prompt de generación. Los prompts están en
inglés (los generadores rinden mejor) con etiqueta en español.

> Marca **placeholder** "Filo Barber Studio": si la renombras, cambia el nombre en los
> prompts y en `src/lib/negocio.ts`.

## Paleta y tipografías (referencia rápida)

- Fondo casi negro: `#121212` / `#1C1917` · Acento cobre/dorado: `#B68D40` (claro `#D9B26A`)
- Crema/hueso: `#F5F0E6` · Titulares serif **Fraunces** · Cuerpo **Inter**

## Qué NO hay que generar (ya es código o mejor como SVG)

- **Emblema / logotipo.** Hoy hay un emblema SVG (provisional) en `Navbar`/`Footer`.
  Recomendado **mantenerlo en SVG** (nitidez perfecta, color por CSS, escala sin pérdida).
  Si quieres rehacerlo, hazlo en **vector** (Ideogram/Firefly) y guárdalo como SVG; del
  isotipo se exportan favicon y app icon (512/192/180/32/16 px).
- **Patrón art‑déco / líneas** (separadores, fondo del footer) → mejor **SVG repetible**
  generado en build. Especificación: líneas finas cobre `#B68D40` al 20–35 % sobre negro,
  chevrons y arcos finos, baja densidad, retícula elegante.
- **Iconos de servicios** (corte, barba, navaja, color, cejas, facial, lavado, niño) →
  **set SVG** de línea, trazo 2 px redondeado, color cobre, mismo estilo (no fotos).

## Estilo maestro (pegar al inicio de cada prompt fotográfico)

> Editorial photograph, warm cinematic side lighting, near-black charcoal interior
> (#121212 / #1C1917), copper and gold accents (#B68D40), cream highlights (#F5F0E6),
> textures of walnut wood, brushed steel and leather, classic-modern masculine barbershop
> in Granada, calm and confident atmosphere, authentic candid moment (not a posed studio
> shot), shallow depth of field (50mm), subtle film grain, photorealistic. — **Negative:**
> cartoon, illustration, studio flash, harsh blue tint, oversaturated colors, watermark,
> text, embedded logos, deformed hands, extra fingers, cluttered background, cheap stock look.

## Web — heros y OG

|#|Imagen|Formato|Prompt específico (añadir al estilo maestro)|
|-|------|-------|--------------------------------------------|
|1|**Hero Home**|1920×1080 (recorte seguro 4:5 móvil)|Wide interior of a premium classic-modern barbershop at dusk: a vintage barber chair in brushed steel and oxblood leather, a large framed mirror, warm copper Edison bulbs, faint steam from a hot towel, nobody facing the camera. Generous negative space on the left for headline text.|
|2|**Hero Equipo/Servicios**|1920×900|Close-up of a barber's hands using a straight razor with a hot towel, copper rim light, deep shadows, focused craft, dark walnut surfaces blurred behind. Negative space on one side.|
|3|**Open Graph**|1200×630|A sharply groomed man (beard and classic haircut) seen three-quarter in a dark barbershop, confident calm expression, copper light, centered composition leaving the lower third clean for a logo overlay.|

## Web — equipo (retratos uniformes 1200×1500, 4:5)

|#|Persona|Prompt específico|
|-|-------|-----------------|
|4|**Marco — Barbero**|Editorial portrait of a Spanish male barber in his late 30s, short textured haircut, well-groomed dark beard, charcoal apron over a rolled-sleeve shirt, holding a straight razor, three-quarter view, looking slightly off camera, calm and confident.|
|5|**Lucía — Esteticista**|Editorial portrait of a Spanish female esthetician in her early 30s, hair tied back, minimal makeup, dark elegant work tunic, same dark studio and copper lighting as the barber portrait, three-quarter view, warm and professional.|

> Genera **ambos retratos en la misma sesión / mismo seed** y fondo para que "casen".

## Web — galería (set cohesionado; mezcla 1000×1250 4:5 y 1000×1000 1:1)

|#|Toma|Formato|Prompt específico|
|-|----|-------|-----------------|
|6|**Fade**|4:5|Close-up of a fresh men's skin fade haircut, clipper detail, crisp lines at the nape, dark studio.|
|7|**Afeitado a navaja**|1:1|Hot-towel straight-razor shave in progress, steam, copper light, hands and razor, serene.|
|8|**Barba**|4:5|Beard trimming with scissors and comb, profile of a perfectly groomed beard.|
|9|**Herramientas**|1:1|Top-down flatlay of barber tools on dark walnut: straight razor, scissors, comb, brush.|
|10|**Corte clásico**|4:5|Finished classic side-part haircut with subtle product shine, three-quarter back view.|
|11|**Perfilado**|1:1|Beard line-up detail with a straight razor, crisp cheek line, macro.|
|12|**Ambiente**|4:5|Barber chair and mirror reflection, atmospheric wide detail, nobody posing.|
|13|**Estética**|1:1|Eyebrow grooming / facial detail close-up, precise and clean, soft copper light.|

## Web — bodegones de atmósfera (acentos, 16:9, 1600×900)

|#|Imagen|Prompt específico|
|-|------|-----------------|
|14|**Navaja & brocha**|Still life of a vintage straight razor and a badger shaving brush on dark walnut with a folded warm towel, single copper light from the side, deep shadows, macro, premium product photography.|
|15|**Útiles**|Still life of clippers, scissors and comb arranged on brushed steel, copper reflections, top-down, minimal and elegant.|

## Web — texturas

|#|Imagen|Formato|Prompt específico|
|-|------|-------|-----------------|
|16|**Madera nogal**|1600×1000 (tileable)|Dark walnut wood texture, fine straight grain, very low contrast, almost black with warm brown undertones, soft even lighting, seamless, subtle (meant to sit behind text). — Negative: knots, bright spots, text.|

## Reglas de coherencia del pack

1. **Tono sobrio y masculino.** Si un resultado parece "spa de lujo", stock sonriente o
   publicitario, se descarta: contradice la marca.
2. **Luz cálida cobre**; la paleta debe caer sola en negro/cobre/crema. Si el generador
   satura o tira a azul, corrige en postproducción hacia los hexadecimales de marca.
3. **Texturas reales** (madera, acero cepillado, cuero). Nada frío ni azulado.
4. **Sin texto ni logos incrustados** en ninguna foto (el logo va aparte, en SVG).
5. Genera **3–4 variantes por imagen** y elige; **guarda los seeds** de las elegidas para
   regenerar coherente en otro formato. Los dos retratos del equipo, mismo seed/fondo.
6. En la web, todas pasan por `next/image` con los recortes definidos arriba.

## Checklist de exportación

- [ ] Heros en **WebP/AVIF**, ≤ 200 KB el principal.
- [ ] **OG** en JPG/PNG **1200×630 exactos** (las redes no recortan bien otros tamaños).
- [ ] **Favicon**: 32/16 px ICO + 180 px apple‑touch + 512/192 px manifest, desde el isotipo.
- [ ] **Retratos** del equipo a 1200×1500 (4:5).
- [ ] **Galería**: mezcla 1000×1250 (4:5) y 1000×1000 (1:1).
- [ ] **Avatares** Instagram/WhatsApp: isotipo cobre sobre fondo negro, 1080×1080, con
  margen de seguridad circular.

## Dónde se coloca cada imagen en el código

|Imagen|Archivo en el repo|Dónde se usa|
|------|------------------|------------|
|Emblema / isotipo|`public/marca/emblema.svg`|`src/components/Navbar.tsx`, `Footer.tsx`|
|Favicon / app icon|`src/app/icon.png`, `src/app/apple-icon.png`|Automático (Next.js)|
|Open Graph|`src/app/opengraph-image.png`|Automático (Next.js)|
|Hero Home|`public/hero/hero.jpg`|`src/app/(public)/page.tsx`|
|Hero Equipo/Servicios|`public/hero/equipo.jpg`|cabeceras de sección|
|Retratos|`public/equipo/barbero.jpg`, `esteticista.jpg`|tabla `profesionales.foto_url` o página Equipo|
|Galería|`public/galeria/06.jpg` … `13.jpg`|`src/app/(public)/galeria/page.tsx` (array `fotos`)|
|Bodegones|`public/detalle/*.jpg`|bandas de acento en home/contacto|
|Texturas|`public/texturas/madera.jpg`|`globals.css` (clases de fondo)|
|Iconos servicios|`public/iconos/*.svg`|home y `/servicios`|

> Las imágenes en `/public` son locales y no necesitan configuración de dominios
> (`next.config.ts` solo restringe imágenes **remotas**). Cuando las tengas, dímelo y las
> integro en el código (rutas, `next/image`, favicon/OG, fondos y seed del equipo).

## Orden recomendado (mayor a menor impacto)

1. Emblema (SVG) + favicon + OG.  2. Hero Home.  3. Retratos del equipo.
4. Galería.  5. Iconos de servicios (SVG).  6. Texturas y bodegones.
