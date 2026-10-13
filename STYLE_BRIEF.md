# Medad Style Lab: STYLE_BRIEF (single source of truth)

> Every phase and every subagent reads this file before working.
> Part A holds the facts discovered in Phase 0. Part B is the original brief, unchanged.
> Status: **Phase 1.** Phase 0 approved.

---

# Part A: Discovered facts (Phase 0)

## A.1 What Medad is (confirmed)

Medad (مداد, "ink") is a tech studio that designs and builds websites, custom systems and
platforms for organizations, plus live interactive experiences (competitions and games for events).
Its work covers education, Quran circles, clubs and training programs. The landing page presents
**the studio**. The older "program management suite" (مداد مهام، مداد تحضير) is not presented.

**Confidential, never on the page:** partner names, contracts, prices, percentages, the internal
framework, tools, client names. The page speaks about what Medad does, not how the business is run.

## A.2 Palette (extracted from `medad-logo-green-1080.png`)

The logo is a teal wordmark on an **opaque black square** (no transparency).
Pixel clustering: 95.3% `#000000` background, 4.2% `#1A8A7D` (HSL 173.6°, 70%, 31%), the rest is antialiasing.
Logo hue = **173.6°**. Every green below stays within 172.5° to 175.4°.

| Token | Hex | Role | Contrast on paper | Contrast on ink |
|---|---|---|---|---|
| `--green-50`  | `#F1F9F8` | palest tint, washes | 1.03 | 17.1 |
| `--green-100` | `#DEF2F0` | pastel surfaces | 1.06 | 15.7 |
| `--green-200` | `#BCE6E1` | soft fills | 1.23 | 13.5 |
| `--green-300` | `#85D6CD` | light accents, glows | 1.53 | 10.9 |
| `--green-400` | `#36C9BA` | **neon** (text/glow on dark) | 1.87 | 8.90 |
| `--green-500` | `#1A8A7D` | **logo green** | 3.84 | 4.33 |
| `--green-600` | `#126E64` | green text / buttons on light | 5.55 | 2.99 |
| `--green-700` | `#0D544D` | deep green | 7.99 | 2.08 |
| `--green-800` | `#083A35` | bottle green | 11.5 | 1.45 |
| `--green-900` | `#042421` | deepest green surface | 14.9 | 1.11 |
| `--green-950` | `#051211` | green-black | 17.4 | 1.04 |
| `--paper`     | `#F6F4EF` | **proposed off-white** (warm, ink on paper) | | 16.6 |
| `--gray`      | `#E7E6E1` | soft gray | | 14.6 |
| `--ink`       | `#0C1715` | near-black, tinted to logo hue | 16.6 | |
| `--ink-muted` | `#4A5552` | secondary text on light | 7.04 | |

Contrast rules that follow from these numbers:
- `--green-500` on paper is 3.84: **large text (24px+, or 19px+ bold) and graphics only**. Body text or small button labels in green use `--green-600` or darker.
- Paper text on a `--green-500` button: 3.84, so button labels must be 19px+ bold, or the button uses `--green-600` (5.55).
- On dark backgrounds the readable neon is `--green-400`. `--green-500` on ink (4.33) is for large text and glows only.
- Silver/chrome = neutral grays (`--paper`, `--gray`, `--ink-muted`, plus white/black). No gold, even though the internal framework lists "green and gold". This brief forbids gold.

## A.3 Fonts

Verified with fontTools. Both families are by Thmanyah, `fsType 0` (no embedding restrictions).

| Folder | Family (name table) | Role | Files (weight) |
|---|---|---|---|
| `Portal/Font`  | **thmanyah sans** | body / UI | Light 300, Regular 400, Medium 500, Bold 700, Black 900 (`thmanyahsans-*.otf`) |
| `Portal/titel` | **thmanyah serif display** | display / headlines | Light 300, Regular 400, Medium 500, Bold 700, Black 900 (`thmanyahserifdisplay-*.otf`) |

Roles match the brief. Only OTF was provided, so Phase 1 converts them to woff2 (fontTools + brotli, both installed).
CSS family names: `"Thmanyah Sans"` and `"Thmanyah Serif Display"`.

## A.4 Kashida verification

- Both families contain `uni0640` (tatweel) **and designed kashida ligatures** reached through GSUB:
  `مـداد` shapes to `meemAr.init_kashida`, `مــداد` to `meemAr.init_kashida_kashida`, `حبـر` to `behAr.medi_kashida`,
  `نكـتب` to `kafAr.medi_kashida`. The curve is drawn by the type designer, not a stretched flat bar.
- Rendered with HarfBuzz (`hb-view`) in serif display Bold/Light and sans Bold: the curve renders correctly.
- Max two tatweels applies to every word EXCEPT the brand word, which always uses five (see A.5).

