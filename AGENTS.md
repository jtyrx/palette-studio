# Palette Studio — Agent Instructions

This file is kept in sync with **CLAUDE.md**, which is the master reference. If the two files conflict, CLAUDE.md wins. This file adds Cursor Composer–specific guidance on top of the shared spec.

Read this file before touching any file.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.x · App Router · Turbopack |
| Language | TypeScript 5 · strict mode |
| Styling | Tailwind CSS v4 · CSS-first (`@theme`, `@utility`, no `tailwind.config.*`) |
| UI primitives | `@base-ui/react` · shadcn-style wrappers in `components/ui/` |
| State | `nanostores` + `@nanostores/persistent` + `@nanostores/react` |
| Color math | `colorjs.io` (primary) + `chroma-js` (WCAG 2.1 ratio only) |
| Contrast | `apca-w3` for APCA · `chroma.contrast` for WCAG 2.1 |
| Theme | `next-themes` · `attribute="data-theme"` · default `"dark"` |
| Persistence | `@nanostores/persistent` (localStorage key: `palette`) · lz-string URL share (read-once, cleaned) |
| Package manager | `pnpm` |
| Testing | `vitest` + `@testing-library/react` |
| Icons | `lucide-react` |
| Animations | `tw-animate-css` |

---

## Architecture

### Route structure
Single-page application. One route only:

```
app/
  layout.tsx          # Server Component — metadata, Geist font, ThemeProvider
  page.tsx            # Server Component — renders <PaletteStudioLoader>
  globals.css         # Tailwind v4 CSS-first config — THREE-TIER OKLCH SYSTEM
```

No additional routes. Do not add routes without explicit approval.

### Component tree
```
layout.tsx
  ThemeProvider (next-themes, data-theme attribute)
    PaletteStudioLoader
      PaletteStudioClient  ← 'use client' boundary
        App
            Header
              PaletteSelect
              ColorEditor
              ContrastModeToggle
              GamutBadge          ← palette-level gamut indicator
              ChartSettings
              ThemeButton
              GitHubLink
            PaletteSwatches       ← CSS grid of color swatches + per-swatch gamut chip
            ColorGraph            ← 6 LCH/OKLCH channel charts
              Canvas (×6)         ← OffscreenCanvas + WorkerPool via comlink
            ColorInfo             ← APCA + WCAG + ΔE2000 badges per selected swatch
```

### State shape (nanostores)
```
store/palette/
  paletteStore          — map<Palette> — the active palette (hues × tones × colors)
  savedPalettesStore    — persistentAtom<HexPalette[]> — localStorage key: PALETTE_KEY
  paletteListStore      — computed: saved + presets
  paletteIdStore        — atom<number> — index of selected palette
  colorSpaceStore       — computed from paletteStore.mode

store/overlay.ts
  overlayStore          — persistentMap: { mode: 'APCA'|'WCAG'|'DELTA_E'|'NONE', versus: 'white'|'black'|'selected' }
  versusColorStore      — computed from overlay + selected

store/currentPosition.ts
  selectedStore         — atom<{ hueId: number; toneId: number }>
```

### Engine modules
```
shared/
  color.ts              — contrast functions (wcagContrast, apcaContrast, deltaEContrast, inGamut)
  colorFuncs/
    colorModels.ts      — TLchModel definitions for CIE LCH and OKLCH
    index.ts            — colorSpaces map, lch2color entry point
    utils.ts            — gamut helpers (within_P3, within_Rec2020)
  types.ts              — TColor, Palette, HexPalette, TLchModel
  presets.ts            — built-in palette presets
  constants.ts          — PALETTE_KEY and other shared constants
```

### The 6 graphs
`ColorGraph/index.tsx` renders two charts per channel (L, C, H) — one "stop-axis" (channel across tones for selected hue) and one "hue-axis" (channel across hues for selected tone). Each chart:
- Renders a background gamut visualization via `WorkerPool` (comlink, OffscreenCanvas)
- Shows draggable points for each swatch in the current palette slice
- Writes back to `paletteStore` on drag
- Shows a P3 boundary contour (1px stroke at the sRGB/P3 gamut transition)

