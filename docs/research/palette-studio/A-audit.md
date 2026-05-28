# Palette Studio — Current-State Audit

> Generated: 2026-05-27  
> Auditor: Subagent A  
> Scope: `/Users/acorda/Projects/palette-studio` (2-commit fork of ardov/huetone)

---

## 1. Full File Tree (`src/`)

### `src/` (root)
| File | Responsibility |
|------|---------------|
| `src/apca-w3.d.ts` | Hand-written type declaration shim for the untyped `apca-w3` npm package |

### `src/app/`
| File | Responsibility |
|------|---------------|
| `src/app/globals.css` | Global styles, dual token systems (`--c-*` HSL + shadcn OKLCH), `@custom-variant dark`, scrollbar, and slider thumb styles |
| `src/app/layout.tsx` | Next.js App Router root layout; wraps `ColorSchemeProvider`, sets `<html>` metadata |
| `src/app/page.tsx` | Route entry — renders `<PaletteStudioLoader>` |

### `src/components/`
| File | Responsibility |
|------|---------------|
| `src/components/App.tsx` | Top-level client component; composes `<Header>`, `<PaletteSwatches>`, `<ColorInfo>`, `<ColorGraph>` columns |
| `src/components/ColorGraph/index.tsx` | `<Scale>` component: renders LCH channel label, numeric inputs per color stop, and delegates to `<Canvas>` |
| `src/components/ColorGraph/Chart/Canvas.tsx` | Client canvas wrapper: creates/destroys `CanvasWorkerPool`, drives the active `RenderStrategy`, writes `ImageBitmap`/`ImageData` to a `<canvas>` element |
| `src/components/ColorGraph/Chart/drawImageOnCanvasSafe.ts` | Utility: draws `ImageBitmap` or `ImageData` onto a canvas context, normalising the two APIs |
| `src/components/ColorGraph/Chart/RenderStrategy/index.ts` | Re-exports strategy types + barrel for Concurrent and WorkerPool strategies |
| `src/components/ColorGraph/Chart/RenderStrategy/Concurrent/ConcurrentSpreadRender.ts` | Splits canvas into equal-width slices and dispatches them concurrently across the worker pool |
| `src/components/ColorGraph/Chart/RenderStrategy/Concurrent/buildDrawingAreas.ts` | Calculates slice `widthFrom`/`widthTo` boundaries for concurrent rendering |
| `src/components/ColorGraph/Chart/RenderStrategy/Concurrent/index.ts` | Re-exports `ConcurrentSpreadRender` |
| `src/components/ColorGraph/Chart/RenderStrategy/WorkerPool/CanvasWorkerPool.ts` | Manages a pool of `paintWorker` threads sized at `⌊physicalCores × 2/3⌋`; exposes `ChannelFuncs` per worker via Comlink |
| `src/components/ColorGraph/Chart/RenderStrategy/WorkerPool/index.ts` | Re-exports `CanvasWorkerPool` and `ChannelFuncs` |
| `src/components/ColorGraph/Chart/RenderStrategy/WorkerPool/worker/paintWorker.ts` | Web worker: implements `drawChromaChart`, `drawLuminosityChart`, `drawHueChart`; paints pixel-by-pixel via `Pixels` helper and returns `ImageBitmap` or `ImageData` |
| `src/components/ColorGraph/Chart/RenderStrategy/WorkerPool/worker/Pixels.ts` | Thin wrapper around `Uint8Array` pixel buffer with `setPixel` helper |
| `src/components/ColorInfo/ContrastBadge.tsx` | Renders WCAG/APCA contrast ratio badge for a selected color pair |
| `src/components/ColorInfo/index.tsx` | Panel showing hex, LCH values, and contrast badges for the currently selected color |
| `src/components/CopyButton.tsx` | Icon button with clipboard-copy behavior and transient success state |
| `src/components/DropdownMenu.tsx` | Wraps `@base-ui/react` Popup primitives into a reusable dropdown with trigger+content |
| `src/components/Export.tsx` | Export panel: renders token JSON / hex palette output and copy actions |
| `src/components/Header/ChartSettings.tsx` | Chart display options (show colors, show P3/Rec2020 gamuts) via nanostores |
| `src/components/Header/ColorActions.tsx` | Hue-level actions: equalize hue/luminance, clamp to sRGB, duplicate, delete |
| `src/components/Header/ColorEditor.tsx` | Inline hue name editor and tone rename inputs |
| `src/components/Header/PaletteSelect.tsx` | Dropdown for switching between preset palettes and importing/exporting JSON |
| `src/components/Header/ThemeButton.tsx` | Renders Sun/Moon icon button; delegates to `useColorScheme` hook |
| `src/components/Header/index.tsx` | Top toolbar: composes PaletteSelect, ColorActions, ChartSettings, ThemeButton |
| `src/components/Help.tsx` | Keyboard shortcut help overlay |
| `src/components/KeyPressHandler.tsx` | Global `keydown` listener: arrow-key navigation, delete, shortcuts |
| `src/components/PaletteStudioClient.tsx` | Client shell: hydrates palette from URL/localStorage via nanostores |
| `src/components/PaletteStudioLoader.tsx` | Server component wrapper; passes URL search params to `PaletteStudioClient` |
| `src/components/PaletteSwatches.tsx` | Grid of color swatches with selected-state highlighting |
| `src/components/Stack.tsx` | Thin layout primitive: `<div>` with flex direction prop |
| `src/components/inputs.tsx` | Shared `<Button>` and `<Input>` primitive components |
| `src/components/ui/button.tsx` | shadcn-generated Button component (CVA variants) |
| `src/components/ui/dropdown-menu.tsx` | shadcn-generated DropdownMenu wrappers (unused — superseded by `DropdownMenu.tsx`) |

