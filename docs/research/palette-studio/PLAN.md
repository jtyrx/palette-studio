# Palette Studio — Modernization Plan
**Gate 4 artifact · All gates 1–3 closed · Implementation gated on explicit approval per phase**

---

## Executive summary

Palette Studio is a 2-commit Next.js 16 / Tailwind v4 fork of Huetone with nanostores state, chroma-js color utilities, a hand-rolled theme provider, and two conflicting CSS token systems. The app is functionally complete and live on Vercel. Every gap is structural and architectural — no behavior needs to change, only how the code is organized and what libraries power it.

**Five most consequential decisions:**

1. **OKLCH everywhere, no HSL.** All `--c-*` HSL tokens are replaced with a three-tier OKLCH system matching the portfolio reference repo. Display-P3 variants via `color(display-p3 ...)`. DTCG-compatible naming convention throughout.
2. **Hybrid colorjs.io + chroma-js.** colorjs.io is primary (CSS Color 4 output, gamut detection, ΔE, color construction). chroma-js is retained only for the WCAG 2.1 ratio calculation (rounding risk against existing thresholds). Migration scope: ~10 lines out, ~13 in.
3. **P3 boundary as a first-class graph feature.** Every ColorGraph canvas render adds a visible P3 iso-contour (boundary stroke where `within_P3` transitions per pixel). This makes gamut structure legible without color science knowledge.
4. **APCA polarity restored.** `Math.abs()` removed from `apcaContrast()`. Signed `Lc` displayed in ColorInfo; absolute value retained only for threshold lookups. Two directions shown per pair so polarity is actionable.
5. **`src/` → root-level migration first.** Every subsequent phase assumes root-level paths. Do this atomically in Phase 1 before any other change.

---

## Phased migration plan

Each phase is independently shippable and must pass all verification commands before the next begins. Gate 5 fires once per phase.

---

### Phase 1 — Directory restructure: `src/` → root-level

**Why first:** Every subsequent phase touches file paths. Do this once, cleanly.

**Files touched:**
- Move `src/app/` → `app/`
- Move `src/components/` → `components/`
- Move `src/shared/` → `shared/`
- Move `src/store/` → `store/`
- Move `src/lib/` → `lib/`
- Move `src/hooks/` → `hooks/` (if present)
- Move `src/apca-w3.d.ts` → root or `types/`
- `tsconfig.json`: update `paths["@/*"]` from `["./src/*"]` to `["./*"]`
- `vitest.config.ts`: update `include` glob from `src/**` to `**` (excluding node_modules)
- `vitest.config.ts`: update alias `@` → `path.resolve(__dirname, '.')`
- `components.json`: update `tailwind.css` and all alias paths to remove `src/` prefix
- `next.config.ts`: no change needed (Turbopack root is `process.cwd()` already)

**Breaking-change checklist:**
- [ ] All `@/` imports resolve correctly after tsconfig update
- [ ] `pnpm build` passes (no missing module errors)
- [ ] `pnpm test` passes (vitest alias resolves)
- [ ] Comlink worker import paths in `RenderStrategy/WorkerPool` resolve correctly

**Verification:**
```bash
pnpm tsc --noEmit
pnpm build
pnpm test
pnpm lint
```

---

### Phase 2 — CSS token unification: single three-tier OKLCH globals.css

**What changes:**
- Remove `@import url('https://rsms.me/inter/inter.css')` — replace with `next/font/google` in `layout.tsx`
- Remove `@custom-variant dark (&:is(.dark *))` — dark mode via `[data-theme="dark"]` selector
- Remove all `--c-*` HSL tokens and the entire shadcn `base-nova` OKLCH block
- Write a single three-tier system:
  - **Tier 1 `@theme`**: spacing scale, radius tokens, raw OKLCH primitive color scale (surface, brand, neutral, error, success)
  - **Tier 2 `:root` + `[data-theme="dark"]`**: semantic aliases (`--color-surface-default`, `--color-text-primary`, `--color-border`, `--color-interactive`, etc.)
  - **Tier 3 `@theme inline`**: bridge to Tailwind utility classes
- Convert `components.json` style from `base-nova` to `default` (enables custom token wiring)
- All tokens named DTCG-compatible: `--color-<tier>-<role>-<variant>`
- Add Display-P3 variants: `--color-brand-p3: color(display-p3 ...)`