Do not break the 6 graphs, drag handlers, or P3 contour without explicit approval.

---

## Design token system (THREE-TIER OKLCH)

`app/globals.css` is the single source of truth for all design tokens. Never add tokens elsewhere.

### Tier 1 — primitives (`@theme`)
Raw OKLCH values: color scale, spacing, radius, type steps. Named `--color-<name>-<step>`.

### Tier 2 — semantic aliases (`:root` / `[data-theme="dark"]`)
Role-based tokens: `--color-surface-default`, `--color-text-primary`, `--color-border-subtle`, etc. Named `--color-<tier>-<role>[-<variant>]`.

### Tier 3 — Tailwind bridge (`@theme inline`)
Maps semantic tokens to Tailwind utility classes. Example: `--color-background: var(--color-surface-default)`.

### Rules
- **No HSL anywhere.** All color values in `oklch()` or `color(display-p3 ...)`.
- **DTCG-compatible naming:** `--color-surface-default` not `--c-bg`.
- **Display-P3 variants** for brand colors: `--color-brand-p3: color(display-p3 ...)`.
- Dark mode via `[data-theme="dark"]` selector only. Never `@media (prefers-color-scheme)` as primary. Never `.dark` class.
- Never write CSS custom properties outside `globals.css` except for component-scoped animation keyframes.

---

## Import policy

- **Direct source imports only.** No runtime barrel imports.
  - ✅ `import { paletteStore } from '@/store/palette/stores'`
  - ❌ `import { paletteStore } from '@/store/palette'` (if index.ts re-exports)
- **Type-only barrels are allowed:** `import type { Palette } from '@/shared/types'`
- **`components/ui/` is flat.** No subdirectories inside `components/ui/`.
- **`@/` resolves to the project root** (not `src/` — that layout was removed in Phase 1).

---

## Color library rules

| Task | Use |
|---|---|
| WCAG 2.1 contrast ratio | `chroma.contrast(bg, text)` — do not switch |
| APCA contrast | `APCAcontrast` from `apca-w3` + colorjs.io for hex→sRGB |
| ΔE (CIE76, this pass) | `chroma.deltaE(bg, text)` — label as "ΔE CIE76" in UI; ΔE2000 upgrade deferred |
| Gamut detection | `color.inGamut('srgb')`, `color.inGamut('p3')` from colorjs.io |
| CSS Color 4 output | `color.toString({format: 'oklch'})` from colorjs.io |
| Color construction in workers | `new Color('oklch', [l, c, h])` — Worker-safe |
| Do not use | `chroma.deltaE`, `chroma.valid`, `chroma(hex).rgb()` — replaced by colorjs.io |

---

## APCA polarity rule

`apcaContrast()` returns the **signed** `Lc` value. Negative = light text on dark background. Positive = dark text on light background.

- Use `Math.abs(Lc)` **only** for threshold lookups and swatch overlay display.
- `ColorInfo` panel displays signed `Lc` with explicit polarity label.
- Do not wrap the return value of `apcaContrast()` in `Math.abs()`.

---

## Gamut badge rules

**Header badge (palette-level):**
- Shows the most expansive gamut occupied by any swatch in the current palette.
- Computed from `paletteStore` via `computed()` — reactive, no manual updates.
- States: `sRGB` · `P3` · `Rec2020`. Most expansive one highlighted.

**Per-swatch badge:**
- Render only when `!color.within_sRGB` (i.e., out of sRGB).
- Show `P3` when `within_P3`, `Rec2020` when `!within_P3`.
- Top-right corner of swatch cell.

**Graph P3 contour:**
- `paintWorker.ts` draws a 1px stroke at the per-pixel `within_P3` transition.
- Present on all 6 graphs. Do not remove.

---

## Plan Mode requirements

**All structural changes require a Plan Mode gate before the first commit in that phase.**