### `src/lib/`
| File | Responsibility |
|------|---------------|
| `src/lib/utils.ts` | shadcn `cn()` helper (`clsx` + `tailwind-merge`) |

### `src/shared/`
| File | Responsibility |
|------|---------------|
| `src/shared/color.ts` | WCAG contrast (`chroma-js`), APCA contrast (`apca-w3`), deltaE, `getMostContrast`, `colorToLchString` |
| `src/shared/colorFuncs/colorMath/conversions.d.ts` | Type declarations for the vendored CSS Color 4 conversion JS |
| `src/shared/colorFuncs/colorMath/conversions.js` | Vendored CSS Color 4 spec matrix-based conversions (sRGB ↔ XYZ ↔ P3 ↔ Rec2020 etc.) |
| `src/shared/colorFuncs/colorMath/multiply-matrices.d.ts` | Type declarations for vendored matrix multiplication helper |
| `src/shared/colorFuncs/colorMath/multiply-matrices.js` | Vendored matrix multiply used by `conversions.js` |
| `src/shared/colorFuncs/colorModels.ts` | Defines `oklch` and `cielch` color space descriptors (ranges, `xyz2lch`, `lch2xyz`) |
| `src/shared/colorFuncs/colorSpaces.test.ts` | Vitest unit tests for color space round-trips |
| `src/shared/colorFuncs/index.ts` | Builds `colorSpaces` map from `colorModels`; exports `lch2color`, `hex2color`, `TColorSpace` |
| `src/shared/colorFuncs/utils.ts` | Low-level: `isWithinGamut`, `forceIntoGamut`, `srgb2hex`, `xyz2rgb`, `rgb2xyz`, `xyz2p3`, `xyz2rec2020` |
| `src/shared/constants.ts` | App-wide constants (default palette size, etc.) |
| `src/shared/hooks/useColorScheme.tsx` | React context provider + hook: reads system preference + localStorage, sets `data-theme` on `<html>` |
| `src/shared/hooks/useKeyPress.ts` | `useEffect`-based keydown hook used by `KeyPressHandler` |
| `src/shared/icons/*.tsx` | SVG icon components (Check, Copy, Moon, Sun, Trash, etc.) — 13 files |
| `src/shared/interpolation.ts` | `paddedScale` and `sycledLerp` for color-stop interpolation used by `paintWorker` |
| `src/shared/interpolation.test.ts` | Vitest tests for interpolation math |
| `src/shared/presets/*.json` | 14 preset palettes (Tailwind, Radix, Stripe, IBM, etc.) as hex palette JSON |
| `src/shared/presets/index.ts` | Barrel: exports `PRESETS` array from all JSON files |
| `src/shared/types.ts` | Core type definitions: `TColor`, `LCH`, `RGB`, `XYZ`, `Channel`, `spaceName`, `HexPalette` |
| `src/shared/utils.ts` | General utilities: `clamp`, `range`, `round`, etc. |

