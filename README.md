# Phoenix Mobiles & Services — Premium Website v2

> **Revive. Repair. Rise.**
> Gold phoenix on deep navy. Cinematic scroll storytelling. Extravagant animations.

---

## Quick Start

```bash
# No build step needed — open directly
open index.html

# For the Google Maps iframe to load, serve locally:
npx serve .          # Then visit http://localhost:3000
python3 -m http.server 8080   # Then visit http://localhost:8080
```

---

## Project Files

```
phoenix-v2/
├── index.html          ← Full single-page site (951 lines)
├── css/
│   └── style.css       ← Gold design system + all animations (1,750 lines)
├── js/
│   └── main.js         ← All interactions + canvas + GSAP (879 lines)
├── assets/
│   └── logo.png        ← Actual Phoenix Mobiles logo (gold phoenix)
└── README.md
```

---

## Tech Stack

| Tech | Purpose | Why |
|---|---|---|
| **GSAP 3.12 + ScrollTrigger** | Scroll animations, stagger reveals, parallax | Industry-standard animation engine — buttery smooth, GPU-optimised |
| **Canvas 2D API** | Hero particle vortex, CTA fire particles | Native GPU acceleration, no library needed |
| **CSS Custom Properties** | Full gold design token system | Single source of truth, live-themeable |
| **Cinzel + Outfit + Cormorant** | Display / Body / Italic copy fonts | Regal authority + clean readability + editorial elegance |
| **Intersection Observer** | Fallback reveals when GSAP offline | Works with no internet, respects reduced motion |
| **Vanilla JS** | Everything else | Zero bundle size overhead |

---

## Animations Implemented

### 1 — Hero Gold Particle Wing Formation
The hero canvas renders 280 gold particles arranged in a phoenix wing silhouette — two sweeping arcs with tail feathers. Particles continuously orbit their target positions with organic turbulence. Every ~12 seconds a shockwave ring bursts outward from the logo centre.

### 2 — Logo Metallic Shimmer Sweep (Logo Mask Reveal)
A bright diagonal sheen sweeps across the hero phoenix logo every 5 seconds, mimicking real metallic gold catching light. The CSS `clip-path` shimmer overlay simulates precious metal.

### 3 — Dual Wing Sweep Overlays
Two diagonal gold-tinted light bands sweep across the full hero section from opposite sides, simulating a phoenix spreading its wings. Timed at 8s intervals, offset by 4s.

### 4 — GSAP 3D Card Reveals
Service cards drop in with `rotateX` perspective transforms, staggered at 100ms intervals. Why cards, device tiles, and process steps each have unique entrance choreography.

### 5 — SVG Process Line Draw
The repair journey timeline features an SVG path whose `stroke-dashoffset` animates as you scroll — the gold line literally draws itself step by step as the page scrolls through the section.

### 6 — Magnetic Buttons
All CTA buttons respond to mouse proximity with a gravitational pull effect — cursor moves near, button shifts toward it. Uses `mousemove` + `lerp` for smooth elastic feel.

### 7 — Service Card Particle Sparks
Hovering a service card emits a burst of 18 gold particle sparks radiating outward. DOM-based, CSS `@keyframes`, removed after 1.2s to keep DOM clean.

### 8 — Gold Shimmer Text
Every `.gold-text` element has a continuously animated metallic gradient shimmer with `background-size: 300%` cycling — making all gold text feel alive and precious.

### 9 — Horizontal Gallery (ScrollTrigger Pin)
The gallery section pins for 500vh of scroll depth. GSAP ScrollTrigger translates the card track horizontally while the section stays fixed — smooth cinematic panel reveal.

### 10 — CTA Canvas Fire Particles
The final CTA section features a dense field of upward-drifting gold/amber particles on canvas, creating a fire-from-below atmosphere behind the phoenix logo.

---

## Sections

1. **Preloader** — Spinning rings + logo float + progress bar + burst animation
2. **Hero** — Particle wing formation + metallic shimmer + wing sweep + animated headline split text + stats strip
3. **Services** — 6 repair cards with 3D reveal, card tilt, particle sparks, glow tracking, animated SVG icons
4. **Why Us** — Stats band counters + 5 value cards with numbered overlays
5. **Repair Process** — 4-step journey with SVG line drawing on scroll
6. **Devices We Service** — 4 device type tiles with icon glow
7. **Horizontal Gallery** — 5 panels revealed by vertical scroll
8. **Sales** — Logo display + feature list + brand marquee ticker
9. **About** — Story + hours + stacked offset cards
10. **Contact** — Info blocks + Google Maps embed + action buttons
11. **Final CTA** — Canvas fire + glowing logo + dramatic headline
12. **Footer** — Brand + links + copyright

---

## Customisation Guide

### Update Phone Number
Replace all instances of `7019746943` in `index.html` (11 occurrences — all `href="tel:..."` and `href="https://wa.me/91..."` links).

### Update Address
Search `Chikke Gowda Complex` in `index.html` — 3 occurrences.

### Replace Logo
Replace `assets/logo.png` with your new image. Keep the filename the same, or update all 6 `src="assets/logo.png"` references in `index.html`.

### Change Gold Colour Theme
In `css/style.css` under `:root`, adjust these variables:
```css
--g3: #FFD700;   /* Pure gold — main accent */
--g5: #D4AF37;   /* Metallic gold — borders, icons */
--g7: #B8860B;   /* Dark gold — shadows */
```

### Change Background Colour
```css
--bg1: #04050e;  /* Main page background */
--bg0: #02030a;  /* Darkest (hero, CTA) */
```

### Update Store Hours
Search `9:00 AM` in `index.html` — appears in 2 sections (About and Contact).

---

## Deployment

### Netlify (Easiest — Free)
1. Go to [netlify.com/drop](https://netlify.com/drop)
2. Drag the entire `phoenix-v2` folder onto the page
3. Live URL in 30 seconds

### Vercel
```bash
npx vercel
```

### GitHub Pages
1. Push folder to a GitHub repository
2. Settings → Pages → Source: main branch / root

### cPanel / Shared Hosting
Upload all files via FTP to `public_html/`:
- `index.html`
- `css/style.css`
- `js/main.js`
- `assets/logo.png`

---

## Performance Notes

- **GSAP loads from CDN** — cached globally across millions of sites
- **GSAP fallback** — if CDN is offline, `initFallbackReveal()` uses Intersection Observer
- **Canvas particles scale** — fewer particles on mobile (`isMobile()` check)
- **`prefers-reduced-motion`** — all animations disabled, cursor hidden, scroll behaviour instant
- **Logo is served locally** — no external image requests
- **Map iframe lazy-loaded** — `loading="lazy"` attribute

---

## Browser Support

Chrome 80+, Firefox 75+, Safari 14+, Edge 80+, Mobile Chrome/Safari (touch optimised, cursor disabled).