| Change type | Gate required |
|---|---|
| Moving files or directories | Yes |
| Adding or removing dependencies | Yes |
| Changing globals.css token system | Yes |
| Modifying the store shape | Yes |
| Changing graph rendering behavior | Yes |
| Updating tsconfig / vitest / components.json | Yes |
| UI-only additions (new badge, new component) | No, but flag in PR |

Do not proceed past a gate without explicit user approval.

---

## Verification commands

Run all before marking any phase complete:

```bash
pnpm tsc --noEmit          # zero TypeScript errors
pnpm build                  # production build passes
pnpm test                   # all vitest tests pass
pnpm lint                   # zero ESLint errors, zero warnings
```

Additional runtime check after `pnpm dev`:
- No `console.error` in the browser console
- No unhandled promise rejections
- Light/dark toggle works without flash
- All 6 graphs render with P3 boundary contour
- Gamut badges appear on P3 swatches

---

## Responsive contract

Desktop UX at `xl` (1280px+) is the floor. Never regress it.

| Breakpoint | Palette grid | 6 Graphs | Contrast panel |
|---|---|---|---|
| xl+ | Full grid | 2-col flex row | Beside graphs |
| lg (1024px) | Full grid | 3×2 stack | Below graphs |
| md (768px) | `overflow-x: auto` | 1-col stack | Below graphs |
| sm (640px) | `overflow-x: auto` | 1-col stack | Collapsed |

Graph knobs are `<input type="range">` — pointer events fire on touch natively.

**Desktop-only (do not attempt to mobilize in scope):** multi-key keyboard shortcuts, dense numeric color editor inputs.

---

## Out-of-scope items

Do not implement without explicit approval:

- Visual redesign (new typography, new color identity, new layout from scratch)
- Adding new routes or palette types
- Replacing `vitest` with any other test runner
- Replacing `nanostores` with a different state library
- Swapping `chroma.contrast` for any other WCAG ratio implementation
- Renaming the project or repository
- Storybook integration
- MDX documentation pages

---

## Persistence keys

| Key | Store | Format |
|---|---|---|
| `palette` | `savedPalettesStore` | JSON array of `HexPalette` |
| `theme` | next-themes | `'light'` or `'dark'` |
| `p` (URL query param) | lz-string URL share | Compressed JSON, read-once on mount |

Schema-version the localStorage key (`_v1`, `_v2`) whenever the `HexPalette` shape changes.

---

## Upcoming Features (In Scope — Do Not Block)

These are planned and approved. Do not treat them as out-of-scope:

- **Export / copy outputs** — CSS custom properties, Tailwind token JSON, raw hex/oklch formats
- **Improved contrast tooling** — color blindness simulation, additional accessibility badges
- **Preset browser** — expanded built-in palettes with browseable UI
- **UI polish** — typography, spacing, component refinement, better responsive experience

---

## Cursor Composer Guidelines

This project is actively worked on in Cursor Composer 2.5, primarily for UI changes.

### Tailwind v4 in Cursor
- All utility classes use canonical CSS variable syntax — `bg-surface-default`, not `bg-[var(--color-surface-default)]`
- Color tokens live in `app/globals.css` under `@theme inline`. Do not inline color values in components.
- When adding a new UI element, reference existing token names from globals.css — don't invent new ones.

### Component work
- Prefer editing existing components over creating new files. New files require a clear reason.
- `components/ui/` is flat — no subdirectories. New headless primitives go here.
- Use `@base-ui/react` for interactive primitives (dialogs, popovers, toggles). Do not add Radix UI or Headless UI.

### State in UI components
- Read state via `useStore()` from `@nanostores/react`. Do not use React context for palette state.
- Dispatch mutations through `store/palette/actions.ts`. Do not mutate store atoms directly in components.

### When to ask before acting
- Any change that touches `app/globals.css` token definitions
- Any change to the 6 graph components or their canvas workers
- Any new dependency (`pnpm add`)
- Any change to the store shape or persistence key

### When to act without asking
- Styling changes within existing Tailwind token vocabulary
- Adding a new display-only component that reads but doesn't write state
- Fixing TypeScript errors or lint warnings
- Copy/label changes