## A.5 THE BRAND WORD RULE (overrides the kashida rules in Part B for this one word)

Set by the owner. Wherever the word Medad appears (logo, nav, headline, body text, footer, page title,
button), it is written **«مـــــداد» = م + five tatweels + داد**, in **Thmanyah Serif Display, weight 900**,
`white-space: nowrap`, `letter-spacing: 0`. The font turns this into the single ligature
`meemAr.init_kashida×5`, which is **pixel-identical to the logo** (verified by side-by-side render, and the
width/height ratio is 3.23 vs the logo's 3.22). It looks long in a code editor; in the brand font it is the logo.

- In HTML always use the class `.brand-word` from `tokens.css` (it forces the family, weight and spacing).
- In copy, write the token `{مداد}`. `MEDAD.html(str)` turns it into
  `<span class="brand-word" role="img" aria-label="مداد">مـــــداد</span>`, and `MEDAD.text(str)` into plain «مـــــداد» (for `<title>`/aria).
- Never apply letter-spacing, text-transform, or per-letter splitting to it (spacing breaks the joining and the ligature).
  Styles that animate letters must treat the brand word as ONE unit.
- Effects are allowed on the whole word (color, gradient fill, outline, glow, filters, pixelation of a layer).
- Where Part B shows the word as `مــداد` (e.g. style 16 Luxury Typography), use the brand word «مـــــداد» instead.
- This word does not count toward the "one or two kashida words per page" limit. Every OTHER word still follows
  Part B exactly: max two tatweels, display text only, one optional accent word per page.

## A.6 Copy

Lives in `shared/content.js` (`window.MEDAD`). Pages never hardcode copy.
Optional kashida accent words are separate fields (`*Kashida`), one tatweel each, after a connecting letter.

## A.7 Logo files (`shared/logo/`)

The source PNG is green on opaque black. Transparent knockouts were generated from it (alpha from the green
channel, cropped, 808×267), letterforms untouched:
`medad-mark-green.png` (#1A8A7D), `medad-mark-neon.png` (#36C9BA), `medad-mark-deep.png` (#083A35),
`medad-mark-paper.png`, `medad-mark-ink.png`, `medad-mark-white.png`, `medad-mark-pixel.png` (64×21, 3-tone green,
render with `image-rendering: pixelated`), and `medad-logo-original.png` (black square, as supplied).
Because the brand word in the display font is the logo's letterform, styles may also render the logo as live
`.brand-word` text when they need gradients, chrome, neon or animation.

## A.8 Technical constraints from file://

Pages open by double click, so: no `fetch()`, no ES module imports of local files, no CSS `mask-image` or
`canvas.getImageData` on local images (both blocked by file:// origin rules). Use `<script src>`, inline SVG, CSS
and canvas drawing. Paths are relative: a style page uses `../../shared/...`.
Each style page loads, in order: `../../shared/tokens.css`, `../../shared/switcher.css`, its `style.css`;
then `../../shared/content.js`, `../../shared/styles-list.js`, `../../shared/switcher.js`, its `script.js`.

## A.9 How every style page is built (read before building a style)

- Folder: `styles/NN-name/` with `index.html`, `style.css`, `script.js` and any local assets. Write nothing elsewhere.
- Reference for quality and structure: `styles/01-claymorphism/`. Copy its plumbing (head, script order, `MEDAD.fill()`,
  `data-copy` attributes, mailto wiring, `document.title = MEDAD.text(MEDAD.meta.title) + " · <Style>"`), never its look.
- Copy: only from `window.MEDAD` via `data-copy="path"` or `MEDAD.html()`. Arrays: `pillars.0.title`.
  Use at most one `*Kashida` field per page. The footer email is `MEDAD.footer.email` (link it with `mailto:`).
- Colors: only `var(--token)` from `tokens.css`, or hex values with the same hue (172° to 176°) for clay or chrome shading.
  Gray, white and black are allowed for chrome or silver. Nothing else.
- Every page must cover: hero (logo or brand word, `hero.headline`, `hero.line`, `hero.cta`), about (`about.title`, `about.text`),
  three pillars, closing band (`closing.headline` or `closing.headlineKashida`, `closing.cta`), and footer (logo, `footer.line`, email, `footer.copyright`).
- Must pass: no horizontal scroll at 375, 768 and 1440; `prefers-reduced-motion` turns motion into fades; AA contrast;
  no console errors under file://; the shared navigator stays visible (do not cover the bottom center with fixed UI, and keep z-index below 2147483000).
- **Arabic dot hazard (learned in Phase 2):** small dark dots, particles, beads, sparkles or bullet shapes must never
  sit over or right next to Arabic text. They read as letter dots (a bead above «تعمل» made it read «تغمل»).
  Keep particles out of the text zones, pale, or behind a clear gap.
- Headlines have tight line-height: avoid adding diacritics (tanween, harakat) to display copy; they fall into the
  next line. The copy in content.js is already undiacritized for headlines.
- When animating text letter by letter (typewriter, scramble), keep the `.brand-word` span whole and keep Arabic joining intact:
  type whole words or whole grapheme runs, never split joined letters into separate inline boxes.

---

# Part B: Original brief (verbatim)

# Medad Style Lab: build one site that showcases 22 landing page styles

You are building a style exploration site for **Medad (مداد)**. The goal: I will browse 22 versions of a simple Arabic landing page, each in a radically different visual style, then pick ONE style to adopt for the real product. Quality and distinctiveness of each style matter far more than content depth.

Work in phases (see "Execution Phases" at the bottom). Do NOT build everything at once. Stop at the end of each phase and wait for me.

---

## 1. Paths and source material

- Project folder (read it first to understand what Medad is): `<project>`
- Logo: `<project>/Portal/medad-logo-green-1080.png`
- Body/UI font files (Thmanyah family): `<project>/Portal/Font`
- Display/title font files: `<project>/Portal/titel`
- Create the new site at: `./`

Never modify anything outside `style-lab/`. Copy assets into it; do not reference the originals by absolute path.

---

## 2. First action: write the brief file yourself

Before writing any page, create `style-lab/STYLE_BRIEF.md` containing everything in this prompt (shared rules + all 22 style specs), enriched with what you discover in Phase 0 (exact palette hex values, font file names and weights, the final Arabic copy). This file is the single source of truth. Every later phase and every subagent must read it before working.

---

## 3. Understanding Medad (content)

Read the project files in `<project>` (specs, READMEs, configs) and summarize in 3 to 5 lines what Medad is and who it serves. Write the landing page copy from that understanding. If the files describe more than one thing, tell me what you found and propose which one the page should present, then wait for my answer before writing copy.

The page is intentionally simple. Content outline (each style may reorder, merge, split or reinterpret these, but must cover them):

1. Hero: logo, one strong headline, one short supporting line, one primary call to action
2. A short "who we are / what Medad is" statement (2 to 3 sentences max)
3. Three core pillars or services (title + one sentence each)
4. A closing call to action band
5. A minimal footer (logo, one line, contact)

### Copy rules (strict)
- All copy in Arabic, natural and confident, written like a premium brand, not like a template.
- No em dashes (—), no en dashes (–), no double hyphens (--) anywhere in visible text. Use Arabic punctuation (، ؛ .) instead.
- No captions, no eyebrow labels, no small explanatory subtitles under elements, no "badge" text like "جديد" or "مدعوم بالذكاء الاصطناعي". Nothing that reads as AI generated filler.
- No emojis. No lorem ipsum. No English in visible text except where unavoidable (e.g. an email address).
- Keep it short. Every page should be readable in under 30 seconds.
- All copy lives in ONE file: `style-lab/shared/content.js` (see architecture). Pages read from it; no copy hardcoded in pages.

---

## 4. Brand palette (strict)

1. Open the logo PNG and extract its exact colors programmatically (e.g. Python + Pillow: sample dominant non-transparent pixels, cluster them). Report the hex values.
2. Build the palette ONLY from:
   - The logo's green/teal hue(s), plus tints and shades derived from that same hue (adjust lightness and saturation only, keep the hue within roughly ±8°).
   - One neutral light base: a refined off-white (warm or cool, whichever suits the logo green better; propose it) and/or a soft gray.
   - A near-black ink color for text and dark surfaces (can be slightly tinted toward the logo hue).
3. No other hues. No pink, purple, orange, gold, blue, etc. This applies to EVERY style, including neon styles (Synthwave, Cyberpunk, Cybercore, Y2K, Pixel Art): in those styles the logo green IS the neon. Glows, gradients and chrome effects are built from the green family + neutrals (silver/chrome = neutral grays).
4. Define all colors once as CSS custom properties in `style-lab/shared/tokens.css`. Each style may choose which tokens to emphasize (dark-dominant vs light-dominant) but may not invent new hues.
5. Text contrast must meet WCAG AA on every page.

---

## 5. Fonts

1. Inspect both font folders. List every file, its weight and style. The `Font` folder is the body/UI family (Thmanyah); the `titel` folder is the display/headline family. Confirm this by reading the font metadata (e.g. with fontTools) and tell me if it's different.
2. Copy the files into `style-lab/shared/fonts/` and declare them once with `@font-face` in `tokens.css` (`font-display: swap`). Prefer woff2; convert if only ttf/otf exist (fontTools can do it).
3. Every style uses these fonts for Arabic text. A style may change weights, sizes, spacing, rendering effects (outline, glow, distortion via SVG filters, pixelation of a duplicate layer, etc.), but never swaps the Arabic typeface. Decorative Latin fonts are not needed since visible text is Arabic.

### Kashida (Arabic letter elongation) rules
These fonts are designed with a beautiful curved kashida: inserting the tatweel character `ـ` (U+0640) between two connected letters stretches the joining stroke into an elegant curve. Example: `مـداد` or `مــداد`.

Use it as a deliberate luxury accent, following these rules exactly:
- Maximum TWO tatweel characters in a row (`ــ`). Never three or more.
- Only insert it between two letters that actually connect. It is invalid after the non-connecting letters: ا أ إ آ د ذ ر ز و ؤ ة ى ء. Example: `مـداد` is valid (after م); nothing can go after د or ا.
- Only in display headlines and large hero words. Never in body text, buttons, navigation, or small text.
- Sparingly: at most one or two elongated words per page, and at most one elongation point per word. If it starts to look stretched or cheap, remove it.
- Keep it in the copy as a separate field (e.g. `heroWordKashida: "مـــداد"` is WRONG because it's 3; `"مــداد"` is correct) so it can be toggled.
- Test that the font renders the curve (check the glyph exists in the font). If a font lacks a nice tatweel glyph, tell me instead of faking it.

---

## 6. Architecture

Plain static HTML, CSS and vanilla JS. Every page must open directly by double clicking (file://), with no build step and no local server. Therefore:
- Do NOT use `fetch()` for local JSON. `shared/content.js` defines a global: `window.MEDAD = { ... }` and is loaded with a `<script src>`.
- External libraries are allowed only from cdnjs/jsdelivr/unpkg and only when they add real value (e.g. GSAP for complex timelines, rough.js for sketch lines, Three.js only if a style truly needs 3D). Prefer CSS and SVG.

```
style-lab/
  STYLE_BRIEF.md
  index.html                 ← gallery of all 22 styles
  shared/
    tokens.css               ← palette + @font-face + base reset (RTL)
    content.js               ← all Arabic copy (window.MEDAD)
    switcher.js / .css       ← the small style navigator (see below)
    fonts/
    logo/                    ← the logo, plus any derived versions you generate (e.g. a white or black knockout, a pixelated sprite)
  styles/
    01-claymorphism/index.html (+ style.css, script.js, local assets)
    02-cybercore/
    ... through 22-wabi-sabi/
```

### Logo handling
Use the provided logo in every style. You may generate derived versions (recolored to off-white or ink, cropped wordmark, pixelated version for Pixel Art) with Pillow and store them in `shared/logo/`, but never redraw or alter the letterforms.

### Global page rules
- `<html lang="ar" dir="rtl">`. Use CSS logical properties (`margin-inline-start`, `inset-inline-end`, etc.). Mirror directional motion and arrows for RTL.
- Fully responsive (mobile first; verify at 375px, 768px, 1440px). No horizontal scroll.
- Respect `prefers-reduced-motion`: replace motion with simple fades.
- Fast: no huge images; prefer CSS/SVG/canvas generated visuals. Any imagery should be abstract and generated (shapes, ink, textures), not stock photos.
- A recurring thematic anchor is available to every style: **مداد means ink**. Ink drops, ink in water, quill and pen strokes, inkwells, writing, calligraphic lines. Each style should reinterpret this in its own visual language where it fits. It is a resource, not a requirement.

### Style navigator (shared)
A small, unobtrusive floating control on every style page: previous style, next style, back to gallery, and the style name. Keyboard arrows also navigate (left/right mirrored for RTL). It must be visually neutral and the same on every page so it never competes with the design. Style names in the navigator can stay in English (they are design terms).

### Gallery (`index.html`)
A clean, neutral grid of 22 cards. Each card shows a live scaled-down preview of the style (an `iframe` scaled with CSS transform, lazy loaded) plus the style name and number. Clicking opens the full page. The gallery itself should be quietly elegant using the brand palette and fonts, but must not adopt any of the 22 styles.

---

## 7. The quality bar

- Each of the 22 pages must look like it was made by a different world class designer who specializes in that style. Not a reskin of one template: layouts, structure, composition, navigation, and motion should differ when the style calls for it.
- Each style has a **signature component**: one memorable element that instantly identifies the style. It's described in each spec below. Make it excellent.
- Feel premium and attractive to clients. Restraint where the style demands it, boldness where it demands it.
- Hover, focus, and scroll interactions should feel crafted (timing, easing, physical feedback), never generic fade-ups on everything.
- Keep detail level low: this is for choosing a direction. One screen-rich hero plus a few concise sections is enough. Depth goes into the visual craft, not into more content.

---

## 8. The 22 style specifications

For each style: **Essence** (what the style is and its rules), **Signature component** (the element that defines it), **Layout**, **Type**, **Color application**, **Motion**, **Avoid**.

### 01. Claymorphism
- **Essence:** Soft, inflated, tactile 3D objects that look sculpted from matte clay. Friendly, playful, premium toy-like.
- **Signature component:** A sculpted clay inkwell or plump ink drop in the hero, built with layered CSS/SVG shapes and clay shading (outer soft shadow + inner highlight top-start + inner shade bottom-end). Buttons and cards are puffy pillows that squish when pressed.
- **Layout:** Floating rounded cards (radius 32px+) with generous spacing on an off-white or pale green base; pillars as three chubby cards at slightly different heights.
- **Type:** Bold rounded feel from the heaviest weights; headline large and friendly.
- **Color:** Pastel tints of the logo green on off-white; ink only for text.
- **Motion:** Spring physics: squash and stretch on press (scale 0.95 then overshoot), gentle idle bobbing of the hero object.
- **Avoid:** Hard edges, thin lines, flat shadows, dark backgrounds.

### 02. Cybercore
- **Essence:** The aesthetic of the digital interface itself: early internet and computer UI nostalgia, HUD overlays, wireframes, data streams, ASCII, windowed panels. Abstract and digital, not a city (that's Cyberpunk).
- **Signature component:** A boot sequence hero: a terminal window types Arabic system lines that end by "loading" the Medad logo, surrounded by HUD brackets, coordinates and a slowly rotating wireframe sphere or grid.
- **Layout:** Content inside OS-like windows with title bars, draggable feel, overlapping panels; a scrolling data ticker band.
- **Type:** Body font in a monospaced rhythm (fixed letter spacing, small caps feel), headline with subtle RGB-split glitch built only from green shades.
- **Color:** Near-black background, logo green as phosphor glow, dimmer greens for grid lines.
- **Motion:** Typewriter, cursor blink, scanlines, occasional micro glitch on hover.
- **Avoid:** Rain, neon city signage, warm colors.

### 03. Neo-Brutalism
- **Essence:** Raw, loud, honest web design: thick black outlines, hard offset shadows, flat solid color blocks, no gradients, unapologetic.
- **Signature component:** Chunky buttons and cards with 3px ink borders and a hard 6px offset shadow that "press down" into the shadow on hover/click, plus a thick marquee band scrolling the headline.
- **Layout:** Blocky asymmetric grid, slightly rotated sticker-like elements, oversized numbers for the pillars.
- **Type:** Heaviest weights, huge, tight line height.
- **Color:** Off-white base, solid logo green blocks, ink borders. Flat only.
- **Motion:** Snappy, no easing softness (fast steps, instant offsets).
- **Avoid:** Blur, gradients, soft shadows, rounded pastel softness.

### 04. Scrapbook
- **Essence:** A handmade collage of paper scraps, tape, stamps and keepsakes. Warm, personal, crafted.
- **Signature component:** The hero is a collage pinned on paper: torn-edge paper pieces (SVG clip paths), washi tape strips holding them, and the logo as an ink rubber stamp impression with uneven ink texture.
- **Layout:** Free collage composition with slight rotations; pillars as notes or cut paper cards taped to the page.
- **Type:** Body font for content; headlines feel cut out (each word on its own paper strip).
- **Color:** Off-white paper textures (generated SVG noise), green tape and stamps, ink.
- **Motion:** Elements drop in and settle like placed by hand (slight rotation overshoot); tape peels a little on hover.
- **Avoid:** Perfect alignment, glossy digital effects, handwritten captions (no captions at all).

### 05. Surrealism
- **Essence:** Dreamlike impossibility in the spirit of Magritte and Dalí: impossible scale, floating objects, quiet uncanny calm.
- **Signature component:** An ink drop falling upward from a vast calm plane into the sky, or a giant quill casting a long shadow over a horizon, with the headline mirrored in a reflection beneath it.
- **Layout:** Wide, cinematic, lots of empty space; sections as separate "scenes" revealed on scroll.
- **Type:** Calm and elegant; one word may subtly melt or ripple using an SVG displacement filter.
- **Color:** Pale off-white sky gradients into soft greens; deep green shadows.
- **Motion:** Slow, floaty, uncanny parallax; objects drifting against gravity.
- **Avoid:** Humor, clutter, fast motion.

### 06. Y2K Aesthetic
- **Essence:** Late 90s and early 2000s optimism: liquid chrome, glossy bubble UI, iridescent sheen, sparkles, blobby 3D, pill buttons.
- **Signature component:** A liquid chrome version of the logo or an ink blob in chrome (SVG gradients + specular highlights in green and silver), with twinkling four-point sparkle stars.
- **Layout:** Rounded bubbly containers, glossy pills, playful floating elements.
- **Type:** Heavy, rounded weights; headline with a chrome gradient fill.
- **Color:** Green family + silver grays for chrome; off-white or pale green background.
- **Motion:** Sheen sweeping across glossy surfaces, sparkles twinkling, bouncy hovers.
- **Avoid:** Pink and purple iridescence (keep sheen green/silver only).

### 07. Pixel Art
- **Essence:** 8-bit and 16-bit game aesthetic. Limited palette, hard pixel edges, sprites, game UI.
- **Signature component:** An RPG-style dialog box that types the Medad introduction in Arabic letter by letter, next to a pixel sprite inkwell or quill; plus a pixelated version of the logo (downscaled and rendered with `image-rendering: pixelated`).
- **Layout:** Game screen structure: title screen hero with a blinking "start" call to action, pillars as inventory slots or level cards.
- **Type:** Arabic stays in the brand font for readability; all UI chrome (borders, buttons, frames) is pixelated with stepped borders (box-shadow pixel technique).
- **Color:** A Game Boy style ramp of 4 to 6 greens + ink + off-white. Perfect fit with the logo.
- **Motion:** `steps()` timing only, sprite idle animation, blinking cursor.
- **Avoid:** Smooth gradients, blur, rounded corners.

### 08. Synthwave
- **Essence:** 80s retro-futurism: a sunset over an infinite neon grid, chrome text, VHS haze.
- **Signature component:** An animated perspective grid floor rushing toward the viewer, under a giant horizon sun in logo green gradients cut with horizontal stripes, with the headline in chrome above.
- **Layout:** Full-screen hero scene; following sections as glowing panels over a dark gradient sky.
- **Type:** Headline with chrome gradient and a green outer glow; italic-feeling motion via skew is allowed sparingly.
- **Color:** Dark ink to deep green sky, logo green neon, silver chrome.
- **Motion:** Continuous grid scroll, subtle scanlines and VHS noise, glowing hover pulses.
- **Avoid:** Magenta, purple, orange. The sun and neon are green.

### 09. Glassmorphism
- **Essence:** Frosted translucent glass layers floating over soft vivid color, depth through blur.
- **Signature component:** Ink diffusing in water as the living background (slowly morphing blurred SVG blobs in logo greens), with frosted glass panels (`backdrop-filter: blur`) floating above and tilting slightly toward the cursor.
- **Layout:** Layered floating panels with depth; pillars as three glass cards overlapping the ink clouds.
- **Type:** Clean, medium weights, high contrast on the glass.
- **Color:** Green ink clouds on off-white or ink background; white translucent glass with 1px light borders.
- **Motion:** Slow blob morphing, parallax between layers, glass tilt on hover.
- **Avoid:** Low contrast text on glass; too many glass layers stacked.

### 10. Neumorphism
- **Essence:** Soft UI where elements are extruded from or pressed into the same surface using paired light and dark shadows. Monochrome, tactile, calm.
- **Signature component:** A large tactile control panel in the hero: an extruded circular button or dial that physically presses in (switching shadow from outer to inset) and reveals the logo green state.
- **Layout:** Everything on one continuous surface; pillars as extruded tiles; call to action as an inset well.
- **Type:** Medium weights, ink text, generous spacing.
- **Color:** A single soft gray or off-white surface; logo green used ONLY for active states and accents.
- **Motion:** Pressing and releasing, smooth shadow transitions.
- **Avoid:** Low contrast text (keep AA), borders, multiple surface colors.

### 11. Bento Grid
- **Essence:** A modular grid of rounded tiles of varied sizes, each telling one idea, like a well organized lunch box. Modern product page clarity.
- **Signature component:** An asymmetric bento grid where every tile has its own micro-interaction: a logo tile, a headline tile, a live ink animation tile, three pillar tiles, a call to action tile.
- **Layout:** The whole page is essentially one or two bento grids; must reflow beautifully on mobile.
- **Type:** Clean hierarchy; tile titles bold, one sentence each.
- **Color:** Off-white or ink base; tiles alternate between off-white, soft gray, deep green and logo green.
- **Motion:** Staggered tile reveal, subtle hover lift, small looping animations inside tiles.
- **Avoid:** Equal-sized tiles everywhere; too much text per tile.

### 12. Editorial Design
- **Essence:** A high-end magazine: strong typographic hierarchy, columns, rules, drop caps, pull quotes, generous whitespace.
- **Signature component:** A magazine cover hero: masthead with the logo, a huge cover headline (one kashida word allowed here), an issue-style number, and an abstract ink composition as the cover art.
- **Layout:** Multi-column text sections, thin rule lines, a large Arabic initial letter (drop cap), one oversized pull quote.
- **Type:** Display font big and confident; body in comfortable reading size.
- **Color:** Off-white paper, ink text, logo green for rules and accents.
- **Motion:** Minimal and refined: text reveals line by line, page-turn feeling between sections.
- **Avoid:** Captions under images (no captions anywhere), UI-looking cards.

### 13. Swiss Design
- **Essence:** International Typographic Style: strict grid, asymmetric balance, objective clarity, large type, geometric shapes, flush alignment.
- **Signature component:** A poster-like hero built on a visible 12 column grid: a massive headline aligned flush to the right edge (RTL), a single geometric shape (circle or bar) in logo green, and large numerals.
- **Layout:** Strict grid; pillars as numbered columns 01 02 03; precise spacing scale.
- **Type:** Heavy display vs light body contrast; tight, rational.
- **Color:** Off-white, ink, logo green. Nothing else.
- **Motion:** Precise, linear, grid-snapped transitions; elements slide along grid lines.
- **Avoid:** Decoration, ornament, textures, centered layouts.

### 14. Minimalism
- **Essence:** Only what's essential. Maximum whitespace, one idea per screen, quiet confidence.
- **Signature component:** A hero with nothing but the logo, one headline, and one call to action, plus a single thin ink stroke that draws itself slowly across the space.
- **Layout:** Full-height sections, each with one statement; pillars as three lines of text, not cards.
- **Type:** Light and regular weights, large size, wide spacing.
- **Color:** Off-white dominant, ink text, logo green used in one or two places only.
- **Motion:** Slow, subtle fades and the single drawing stroke.
- **Avoid:** Icons, cards, borders, anything decorative.

### 15. Maximalism
- **Essence:** More is more: layered, dense, energetic, pattern on pattern, kinetic type, controlled chaos.
- **Signature component:** A kinetic wall of typography: the brand words repeated in many sizes and weights, moving in opposing marquee rows, overlapping layered shapes and patterns behind them.
- **Layout:** Overlapping layers, mixed scales, bold patterns (stripes, dots, geometric, all generated in CSS/SVG).
- **Type:** Every weight available, from huge to small, mixed confidently.
- **Color:** The full green ramp from palest tint to deepest shade, plus ink and off-white, all used at once (still no foreign hues).
- **Motion:** Lots of movement: marquees, rotating shapes, cursor-reactive elements. Still smooth and performant.
- **Avoid:** Illegibility of the actual message; the headline and call to action must stay clear.

### 16. Luxury Typography
- **Essence:** Type is the entire design, like a haute couture house. Refined, slow, expensive.
- **Signature component:** A full-screen reveal of the word `مــداد` (with kashida, max two tatweels) at enormous size, unveiled by a slow mask wipe, with ultra thin hairline rules framing it.
- **Layout:** Very few elements, wide margins, centered or precisely offset; sections are single typographic statements.
- **Type:** The display font at its most elegant; generous letter spacing for small text, tight for display.
- **Color:** Ink or deepest green background with off-white and logo green type. Dark and rich.
- **Motion:** Slow eased reveals (1s+), subtle cursor-follow light on the type.
- **Avoid:** Icons, illustrations, busy backgrounds, fast motion.

### 17. Conceptual Sketch
- **Essence:** A designer's notebook coming to life: pencil and ink sketches, wireframe boxes, arrows, grid paper, unfinished in a beautiful way.
- **Signature component:** The page draws itself: hand-drawn wobbly outlines (rough.js or custom SVG) around the hero and sections animate stroke by stroke as you scroll, with sketched arrows connecting ideas.
- **Layout:** Grid paper background, wireframe-like boxes containing the real content, doodled underlines.
- **Type:** Brand font for content; headlines may get a hand-drawn underline or circle.
- **Color:** Off-white grid paper, ink pencil lines, logo green as the "marker" color.
- **Motion:** stroke-dashoffset drawing animations, slight jitter on hover.
- **Avoid:** Annotation captions or notes text (no captions), polished shadows.

### 18. Ethereal
- **Essence:** Light, airy, dreamy, soft. Like morning mist and light passing through fabric.
- **Signature component:** Layers of soft drifting fog and tiny floating ink particles catching light (canvas particles), with the headline gently emerging from the mist.
- **Layout:** Airy, centered compositions, plenty of breathing space, soft section transitions that blend into each other.
- **Type:** Light weights, larger spacing, delicate.
- **Color:** Pale off-white, very soft green glows and haze; ink used lightly.
- **Motion:** Very slow drifting, breathing glows, soft blur transitions.
- **Avoid:** Hard edges, heavy weights, strong contrast blocks (but keep text contrast AA).

### 19. Bohemian
- **Essence:** Earthy, handcrafted, free-spirited: woven textures, organic shapes, arches, botanical line art, layered textiles.
- **Signature component:** An arched window frame in the hero containing botanical line drawings in green ink, bordered by a woven textile pattern band (CSS/SVG pattern).
- **Layout:** Organic shapes, arches, layered patterned bands between sections, relaxed asymmetry.
- **Type:** Warm, medium weights; headlines feel handcrafted.
- **Color:** Sage, olive and moss tones derived from the logo green, warm off-white, ink.
- **Motion:** Gentle sway (like leaves), slow reveals.
- **Avoid:** Terracotta, orange and earth browns (stay in the green family), hard tech feel.

### 20. Victorian
- **Essence:** Ornate 19th century elegance: filigree frames, engraving style, damask patterns, symmetry, antique labels and certificates.
- **Signature component:** The hero is an ornate antique label or certificate: an intricate SVG filigree frame around the logo, with decorative dividers and a quill and inkwell engraving style illustration.
- **Layout:** Symmetrical, centered, framed sections, ornamental dividers, a subtle damask background pattern.
- **Type:** Display font with formal elegance; one kashida word fits naturally here.
- **Color:** Deep bottle green (shade of the logo), ink, cream off-white; logo green for highlights. No gold.
- **Motion:** Refined and slow: frames drawing in, gentle fades.
- **Avoid:** Modern flat UI, gold, cluttered unbalanced compositions.

### 21. Cyberpunk
- **Essence:** Dystopian neon city at night: rain, flickering signage, holograms, grit, angular tech panels.
- **Signature component:** A flickering neon tube sign of the logo/wordmark in green, with realistic tube glow and occasional flicker, over a rain-streaked dark scene (canvas rain).
- **Layout:** Angular panels with chamfered corners (clip-path), warning stripe bands, holographic info panels for the pillars.
- **Type:** Heavy display with glitch on hover; body in high contrast.
- **Color:** Ink/near-black city, logo green neon, dim greens for reflections.
- **Motion:** Neon flicker, rain, glitch slices, holographic shimmer.
- **Avoid:** Magenta/cyan clichés (green only), the clean abstract HUD look of Cybercore.

### 22. Wabi-Sabi
- **Essence:** Japanese aesthetic of imperfection and impermanence: natural textures, asymmetry, quiet, handmade, worn.
- **Signature component:** A single ink-wash brush stroke (sumi-e style, in deep green and ink) that reveals itself across the hero on handmade paper texture, with uneven, slightly irregular edges on containers.
- **Layout:** Asymmetric, lots of negative space, few elements, imperfect edges (SVG masks), stone or ceramic-like textures from SVG noise.
- **Type:** Regular weights, calm, generous line height.
- **Color:** Muted: off-white paper, soft gray, desaturated greens, ink.
- **Motion:** Very slow, natural, ink spreading into paper.
- **Avoid:** Perfect symmetry, gloss, bright saturated green blocks.

---

## 9. Execution Phases

Stop after each phase, report briefly what you did, and wait for me to say continue.

**Phase 0: Discovery and brief**
- Read the Medad project, inspect logo and fonts, extract the palette, verify the kashida glyph renders.
- Write `STYLE_BRIEF.md` (everything above + discovered facts) and draft `shared/content.js`.
- Report to me: what Medad is (3 to 5 lines), the palette hex values with a proposed off-white/gray, font files and roles, the Arabic copy draft. Wait for approval.

**Phase 1: Foundation**
- Build `shared/` (tokens.css, content.js, fonts, logo variants, switcher), the gallery `index.html`, and folder stubs for all 22 styles.
- Build style 01 (Claymorphism) fully as the reference for quality and structure.
- Wait for my feedback.

**Phase 2 to 5: Styles in batches**
- Phase 2: styles 02 to 06. Phase 3: 07 to 11. Phase 4: 12 to 16. Phase 5: 17 to 22.
- Within each batch, launch one subagent per style in parallel. Each subagent must first read `STYLE_BRIEF.md` (shared rules + only its own style section), use only `shared/` assets and tokens, and write only inside its own `styles/NN-name/` folder.
- After the batch, you (the main agent) review every page yourself: check the copy rules (no dashes, no captions, kashida rules), palette compliance, RTL, mobile width, reduced motion, and that the signature component is present and strong. Fix issues before reporting.
- Wait for my feedback before the next batch.

**Phase 6: Polish**
- Apply my notes, make sure gallery previews all work, and do a final consistency pass.

Start with Phase 0 now.