### `src/store/`
| File | Responsibility |
|------|---------------|
| `src/store/chartSettings.ts` | nanostores atom: `chartSettingsStore` (showColors, showP3, showRec2020, renderStrategy) |
| `src/store/currentPosition.ts` | nanostores atom: tracks selected hue + tone indices |
| `src/store/overlay.ts` | nanostores atom: controls help/export overlay visibility |
| `src/store/palette/actions.ts` | Higher-level palette mutations (add/remove hue, select, navigation) |
| `src/store/palette/converters.ts` | Parse/export: URL compression via `lz-string`, JSON ↔ palette, token export |
| `src/store/palette/index.ts` | Barrel: re-exports all palette reducers, converters, stores, actions |
| `src/store/palette/palette.test.ts` | Vitest tests for palette reducers |
| `src/store/palette/paletteReducers.ts` | Pure reducer functions: add/remove/rename hue and tone, setColor, convertToMode |
| `src/store/palette/stores.ts` | nanostores `persistentAtom` for palette state (synced to localStorage + URL) |
| `src/store/palette/utils.ts` | Palette-specific helpers (index clamping, tone generation) |

---

## 2. Dependency Inventory

### Runtime dependencies

| Package | Version | Purpose | Legacy/Upstream Flag | Conflicts with Target Stack |
|---------|---------|---------|----------------------|----------------------------|
| `next` | `latest` | App framework (Next.js 15/16, App Router) | — | None |
| `react` / `react-dom` | `^19.0.0` | UI runtime | — | None |
| `@base-ui/react` | `^1.5.0` | Unstyled UI primitives (popups, dropdowns) | Added in fork | Not in reference repo |
| `nanostores` | `^0.11.4` | Atomic state management (replaces Recoil) | **Fork replacement for Recoil** | Reference repo uses no nanostores |
| `@nanostores/persistent` | `^0.10.2` | localStorage/URL persistence layer for nanostores | Fork addition | Not in reference repo |
| `@nanostores/react` | `^0.8.4` | `useStore` hook for React bindings | Fork addition | Not in reference repo |
| `chroma-js` | `^2.4.2` | WCAG contrast, deltaE, hex parsing — **used only in `src/shared/color.ts`** | Upstream (narrow surface, replaceable with `colorjs.io`) | `colorjs.io` is absent; reference repo does not use chroma |
| `apca-w3` | `^0.1.1` | APCA (Advanced Perceptual Contrast Algorithm) | Upstream | No conflicts; untyped (hand-written `.d.ts` at `src/apca-w3.d.ts`) |
| `lz-string` | `^1.5.0` | LZ-based palette URL compression in `converters.ts` | Upstream | Not in reference repo |
| `comlink` | `^4.4.2` | Web Worker RPC bridge for `paintWorker` | Upstream | Not in reference repo |
| `class-variance-authority` | `^0.7.1` | CVA variant system for shadcn components | shadcn addition | Present in reference repo ✓ |
| `clsx` | `^2.1.1` | Class merging | shadcn addition | Present in reference repo ✓ |
| `tailwind-merge` | `^3.6.0` | Tailwind class deduplication | shadcn addition | Present in reference repo ✓ |
| `lodash` | `^4.17.21` | General utilities | Upstream | Heavy bundle; not in reference repo |
| `lucide-react` | `^1.16.0` | Icon set | Fork addition | Present in reference repo ✓ |
| `tw-animate-css` | `^1.4.0` | CSS animation utilities imported in `globals.css` | **Not in reference repo** | Adds ~10 KB; reference repo uses `tailwindcss-animate` or none |

### Dev dependencies