**Key new tokens to define:**
```css
/* Tier 1 — primitives */
@theme {
  --color-neutral-0: oklch(1 0 0);
  --color-neutral-950: oklch(0.1 0.01 240);
  --color-surface-dark: oklch(0.12 0.02 240);
  --color-surface-dark-card: oklch(0.18 0.02 240);
  /* ... full scale */
}

/* Tier 2 — semantic */
:root {
  --color-surface-default: var(--color-neutral-0);
  --color-text-primary: var(--color-neutral-950);
  --color-border-subtle: oklch(0.9 0 0 / 0.12);
  /* canvas graph tokens */
  --color-canvas-bg-1: oklch(0.85 0 0);
  --color-canvas-bg-2: oklch(0.94 0 0);
  --color-canvas-filter: none;
}

[data-theme="dark"] {
  --color-surface-default: var(--color-surface-dark);
  --color-text-primary: oklch(1 0 0);
  --color-canvas-filter: invert(1);
  /* ... */
}
```

**Breaking-change checklist:**
- [ ] All `var(--c-*)` references updated to new token names throughout components
- [ ] `Canvas.tsx` canvas filter still works in dark mode
- [ ] `DropdownMenu.tsx` and `button.tsx` shadcn components render correctly with custom tokens
- [ ] ThemeButton still toggles between light and dark visibly

**Verification:**
```bash
pnpm tsc --noEmit
pnpm build
pnpm dev   # visual check: light/dark toggle, graphs, swatches
```

---

### Phase 3 — next-themes: replace hand-rolled ColorSchemeProvider

**What changes:**
- `pnpm add next-themes`
- `app/layout.tsx`: wrap children in `<ThemeProvider attribute="data-theme" defaultTheme="dark" disableTransitionOnChange>`
- Keep `suppressHydrationWarning` on `<html>` (already present)
- `components/PaletteStudioClient.tsx`: remove `ColorSchemeProvider` wrapper
- `shared/colorScheme.tsx`: delete the file (or keep as deprecated and tree-shaken)
- All `useColorScheme()` callsites → `useTheme()` from `next-themes` (`theme`, `setTheme`)
- `ThemeButton.tsx`: update to use `useTheme()`; toggle between `'light'` and `'dark'`

**Critical:** Do this as a single atomic commit. Do not deploy intermediate state with no theme manager.

**Breaking-change checklist:**
- [ ] No flash of unstyled content (FOUC) on hard reload
- [ ] `[data-theme="dark"]` attribute applied before paint (next-themes injects an inline script)
- [ ] ThemeButton correctly reads and toggles `theme`
- [ ] Cross-tab theme sync works (next-themes handles this via storage event)
- [ ] `localStorage` key from old `ColorSchemeProvider` does not conflict (next-themes uses `theme` key by default)

**Verification:**
```bash
pnpm tsc --noEmit
pnpm build
pnpm dev   # hard reload in dark mode: no flash
```

---

### Phase 4 — px → rem: convert all static pixel measurements

**Scope:**
- All `px` values in `.tsx`, `.css`, and inline `style` objects
- Grid column definitions in `PaletteSwatches.tsx` (`64px`, `48px`, `32px` → `4rem`, `3rem`, `2rem`)
- Canvas dimensions if hardcoded
- Border widths, border-radius values, gap/padding in JSX inline styles
- `globals.css` radius tokens already use `px` — convert to `rem`

**Exceptions (do not convert):**
- `border: 1px` → keep as `1px` (sub-rem borders are intentional and standard)
- Canvas pixel dimensions that correspond to physical device pixels
- Media query breakpoints (Tailwind handles these)

**Tool:** `grep -rn "[0-9]\+px" components/ shared/ store/ app/ globals.css` to find all sites.

**Verification:**
```bash
pnpm tsc --noEmit
pnpm build
pnpm dev   # zoom to 200%: layout should scale correctly with rem
```

---

### Phase 5 — colorjs.io integration: replace chroma surface + graph engine

This is the highest-value technical phase. Two sub-tasks:

#### 5a — Replace chroma-js in `shared/color.ts`

**Seam (from Subagent D — high confidence):**

