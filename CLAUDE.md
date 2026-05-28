# CLAUDE.md — Palette Studio

**Master reference for Claude Code and Cursor.** `AGENTS.md` is a symlink to this file — edit `CLAUDE.md` only. When tooling conflicts, this file wins.

---

## Project Purpose

Palette Studio is a portfolio project and color tooling app for designers and developers. It generates perceptually uniform, accessible color palettes in LCH/OKLCH color space, targeting Display-P3 as the default gamut with sRGB fallback.

**This project is actively being built.** Upcoming work includes export/copy outputs (CSS, Tailwind tokens, JSON), improved contrast tooling (simulation, more badges), a preset browser, and UI polish.

---

## Commands

```bash
pnpm dev          # start Next.js dev server
pnpm build        # production build
pnpm lint         # ESLint
pnpm test         # vitest run (all tests)
pnpm tsc --noEmit # type-check without emitting

# Run a single test file
pnpm vitest run shared/colorDisplay.test.ts
```

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 · App Router · Turbopack |
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

### Color Model

All colors are `TColor` (`shared/types.ts`): LCH channels (`l`, `c`, `h`), pre-computed RGB (`r`, `g`, `b`), hex, gamut flags (`within_sRGB`, `within_P3`, `within_Rec2020`), and active `mode` (`oklch` | `cielch`). `TLchModel` describes a color space with channel ranges and converter functions.

Color math:
- `shared/color.ts` — APCA, WCAG, ΔE contrast utilities
- `shared/colorFuncs/colorModels.ts` — TLchModel definitions for CIE LCH and OKLCH
- `shared/colorFuncs/index.ts` — `colorSpaces` map, `lch2color` entry point
- `shared/colorFuncs/utils.ts` — gamut helpers (`within_P3`, `within_Rec2020`)
- `shared/colorFuncs/chartGamut.ts` — gamut boundary computation for graph overlays
- `shared/interpolation.ts` — palette tone interpolation
- `shared/colorDisplay.ts` — multi-gamut display string generation

### State Management

```
savedPalettesStore (persistentAtom → localStorage key: "palette")
  └─ paletteListStore (computed: user palettes + presets)
       └─ paletteStore (map<Palette>) ← active working palette
            └─ colorSpaceStore (computed)
```

- `store/palette/stores.ts` — atom definitions
- `store/palette/actions.ts` — all mutations (`switchPalette`, `resetPaletteToBaseline`, `switchColorSpace`, etc.)
- `store/palette/paletteReducers.ts` — pure functions that transform `Palette` data
- `store/palette/converters.ts` — `HexPalette` ↔ `Palette` conversions; `exportToHexPalette`
- `store/currentPosition.ts` — `selectedStore` tracks [hueIdx, toneIdx] of the active swatch
- `store/chartSettings.ts` — display toggles (show colors, gamut overlay, etc.)
- `store/overlay.ts` — overlay state: `{ mode: 'APCA'|'WCAG'|'DELTA_E'|'NONE', versus: 'white'|'black'|'selected' }`

### The 6 Graphs

`components/ColorGraph/` renders six interactive `<Scale>` charts — L, C, H channels × "stop" axis (across tones) and "hue" axis (across hues). Each chart:
- Renders a background gamut visualization via `WorkerPool` (comlink, OffscreenCanvas)
- Shows draggable points for each swatch in the current palette slice
- Writes back to `paletteStore` on drag
- Shows a P3 boundary contour (1px stroke at the sRGB/P3 gamut transition)

Do not break the 6 graphs, drag handlers, or P3 contour without explicit approval.

### Contrast

`components/ColorInfo/ContrastBadge.tsx` shows APCA (Lc), WCAG 2.1 ratio, and ΔE values for the selected swatch against its neighbors.

### Theming & Styling

- **Tailwind v4** with canonical CSS variable utilities — no `[var(--...)]` bracket syntax
- Three-tier OKLCH token system in `app/globals.css`: primitive tokens → semantic tokens → component tokens
- **next-themes** wraps the app in `app/providers.tsx` via `attribute="data-theme"`, default `"dark"`
- Responsive breakpoint: `md` (768px) — left panel goes full-width below this

---

## Design Token System (THREE-TIER OKLCH)

`app/globals.css` is the single source of truth for all design tokens. Never add tokens elsewhere.

### Tier 1 — primitives (`@theme`)
Raw OKLCH values: color scale, spacing, radius, type steps. Named `--color-<name>-<step>`.

### Tier 2 — semantic aliases (`:root` / `[data-theme="dark"]`)
Role-based tokens: `--color-surface-default`, `--color-text-primary`, `--color-border-subtle`, etc.

### Tier 3 — Tailwind bridge (`@theme inline`)
Maps semantic tokens to Tailwind utility classes.

### Rules
- **No HSL anywhere.** All color values in `oklch()` or `color(display-p3 ...)`.
- Dark mode via `[data-theme="dark"]` selector only. Never `@media (prefers-color-scheme)` as primary. Never `.dark` class.
- Never write CSS custom properties outside `globals.css` except component-scoped animation keyframes.
- **Display-P3 variants** for brand colors: `--color-brand-p3: color(display-p3 ...)`.

---

## Import Policy

- **Direct source imports only.** No runtime barrel imports (see `bundle-barrel-imports` in Vercel React best practices).
  - ✅ `import { paletteStore } from '@/store/palette/stores'`
  - ❌ `import { paletteStore } from '@/store/palette'`
