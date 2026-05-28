# README Upgrade Notes

Additions to make to `README.md` before `claude init`. Do not rewrite the existing content — append or expand these sections.

---

## New sections to add

### Color space
```md
## Color space

Palette Studio works in **LCH and OKLCH** — perceptually uniform color spaces from the
[CSS Color 4](https://www.w3.org/TR/css-color-4/) specification. Colors are stored as
`[l, c, h]` channel tuples and serialized to `oklch()` CSS notation.

**Display-P3 is the default target gamut.** Swatches that exceed sRGB but fit within
Display-P3 are marked with a `P3` badge. The 6 channel graphs show a P3 boundary contour
so you can see where the gamut edge falls relative to your palette.

Color math: [colorjs.io](https://colorjs.io) (W3C-adjacent, Lea Verou / Chris Lilley).
WCAG 2.1 contrast: [chroma-js](https://gka.github.io/chroma.js/).
APCA contrast: [apca-w3](https://github.com/Myndex/SAPC-APCA).
```

### The 6 graphs
```md
## The 6 graphs

Each of the three LCH/OKLCH channels (Lightness, Chroma, Hue) has two graphs:

| Graph | X-axis | Y-axis | What dragging changes |
|---|---|---|---|
| L across tones | Tone stops | Lightness | L of that tone for selected hue |
| L across hues | Hue rows | Lightness | L of that tone for all hues at fixed stop |
| C across tones | Tone stops | Chroma | C of that tone |
| C across hues | Hue rows | Chroma | C of that hue row at fixed stop |
| H across tones | Tone stops | Hue angle | H of that tone |
| H across hues | Hue rows | Hue angle | H of that entire hue row |

The background fill shows the gamut-mapped color space for that channel. The white contour
line marks the Display-P3 boundary.
```

### Contrast model
```md
## Contrast

Two contrast models, selectable in the header:

- **APCA** (Accessible Perceptual Contrast Algorithm): shows signed `Lc` value.
  Negative = light text on dark background; positive = dark text on light.
  Thresholds: body text Lc 60 · large text Lc 45 · UI components Lc 30.
- **WCAG 2.1**: classic 1:1–21:1 ratio. Thresholds: AA normal 4.5 · AA large 3 · AAA 7.
- **ΔE2000**: perceptual color distance between the selected swatch and the comparison color.
  < 1 imperceptible · 1–2 threshold · 2–10 perceivable · > 10 distinct.
```

### Architecture note (for contributors)
```md
## Architecture

Stack: Next.js 16 · App Router · Tailwind CSS v4 · nanostores · colorjs.io · pnpm

- **State:** nanostores atoms in `store/`. Palette persists to localStorage under key `colorWorkbench_v1`.
- **Color engine:** `shared/colorFuncs/` — LCH/OKLCH models; `shared/color.ts` — contrast functions.
- **Graphs:** `components/ColorGraph/Chart/RenderStrategy/WorkerPool/` — OffscreenCanvas rendered
  off-thread via [comlink](https://github.com/GoogleChromeLabs/comlink).
- **Design tokens:** three-tier OKLCH system in `app/globals.css`. All colors in `oklch()` or
  `color(display-p3 ...)`. Never HSL.
- **AI agent instructions:** `AGENTS.md` at the repo root — read before making structural changes.
```

### Responsive note
```md
## Responsive

Optimized for desktop (1280px+). Mobile-friendly at `md` (768px+): palette grid scrolls horizontally,
channel graphs stack vertically. Some controls (keyboard shortcuts, dense numeric editor) are
desktop-only by design.
```

### Attribution update
```md
## Attribution

Palette Studio inherits core palette logic, APCA/WCAG overlays, and UI patterns from
[Huetone](https://github.com/ardov/huetone) by Alexey Ardov (MIT).

Modernized with Next.js 16 App Router, Tailwind CSS v4, nanostores, colorjs.io, and
Display-P3 gamut visualization by [Jayson Acorda](https://jaysonacorda.com).
```

---

## Existing sections to update

- **Scripts table:** add `pnpm tsc --noEmit` as a listed command with description "TypeScript type check"
- **Deploy table:** already correct — no changes needed
- **Run locally:** add step 5: "Open DevTools → Rendering → Emulate CSS media: color-gamut: p3 to preview wide-gamut swatches"