| Function | Current | Replacement |
|---|---|---|
| `wcagContrast` | `chroma.contrast(bg, text)` | **Keep chroma-js** (WCAG 2.1 ratio rounding risk) |
| `apcaContrast` | `chroma(hex).rgb()` for input | `new Color(hex).srgb` from colorjs.io |
| `deltaEContrast` | `chroma.deltaE(bg, text)` | **Keep chroma-js** (CIE76, stays as-is this pass — ΔE2000 upgrade deferred) |
| `valid` | `chroma.valid(hex)` | `Color.parse` try/catch from colorjs.io |
| `colorToLchString` | Manual string template | `color.toString({format: 'oklch'})` from colorjs.io |
| `inGamut` (new) | — | `color.inGamut('srgb')`, `color.inGamut('p3')` from colorjs.io |

**APCA sign fix (bundled in this phase):**
- Remove `Math.abs()` from `apcaContrast()` — return signed `Lc`
- Update `ContrastBadgeAPCA` to display signed value; use `Math.abs()` only for threshold lookups
- Update swatch overlay in `PaletteSwatches.tsx` to continue showing absolute value (signed is noise at swatch scale)

**Add `ContrastBadgeDeltaE` component:**
- Template from `ContrastBadgeAPCA` / `ContrastBadgeWCAG`
- Uses `chroma.deltaE(bg, text)` (CIE76) — **no library change this pass**
- Badge labels the metric explicitly as "ΔE CIE76" so users know the space
- Shows raw value + semantic label (< 1 imperceptible · 1–2 threshold · 2–10 perceivable · > 10 distinct)
- Shows comparison pair
- Added to `ColorInfo/index.tsx` as a third row in each `ContrastGroup`
- **Deferred:** ΔE2000 upgrade via colorjs.io — tracked as a future gate; note in docs that CIE76 understates perceptual distance for P3-range colors

#### 5b — Replace custom matrix math in graph workers

**Current:** `src/shared/colorFuncs/colorMath/conversions.js` (~200 lines vendored matrix math) powers the graph background renders in `paintWorker.ts`.

**Target:** Replace `lch2xyz`/`xyz2lch` pipeline calls with colorjs.io inside the worker.

```typescript
// paintWorker.ts — replace vendored math with colorjs.io
import Color from 'colorjs.io'

// Instead of: lch2color([l, c, h]) → hex
const color = new Color('oklch', [l / 100, c, h])
const hex = color.to('srgb').toString({format: 'hex'})
const inP3 = color.inGamut('p3')
const inSRGB = color.inGamut('srgb')
```

**P3 boundary contour in ColorGraph canvases:**
- In `paintWorker.ts`, the per-pixel `within_P3` is already computed (or trivially derived from `inGamut('p3')`)
- Draw a boundary stroke: when adjacent pixels differ in `within_P3` state, paint a 1-pixel white stroke (or contrasting color) at the transition
- This creates a visible P3 iso-contour on all 6 charts without requiring separate geometry

**Worker compatibility:** colorjs.io is Worker-safe for `new Color('oklch', [...])` and hex parsing (no DOM). If Turbopack fails to bundle it, add `transpilePackages: ['colorjs.io']` to `next.config.ts`.

**Breaking-change checklist:**
- [ ] `pnpm build` passes with colorjs.io in worker bundle
- [ ] Graphs render correctly (colors look right — some intentional visual improvement due to OKLCH interpolation)
- [ ] P3 boundary contour visible on all 6 graphs
- [ ] `wcagContrast` still returns values matching WCAG 2.1 spec (chroma.contrast retained)
- [ ] `ContrastBadgeDeltaE` renders CIE76 value with "ΔE CIE76" label (no change to deltaEContrast function)
- [ ] Signed `Lc` displays correctly in ColorInfo

**Verification:**
```bash
pnpm tsc --noEmit
pnpm build
pnpm test
pnpm dev   # graphs render, P3 contour visible, APCA sign correct, ΔE CIE76 badge appears in ColorInfo
```

---

### Phase 6 — Gamut badges: screen badge + per-swatch badge

**Screen-level palette gamut badge (Header):**
- **What it shows:** Most expansive gamut occupied by *any swatch in the current palette* (`within_sRGB` / `within_P3` / `within_Rec2020` booleans already on `TColor`)
- **Placement:** Standalone chip after the overlay `ControlGroup`, before `ChartSettings` — not inside any `ControlGroup` border
- **Visual states:** Three chips always rendered; the most expansive one highlighted. `sRGB | P3 | Rec2020`. When palette is sRGB-only, only the sRGB chip is active.
- **Implementation:** Computed from `paletteStore` — `computed(paletteStore, p => p.colors.flat().some(c => !c.within_sRGB && c.within_P3) ? 'p3' : ...)`
- **Note:** This is a palette-level indicator, not a viewer screen capability badge. (Original plan assumed `window.matchMedia`; user clarified the palette occupancy model is preferred.)