- **Type-only barrels are allowed:** `import type { Palette } from '@/shared/types'`
- **`components/ui/` is flat** — no subdirectories. **File names are kebab-case** (`button.tsx`, `dropdown-menu.tsx`), matching neutral-system / portfolio conventions.
- **Buttons:** always `import { Button } from '@/components/ui/button'` (`@base-ui/react` primitive). Do not add a second app `Button` in feature components.
- **Legacy form primitives** (`Input`, `Select`, `TextArea`, `ControlGroup`) live in `components/Inputs.tsx` until migrated into `components/ui/`.
- **`@/` resolves to the project root** (not `src/`). Active code lives at repo root; exclude retired `src/` from tooling if it reappears.

---

## Color Library Rules

| Task | Use |
|---|---|
| WCAG 2.1 contrast ratio | `chroma.contrast(bg, text)` — do not switch |
| APCA contrast | `APCAcontrast` from `apca-w3` + colorjs.io for hex→sRGB |
| ΔE (CIE76) | `chroma.deltaE(bg, text)` — label as "ΔE CIE76" in UI |
| Gamut detection | `color.inGamut('srgb')`, `color.inGamut('p3')` from colorjs.io |
| CSS Color 4 output | `color.toString({format: 'oklch'})` from colorjs.io |
| Color construction in workers | `new Color('oklch', [l, c, h])` — Worker-safe |
| Do not use | `chroma.deltaE`, `chroma.valid`, `chroma(hex).rgb()` — replaced by colorjs.io |

---

## APCA Polarity Rule

`apcaContrast()` returns the **signed** `Lc` value. Negative = light text on dark background. Positive = dark text on light background.

- Use `Math.abs(Lc)` **only** for threshold lookups and swatch overlay display.
- `ColorInfo` panel displays signed `Lc` with explicit polarity label.
- Do not wrap `apcaContrast()` return in `Math.abs()`.

---

## Gamut Badge Rules

**Header badge (palette-level):** Shows the most expansive gamut of any swatch. Computed from `paletteStore` via `computed()` — reactive, no manual updates. States: `sRGB` · `P3` · `Rec2020`.

**Per-swatch badge:** Render only when `!color.within_sRGB`. Show `P3` when `within_P3`, `Rec2020` when `!within_P3`. Top-right corner of swatch cell.

**Graph P3 contour:** `paintWorker.ts` draws a 1px stroke at the per-pixel `within_P3` transition. Present on all 6 graphs. Do not remove.

---

## Plan Mode Requirements

All structural changes require a Plan Mode gate before the first commit in that phase.

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

## Verification Commands

Run all before marking any phase complete:

```bash
pnpm tsc --noEmit          # zero TypeScript errors
pnpm build                  # production build passes
pnpm test                   # all vitest tests pass
pnpm lint                   # zero ESLint errors, zero warnings
```

Runtime checks after `pnpm dev`:
- No `console.error` in the browser console
- No unhandled promise rejections
- Light/dark toggle works without flash
- All 6 graphs render with P3 boundary contour
- Gamut badges appear on P3 swatches

---

## Responsive Contract

Desktop UX at `xl` (1280px+) is the floor. Never regress it.

| Breakpoint | Palette grid | 6 Graphs | Contrast panel |
|---|---|---|---|
| xl+ | Full grid | 2-col flex row | Beside graphs |
| lg (1024px) | Full grid | 3×2 stack | Below graphs |
| md (768px) | `overflow-x: auto` | 1-col stack | Below graphs |
| sm (640px) | `overflow-x: auto` | 1-col stack | Collapsed |

Graph knobs are `<input type="range">` — pointer events fire on touch natively.

**Desktop-only (do not mobilize in scope):** multi-key keyboard shortcuts, dense numeric color editor inputs.

---

## Persistence Keys

| Key | Store | Format |
|---|---|---|
| `palette` | `savedPalettesStore` | JSON array of `HexPalette` |
| `theme` | next-themes | `'light'` or `'dark'` |
| `p` (URL query param) | lz-string URL share | Compressed JSON, read-once on mount |

Schema-version the localStorage key (`_v1`, `_v2`) whenever the `HexPalette` shape changes.

---

## Key Libraries

| Library | Role |
|---|---|
| `colorjs.io` | Gamut checks, P3 rendering, color parsing |
| `chroma-js` | WCAG contrast, ΔE, interpolation helpers |
| `apca-w3` | APCA contrast (Lc values) |
| `comlink` | OffscreenCanvas worker bridge |
| `nanostores` + `@nanostores/persistent` | Reactive state + localStorage |
| `@base-ui/react` | Headless UI primitives |
| `lz-string` | URL palette compression |

---

## Out-of-Scope Items

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

## Upcoming Features (In Scope — Do Not Block)

These are planned and approved. Do not treat them as out-of-scope:

- **Export / copy outputs** — CSS custom properties, Tailwind token JSON, raw hex/oklch formats
- **Improved contrast tooling** — color blindness simulation, additional accessibility badges
- **Preset browser** — expanded built-in palettes with browseable UI
- **UI polish** — typography, spacing, component refinement, better responsive experience

---

## Cursor Composer Guidelines

This project is actively worked on in Cursor Composer, primarily for UI changes.

### Tailwind v4 in Cursor

- All utility classes use canonical CSS variable syntax — `bg-surface-default`, not `bg-[var(--color-surface-default)]`
- Color tokens live in `app/globals.css` under `@theme inline`. Do not inline color values in components.
- When adding a new UI element, reference existing token names from `globals.css` — don't invent new ones.

### Component work

- Prefer editing existing components over creating new files. New files require a clear reason.
- `components/ui/` is flat — no subdirectories. New headless primitives use **kebab-case** filenames.
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