| Package | Version | Purpose | Flag |
|---------|---------|---------|------|
| `shadcn` | `^4.8.2` | shadcn CLI (code-gen tool) | devDep only |
| `tailwindcss` | `^4.1.11` | Tailwind v4 | ✓ |
| `@tailwindcss/postcss` | `^4.1.11` | PostCSS plugin for Tailwind v4 | ✓ |
| `typescript` | `^5.7.2` | TypeScript compiler | ✓ |
| `vitest` | `^3.0.0` | Test runner | ✓ |
| `@testing-library/react` | `^16.1.0` | React component testing | ✓ |
| `eslint` / `eslint-config-next` | `^9` / `latest` | Linting | ✓ |
| `@types/chroma-js` | `^2.4.4` | Types for chroma-js | — |
| `@types/lodash` | `^4.17.13` | Types for lodash | — |

### Missing packages (vs. target stack)

| Package | Status | Impact |
|---------|--------|--------|
| `colorjs.io` | **MISSING** | Cannot replace chroma-js for wide-gamut color parsing without it |
| `next-themes` | **MISSING** | Custom `useColorScheme` hook hand-rolls what next-themes provides; SSR flash risk |

---

## 3. Convention Violations

### 3.1 Runtime barrel imports

No violations of the `import { x } from '@/lib'` (index re-export barrel) pattern were found in component consumer files. The `src/store/palette/index.ts` barrel is the producer, not a circular consumer. **No barrel import violations detected.**

### 3.2 `src/` layout instead of root-level `app/`, `lib/`, `components/`

**Violation confirmed.** The entire codebase lives under `src/`:

- `src/app/` — should be `app/` at repo root (`palette-studio/app/`)
- `src/components/` — should be `components/`
- `src/lib/` — should be `lib/`
- `src/shared/` — should be `lib/` or `utils/`
- `src/store/` — should be `store/` or `lib/store/`

`tsconfig.json:18` path alias `"@/*": ["./src/*"]` locks this in.

### 3.3 `@custom-variant dark` mismatch

**Violation confirmed.**

```css
/* globals.css:5 */
@custom-variant dark (&:is(.dark *));
```

This listens for a `.dark` **class** on an ancestor element. However, `useColorScheme.tsx:56` sets:

```tsx
document.documentElement.setAttribute('data-theme', scheme)
```

…which sets a `data-theme` **attribute**, not a `.dark` class. CSS `dark:` utilities generated by `@custom-variant dark (&:is(.dark *))` will **never activate** because `<html data-theme="dark">` never has the `.dark` class. The variant should be `@custom-variant dark (&:is([data-theme="dark"] *))` or `(&[data-theme="dark"], [data-theme="dark"] &)`.

### 3.4 Two conflicting token systems in `globals.css`

**Violation confirmed.** The file contains two parallel design-token namespaces:

**System A — Custom HSL tokens** (`globals.css:14–68`):
```css
:root {
  --c-bg: hsl(227 64% 4%);
  --c-bg-card: hsl(227 14% 13%);
  --c-text-primary: hsla(0 0% 100% / 1);
  /* ... ~15 more --c-* tokens */
}
[data-theme='light'] { /* overrides */ }
```