**Per-swatch gamut badge (PaletteSwatches):**
- **Render rule:** Only when `!color.within_sRGB && color.within_P3` (P3 only) or `!color.within_P3` (Rec2020+)
- **Data source:** `TColor.within_sRGB`, `TColor.within_P3`, `TColor.within_Rec2020` booleans — already computed, no new colorjs.io calls in the render path
- **Placement:** Top-right corner of each swatch cell
- **Visual:** Pill badge — `P3` or `Rec2020`. `font-size: 0.625rem`, `padding: 0.125rem 0.25rem`, `border-radius: 0.25rem`
- **Replace** the existing `ColorEditor.tsx` red-text convention for out-of-sRGB colors with the explicit gamut chip

**Breaking-change checklist:**
- [ ] `TColor.within_sRGB/P3/Rec2020` confirmed present as getter accessors in `colorFuncs/index.ts:64-69` — no changes needed
- [ ] Badge does not appear for purely sRGB swatches
- [ ] Header badge updates reactively when palette changes
- [ ] `ColorEditor.tsx` red-text suppressed when gamut chip present

**Verification:**
```bash
pnpm tsc --noEmit
pnpm build
pnpm dev   # load a palette with P3 colors; badge appears per swatch and in header
```

---

### Phase 7 — Responsive layout: medium-scope pass

**Breakpoint behavior (from Subagent E):**

| Viewport | Palette grid | 6 Graphs | Contrast panel | Header |
|---|---|---|---|---|
| xl+ (floor) | Unchanged | 2-col flex row | Beside graphs | Full |
| lg (1024px) | Unchanged | Stack to 3×2 | Below graphs | Full |
| md (768px) | `overflow-x: auto`, preserve min-width | 1-col stack | Below graphs | Controls wrap |
| sm (640px) | `overflow-x: auto` | 1-col stack | Below graphs | Secondary controls hidden |
| <sm | `overflow-x: auto` | 1-col stack | Collapsed | Minimal |

**Key implementation notes:**
- `App.tsx` already has `max-[860px]:flex-col` — extend this with proper breakpoint utilities
- Graph `gridTemplateColumns` is set via inline `style` — requires JSX-level conditional for responsive override
- Graph knobs are `<input type="range">` — pointer events fire on touch natively; no drag rewrite needed
- Stepper fallback for very narrow viewports: tap to select a point, arrow keys to adjust (no new drag logic)
- Contrast panel: `grid-cols-3` → `sm:grid-cols-1`

**What stays desktop-only (documented, not shipped):**
- Multi-key keyboard shortcuts
- Dense numeric input fields in the color editor
- Side-by-side comparison layout at < 640px

**Verification:**
```bash
pnpm build
pnpm dev   # DevTools mobile simulation at 375px, 768px, 1024px
```

---

### Phase 8 — ESLint + TypeScript tightening

**What changes:**
- `eslint.config.mjs`: restore `prefer-const: 'error'`, `@typescript-eslint/no-explicit-any: 'error'`, `@typescript-eslint/ban-ts-comment: 'error'`
- `tsconfig.json`: consider adding `noUncheckedIndexedAccess: true` (expect 30–60 errors in paint worker loops; fix with proper guards)
- Run `pnpm lint --fix` first; fix remaining manually
- Remove all `// @ts-ignore` and `as any` casts found in audit

**Verification:**
```bash
pnpm tsc --noEmit
pnpm lint   # zero errors, zero warnings
```

---

## Feature documentation index

Full feature documentation in [C-features.md](./C-features.md):
- §1: The 6 graphs explained (designer-readable)
- §2: Color computation pipeline (drag → nanostores → lch2color → hex → canvas pixel)
- §3: APCA + WCAG dual contrast model (Lc thresholds, badge components)
- §4: Gamut badge specification (screen + per-swatch)

---

## Gamut badge specification (final)

### Screen-level palette gamut badge
- **Data source:** `computed(paletteStore, ...)` — palette-level, not screen capability
- **Logic:** `colors.flat().some(c => !c.within_sRGB)` → P3 or Rec2020 active
- **Placement:** Standalone after overlay ControlGroup, before ChartSettings in `Header/index.tsx`
- **States:** `sRGB` · `P3` · `Rec2020` — most expansive highlighted

### Per-swatch gamut badge
- **Render rule:** `!within_sRGB && within_P3` → show `P3`; `!within_P3` → show `Rec2020`
- **Data:** `TColor` booleans (already computed in color model)
- **Visual:** `0.625rem` text, `0.25rem 0.5rem` padding, `0.25rem` radius, corner placement

### P3 boundary in ColorGraph canvases
- **Method:** Per-pixel `inGamut('p3')` in `paintWorker.ts`; draw 1px stroke at `within_P3` transition
- **All 6 graphs** show the contour — makes gamut structure legible at a glance

---

## Library decision

```
RECOMMENDATION: hybrid (colorjs.io primary, chroma-js for WCAG ratio only)
CONFIDENCE: high
ONE-PARAGRAPH RATIONALE: colorjs.io directly replaces all chroma usage except the
WCAG 2.1 ratio (chroma.contrast), which carries rounding-risk against existing badge
thresholds that are tested and live. colorjs.io adds gamut detection, ΔE2000, CSS
Color 4 output (oklch(), color(display-p3 ...)), and Worker-safe color construction
— none of which chroma-js supports. The paintWorker.ts uses no chroma-js at all;
its vendored matrix math is a separate cleanup that colorjs.io also replaces. Total
migration is ~10 lines out, ~13 in.
TOP RISK IF I'M WRONG: WCAG ratio values from chroma.contrast may diverge from a
future colorjs.io implementation due to floating-point rounding; any test thresholds
keyed to WCAG ratios would need recalibration if the holdout is later removed.

SEAM DEFINITION:
  colorjs.io owns: gamut detection (inGamut), hex→sRGB array for APCA input,
                   hex validation, CSS Color 4 string output, color construction in workers
  chroma-js retains: WCAG 2.1 contrast ratio (chroma.contrast) only
```

_Accepted: 2026-05-27_

---

## Responsive layout proposal

See [E-responsive.md](./E-responsive.md) for full breakpoint table and layout prose.

**Scope confirmed: medium.** Palette grid gets horizontal scroll at md. Graphs stack vertically below lg. Desktop UX at xl+ is the floor. What stays desktop-only is documented explicitly, not silently dropped.

---

## Risks and open questions resolved

| Risk | Resolution |
|---|---|
| Dark-mode flash during next-themes switch | Phase 3 is a single atomic commit; never deploy intermediate |
| colorjs.io in Comlink worker bundle | Add `transpilePackages: ['colorjs.io']` to next.config.ts if Turbopack fails |
| OKLCH gamut mismatch in graph gradient | Accepted as intentional visual improvement |
| shadcn base-nova token conflicts | Run `pnpm shadcn diff` after style change; patch missing tokens manually |
| noUncheckedIndexedAccess in Phase 8 | Expect 30–60 errors; fix systematically, not with `!` assertions |
| ΔE metric label missing | Badge explicitly shows "ΔE CIE76"; ΔE2000 upgrade is a deferred gate |
| APCA polarity | Fixed in Phase 5; signed display in ColorInfo; absolute in swatch overlay |

---

## `claude init` readiness criteria

All of these must be true before `claude init` runs:

- [ ] `tsc --noEmit` — zero errors
- [ ] `pnpm build` — passes
- [ ] `pnpm test` — passes
- [ ] `pnpm lint` — zero errors, zero warnings
- [ ] `AGENTS.md` reviewed and committed
- [ ] No unused dependencies (`pnpm ls` audit)
- [ ] Runtime clean in `pnpm dev` (no `console.error`, no unhandled promise rejections)

---

## Naming proposals

| Current | Proposed | Reason |
|---|---|---|
| `shared/colorScheme.tsx` | Delete | Replaced by next-themes |
| `shared/colorFuncs/colorMath/conversions.js` | Delete | Replaced by colorjs.io in Phase 5 |
| `hooks/useColorWorkbench.ts` | New file | Wraps nanostores palette state in a stable hook API |
| `components/providers/ColorWorkbenchProvider.tsx` | New file | Client Component boundary, houses ThemeProvider + nanostores mount |
| `ContrastBadgeDeltaE` | New component | Follows ContrastBadgeAPCA/WCAG pattern |

No files renamed — only additions and deletions.