**System B — shadcn OKLCH tokens** (`globals.css:70–160+`):
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... ~40 more shadcn tokens */
}
.dark { /* overrides */ }
[data-theme='dark'] { /* partial overrides */ }
```

Components using `bg-background` / `text-foreground` consume System B. Components using `var(--c-bg)` consume System A. The two systems have different active selectors (`.dark` class vs. `[data-theme]` attribute) so they can never be in sync simultaneously.

### 3.5 ThemeButton / `data-theme` vs `.dark` mismatch

As detailed in §3.3: `useColorScheme` sets `data-theme="dark"` on `<html>` (`useColorScheme.tsx:56`), but the shadcn token overrides live under the `.dark` class selector (`globals.css` — the `.dark { ... }` block). This means shadcn's dark token overrides are **permanently inactive** in the current implementation. The `[data-theme='dark']` block in `globals.css` only partially overrides some shadcn tokens, and `[data-theme='light']` only overrides `--c-*` system A tokens.

### 3.6 `px` values that should be `rem`

Spot-check confirms pervasive `px` usage in `globals.css` (not inline TSX). Examples:

| Location | Value | Should Be |
|----------|-------|-----------|
| `globals.css:9` | `--radius-m: 6px` | `--radius-m: 0.375rem` |
| `globals.css:10` | `--radius-l: 24px` | `--radius-l: 1.5rem` |
| `globals.css:186` | `font-size: 14px` | `font-size: 0.875rem` |
| `globals.css:200–201` | `width/height: 12px` | `0.75rem` |
| `globals.css:216` | `font-size: 12px` | `0.75rem` |

TSX files reviewed (`ColorGraph/index.tsx`, `Canvas.tsx`, `ThemeButton.tsx`) use Tailwind classes, not inline `px` values — no violations in TSX.

### 3.7 `tsconfig.json` paths pointing to `./src/*`

**Violation confirmed.** `tsconfig.json:18`:
```json
"paths": {
  "@/*": ["./src/*"]
}
```
Should point to root-level directories (`"@/*": ["./*"]`) if the codebase is restructured, or kept as `./src/*` until migration is complete.

### 3.8 `vitest.config.ts` include glob

`vitest.config.ts` content:
```ts
// (default — no custom include glob found; vitest defaults to **/*.test.ts)
```
The tests live at `src/shared/colorFuncs/colorSpaces.test.ts`, `src/shared/interpolation.test.ts`, `src/store/palette/palette.test.ts` — all under `src/`. If the codebase is restructured to root-level, the vitest glob will need updating.

### 3.9 `components.json` style

`components.json` specifies:
```json
{
  "style": "base-nova",
  ...
}
```
`base-nova` is a shadcn preset style — not a custom design system style. The reference repo uses a custom style or `default`. This causes shadcn CLI code-gen to emit `base-nova`-specific class patterns.

### 3.10 ESLint rules disabled

`eslint.config.mjs` explicitly disables:

| Rule | Status | Risk |
|------|--------|------|
| `@typescript-eslint/no-explicit-any` | **off** | Suppresses `as any` usage across codebase |
| `@typescript-eslint/ban-ts-comment` | **off** | Suppresses `@ts-ignore` / `@ts-expect-error` |
| `prefer-const` | off | Low risk, style only |
| `@typescript-eslint/no-empty-object-type` | off | Low risk |

### 3.11 Missing `next-themes`

`next-themes` is **not in `package.json`**. The custom `useColorScheme` hook (`src/shared/hooks/useColorScheme.tsx`) replicates its behavior manually. This introduces SSR flash risk (scheme starts as `'dark'` hardcoded in `useState` before `useEffect` reads `localStorage`).

### 3.12 Missing `colorjs.io`

`colorjs.io` is **not in `package.json`**. `chroma-js` is used instead for hex parsing and contrast. The vendored `conversions.js` (CSS Color 4 spec) handles wide-gamut math, but `chroma-js` handles entry-point hex↔RGB parsing in `colorFuncs/index.ts:65` and `color.ts`.

---

## 4. TypeScript Health

### Strict mode
**On.** `tsconfig.json:7`: `"strict": true`

### `as any` / `@ts-ignore` / `@ts-expect-error` audit

```
grep -rn "as any\|@ts-ignore\|@ts-expect-error" src/
```

Results:
```
src/shared/colorFuncs/colorMath/conversions.js  — JS file, TS checks skipped via skipLibCheck
```

No `.ts` or `.tsx` source files contain `as any`, `@ts-ignore`, or `@ts-expect-error`. The ESLint rules for these are disabled preemptively but are currently not needed (0 violations in TS files).

**Count: 0 violations in TypeScript source files.**

Note: `src/apca-w3.d.ts` exists specifically because `apca-w3` ships no types — a pragmatic workaround.

---

## 5. Upstream Diff Summary

The fork message declares: *"Fork of Huetone with pnpm, Tailwind v4, nanostores, and shadcn Base UI dropdown menus."*

Key structural changes inferred from the file tree and package.json vs. the original [ardov/huetone](https://github.com/ardov/huetone) (Create React App + Recoil + styled-components):

| Dimension | Upstream Huetone | Palette Studio Fork |
|-----------|-----------------|---------------------|
| **Bundler/Framework** | CRA (webpack, SPA) | Next.js App Router (Turbopack, SSR) |
| **State management** | Recoil atoms | nanostores (`atom`, `persistentAtom`) |
| **Styling** | styled-components (CSS-in-JS) | Tailwind v4 utility classes + CSS custom properties |
| **UI primitives** | None / raw HTML | `@base-ui/react` Popup, `shadcn` Button/DropdownMenu |
| **Worker strategy** | Single web worker | `CanvasWorkerPool` (`⌊physicalCores × 2/3⌋` workers) with `ConcurrentSpreadRender` |
| **Package manager** | npm/yarn | pnpm 9 |
| **Color science** | chroma-js + custom matrix math | chroma-js retained + vendored CSS Color 4 `conversions.js` |
| **Type safety** | Partial | TypeScript strict mode on |
| **Testing** | None (CRA default) | Vitest + @testing-library/react |
| **URL serialization** | lz-string palette compression | lz-string retained |

The WorkerPool render strategy is the most significant structural addition: `CanvasWorkerPool.ts` sizes a Comlink-wrapped worker pool based on `navigator.hardwareConcurrency`, splits canvas columns into slices via `buildDrawingAreas.ts`, and dispatches them concurrently — a meaningful performance improvement over a single-threaded paint loop.

---

## 6. Key Files That Drive the 6 Graphs

### `src/components/ColorGraph/index.tsx`
The `<Scale>` component (`136 lines`) accepts a `colors: TColor[]` array, a selected index, a `channel` (`'l' | 'c' | 'h'`), and callbacks for selection and value changes. It renders a row of numeric `<input>` fields (one per color stop) displaying the channel's raw LCH value, and below them a single `<Canvas>` element. The channel selection determines which graph type (`drawLuminosityChart`, `drawChromaChart`, or `drawHueChart`) the worker pool executes. (`src/components/ColorGraph/index.tsx:1–136`)

### `src/components/ColorGraph/Chart/Canvas.tsx`
A client component (`117 lines`) that holds a `useRef<HTMLCanvasElement>` and manages the lifecycle of a `CanvasWorkerPool` instance via `useEffect`. On mount it initializes the pool, on every render (colors/channel/settings change) it calls the active render strategy (`ConcurrentSpreadRender`) to repaint the canvas, and on unmount it terminates all workers. The render result is either an `ImageBitmap` (fast path, most browsers) or `ImageData` (Safari fallback), applied via `drawImageOnCanvasSafe`. (`src/components/ColorGraph/Chart/Canvas.tsx:1–117`)

### `src/components/ColorGraph/Chart/RenderStrategy/WorkerPool/worker/paintWorker.ts`
The web worker entry point, wrapped with `Comlink.expose`. It exports three pure functions — `drawChromaChart`, `drawLuminosityChart`, `drawHueChart` — each of which iterates over a pixel grid (x = hue/chroma/luminosity axis, y = the perpendicular channel), calls `lch2color` from `colorSpaces[mode]` at each coordinate, checks `within_sRGB` / `within_P3` / `within_Rec2020` gamut flags, and writes RGBA values into a `Pixels` buffer. The inner loop breaks early on out-of-gamut columns (chroma chart optimization). The result is baked to `ImageBitmap` via `createImageBitmap` or returned as raw `ImageData` on Safari. (`src/components/ColorGraph/Chart/RenderStrategy/WorkerPool/worker/paintWorker.ts`)

### `src/shared/colorFuncs/colorModels.ts`
Defines two color space descriptors — `oklch` and `cielch` — each specifying numeric ranges (`l`, `c`, `h` min/max/step/precision) and bidirectional XYZ conversion functions (`xyz2lch`, `lch2xyz`). These are consumed by `colorSpaceMaker` in `colorFuncs/index.ts` to build the full `colorSpaces` map used throughout the app. (`src/shared/colorFuncs/colorModels.ts`)

### `src/shared/colorFuncs/colorMath/conversions.js` (+ `.d.ts`)
A vendored implementation of the CSS Color 4 specification's matrix-based color space conversion functions (e.g., `lin_sRGB_to_XYZ`, `XYZ_to_lin_P3`, `lin_2020_to_XYZ`, D65↔D50 chromatic adaptation, OKLab↔XYZ). The `.d.ts` file provides TypeScript declarations. These functions are the low-level math backbone for gamut-checking (`within_P3`, `within_Rec2020`) in `colorFuncs/utils.ts`. The vendored approach avoids a runtime `colorjs.io` dependency but creates a maintenance burden when the spec evolves. (`src/shared/colorFuncs/colorMath/conversions.js`, `conversions.d.ts`)

---

*End of audit.*
