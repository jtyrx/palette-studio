# Palette Studio — Convention Alignment Plan

> Subagent B output · 2026-05-27

---

## 1. Side-by-side Comparison Table

| Concern | Current approach | Target approach | Cost | Reasoning |
|---|---|---|---|---|
| **File layout** | `src/app/`, `src/components/`, `src/store/`, `src/shared/` | Root-level `app/`, `components/`, `lib/`, `hooks/`, `shared/`, `store/` | M | Aligns with Next.js App Router convention; enables future monorepo split |
| **Theming** | Hand-rolled `ColorSchemeProvider` in `src/shared/hooks/useColorScheme.tsx` — manual `localStorage` + `matchMedia` listeners, sets `data-theme` on `<html>` | `next-themes` with `attribute="data-theme"`, `defaultTheme="dark"` | S | next-themes handles SSR flash, storage, system pref sync, cross-tab out of the box |
| **CSS tokens** | Two systems in one file: custom `--c-*` HSL tokens + shadcn OKLCH `--background`/`--foreground`; `@custom-variant dark (&:is(.dark *))` (wrong selector); CDN Inter import | Single three-tier OKLCH system (`@theme` → `:root` → `[data-theme]`); `next/font` for Inter; fixed `@custom-variant` | L | Eliminates token drift, enables P3 gamut, removes CDN network request on critical path |
| **State management** | `nanostores` + `@nanostores/persistent` + `@nanostores/react` | Keep nanostores (no Recoil to remove). `@nanostores/persistent` key names may need updating after restructure | S | No replacement needed; keep and verify persistence keys survive rename |
| **Color library** | `chroma-js` used in 3 places: hex validation, WCAG contrast, deltaE, canvas paint worker scale | `colorjs.io` for hex validation + deltaE + P3 math; keep `chroma-js` only for `chroma.contrast()` WCAG ratio (or replace with `apca-w3` already present) | M | `colorjs.io` handles OKLCH/P3 natively; reduces chroma-js surface to 0–1 functions |
| **Persistence** | `@nanostores/persistent` keying off `localStorage` with key `colorScheme` (in useColorScheme) + palette-related keys | Remove `colorScheme` key (next-themes owns it via `theme` key); audit remaining store keys for collisions | S | next-themes uses `theme` by default — no overlap if old key `colorScheme` is cleared |
| **Routing** | `src/app/` — single page, `page.tsx` renders `PaletteStudioClient` | `app/page.tsx` after restructure; no route changes needed | S | Structural only |
| **Import policy** | `@/*` alias resolves to `./src/*` in tsconfig and vitest | After move: `@/*` → `./` (root); `components.json` `css` path updated | S | One-line change each in tsconfig, vitest.config.ts, components.json |
| **TypeScript strictness** | `strict: true` but `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` absent | Add `noUncheckedIndexedAccess: true`; re-enable via ESLint `no-explicit-any` | M | Several `any` usages in color worker and store reducers will surface |
| **ESLint rules** | `no-explicit-any: off`, `ban-ts-comment: off`, `prefer-const: off`, `no-empty-object-type: off` | Re-enable all four; fix violations at type boundaries | M | ~20–40 violations expected based on chroma/store patterns |
| **shadcn config** | `style: "base-nova"`, CSS path `src/app/globals.css`, alias `@/lib/utils` | `style: "custom"` (OKLCH tokens authored by hand); CSS path `app/globals.css`; aliases updated | S | base-nova imports its own token set which conflicts with unified OKLCH layer |

---

## 2. Phased Migration Plan

### Phase 1 — Directory restructure: `src/` → root-level

**Files touched:** all files under `src/`; `tsconfig.json`, `vitest.config.ts`, `components.json`, `next.config.ts`, `postcss.config.mjs`

**Packages added/removed:** none

**Steps:**
1. `mkdir -p app components lib hooks shared store`
2. `cp -r src/app/* app/`, `cp -r src/components/* components/`, etc.
3. Update `tsconfig.json` paths: `"@/*": ["./*"]`
4. Update `vitest.config.ts` alias: `'@': path.resolve(__dirname, '.')`; update `include`: `['**/*.{test,spec}.{ts,tsx}']`
5. Update `components.json`: `"css": "app/globals.css"`, aliases drop `src/`
6. Delete `src/`

**Breaking-change checklist:**
- [ ] All `@/` imports still resolve
- [ ] `next/font` Geist import unchanged (it was already in layout.tsx)
- [ ] Comlink worker import paths resolve (`new Worker(new URL('../worker/paintWorker.ts', import.meta.url))`)
- [ ] `@nanostores/persistent` store keys unchanged (keys are string literals, not paths)

**Verification:**
```sh
pnpm build
tsc --noEmit
pnpm lint
pnpm test
```

---

### Phase 2 — CSS token unification: single three-tier OKLCH `globals.css`

**Files touched:** `app/globals.css` (rewrite), `app/layout.tsx` (remove CDN import if any)

**Packages added/removed:** none (Tailwind v4 already present)

**Steps:**
1. Replace `@import url('https://rsms.me/inter/inter.css')` with `next/font` (already done in layout.tsx — just remove the CDN line)
2. Replace `@custom-variant dark (&:is(.dark *))` with `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))`
3. Consolidate `--c-*` HSL tokens + shadcn `--background`/`--foreground` into unified OKLCH names (see template in §3)
4. Move shadcn dark overrides from `[data-theme='dark']` block into new unified block
5. Remove orphaned `[data-theme='light']` block that redefines `--c-*` only (light is now `:root` default)

**Breaking-change checklist:**
- [ ] All component `var(--c-*)` usages updated to new `--color-*` names
- [ ] shadcn components using `--background`/`--foreground` still work (aliased in `@theme inline`)
- [ ] Dark mode renders correctly in browser

**Verification:**
```sh
pnpm build
pnpm lint
# Visual: open localhost:3000, toggle theme, check canvas colors
```

---

### Phase 3 — `next-themes` integration: replace `ColorSchemeProvider`

**Files touched:** `app/layout.tsx`, `app/PaletteStudioClient.tsx`, `shared/hooks/useColorScheme.tsx`

**Packages added:** `next-themes`
**Packages removed:** none (keep `useColorScheme` as thin wrapper until all callsites migrated)

**Steps:**
1. `pnpm add next-themes`
2. Wrap `<html>` in `layout.tsx` with `<ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem disableTransitionOnChange>`
3. Remove `<ColorSchemeProvider>` from `PaletteStudioClient.tsx`
4. Replace `useColorScheme` import at all callsites with `useTheme` from `next-themes`
   - `const [scheme, toggle] = useColorScheme()` → `const { theme, setTheme } = useTheme()`
   - Toggle: `setTheme(theme === 'dark' ? 'light' : 'dark')`
5. Delete `shared/hooks/useColorScheme.tsx`
6. `suppressHydrationWarning` stays on `<html>` (already present)

**Breaking-change checklist:**
- [ ] No dark-mode flash on hard reload (next-themes injects blocking script)
- [ ] `localStorage` key changes from `colorScheme` → `theme`; add migration shim if user persistence matters
- [ ] `document.documentElement.setAttribute('data-theme', ...)` no longer called manually

**Verification:**
```sh
pnpm build
tsc --noEmit
# Visual: hard-reload in dark, switch to light, reload — no flash
```

---

### Phase 4 — `px` → `rem` conversion

**Files touched:** `app/globals.css`, any component files with inline `px` values (~53 occurrences)

**Packages added/removed:** none

**Steps:**
1. In `globals.css`: `--radius-m: 6px` → `0.375rem`; `--radius-l: 24px` → `1.5rem`
2. Run: `grep -rn '[0-9]px' app/ components/ shared/ --include='*.tsx' --include='*.ts' --include='*.css'`
3. Convert each: divide by 16; use `rem`. Exception: `1px` borders stay as `1px` (intentional hairline)
4. Canvas pixel math in `paintWorker.ts` uses raw pixel counts for `ImageData` — do **not** convert those

**Breaking-change checklist:**
- [ ] Border hairlines (`1px solid`) intentionally kept as `1px`
- [ ] Canvas `ImageData` sizing untouched
- [ ] Radius tokens match design intent

**Verification:**
```sh
pnpm build
pnpm lint
```

---

### Phase 5 — `colorjs.io` integration

**Files touched:** `shared/color.ts`, `shared/colorFuncs/index.ts`, `components/ColorGraph/Chart/RenderStrategy/WorkerPool/worker/paintWorker.ts`

**Packages added:** `colorjs.io`
**Packages removed:** `chroma-js` (conditional — keep if WCAG contrast ratio kept there)

**Steps:**
1. `pnpm add colorjs.io`
2. In `shared/colorFuncs/index.ts`: replace `chroma(hex).rgb()` with `new Color(hex).to('srgb').coords`; replace `chroma.valid(hex)` with `Color.parse(hex)` try/catch or regex
3. In `shared/color.ts`:
   - `wcagContrast`: replace `chroma.contrast()` with `apca-w3` (already a dep) or `colorjs.io` `contrast(c1, c2, 'wcag21')`
   - `apcaContrast`: already using `apca-w3` — no change needed
   - `deltaE`: replace `chroma.deltaE()` with `c1.deltaE(c2, '2000')`
4. In `paintWorker.ts`: replace chroma scale interpolation with `colorjs.io` `Color.range()` (supports OKLCH interpolation natively — better gamut mapping for graph)
5. If all chroma usages replaced: `pnpm remove chroma-js && remove @types/chroma-js`

**Breaking-change checklist:**
- [ ] WCAG contrast values match old `chroma.contrast()` output (both implement WCAG 2.1 — should be identical)
- [ ] deltaE 2000 values may differ from chroma's deltaE 76 default — verify graph rendering
- [ ] Canvas worker bundle size change (comlink + colorjs.io vs chroma-js)
- [ ] Worker import: `colorjs.io` is ESM — verify Webpack/Turbopack bundles it into the worker chunk

**Verification:**
```sh
pnpm build
pnpm test
tsc --noEmit
# Visual: open color graph, verify gradient renders correctly
```

---

### Phase 6 — DTCG token format

**Files touched:** `app/globals.css` (token renames), all components using `var(--c-*)` or `var(--background)` etc.

**Packages added/removed:** none

**Steps:**
1. Final token renames to DTCG-compatible names (see §3 template for naming pattern)
2. `--c-bg` → `--color-surface-default`; `--c-text-primary` → `--color-text-primary`; etc.
3. Add `$type` and `$description` as CSS comments above each token group (DTCG spec allows comment annotations in source; actual `$type`/`$description` metadata lives in a companion `tokens.json` if tooling requires it)
4. Global find-replace across component files

**Breaking-change checklist:**
- [ ] No `var(--c-*)` references remain
- [ ] `shadcn` re-init not needed (token names are in `globals.css`, not `components.json` schema)

**Verification:**
```sh
grep -r 'var(--c-' app/ components/ shared/ | wc -l  # must be 0
pnpm build
pnpm lint
```

---

### Phase 7 — ESLint + TypeScript tightening

**Files touched:** `eslint.config.mjs`, `tsconfig.json`, various files with `any` / `@ts-ignore`

**Packages added/removed:** none

**Steps:**
1. In `tsconfig.json`: add `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`
2. In `eslint.config.mjs`: remove the 6 disabled rules (or set to `'error'`)
3. Run `pnpm lint` and `tsc --noEmit`; fix violations:
   - Color worker type boundaries: add explicit `ImageData`, `OffscreenCanvas` types
   - Store reducers: replace `any` with typed `PaletteAction` union
   - `@ts-ignore` in `apca-w3.d.ts`: replace with proper declaration file
4. Re-enable `prefer-const` last (most churn, lowest value)

**Breaking-change checklist:**
- [ ] No runtime behavior changes — type-only fixes
- [ ] `apca-w3.d.ts` must export correct types

**Verification:**
```sh
tsc --noEmit
pnpm lint
pnpm build
pnpm test
```

---

## 3. `globals.css` Template

```css
/* ============================================================
   Palette Studio — globals.css (post-migration target)
   Three-tier OKLCH token system · Tailwind v4 · next-themes
   ============================================================ */

@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';

/* ── Tier 0: dark: variant resolves via data-theme attribute ─ */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

/* ── Tier 1: Primitives — @theme generates utilities + vars ── */
@theme {
  /* Spacing base (1 unit = 0.0625rem = 1px equivalent) */
  --spacing: 0.0625rem;

  /* Radius primitives */
  --radius-m: 0.375rem;  /* 6px */
  --radius-l: 1.5rem;    /* 24px */

  /* Primitive OKLCH color scale — Palette Studio indigo/slate */
  /* $type: color */
  --color-indigo-950: oklch(0.18 0.065 264);
  --color-indigo-900: oklch(0.22 0.075 264);
  --color-indigo-800: oklch(0.28 0.085 264);
  --color-indigo-100: oklch(0.93 0.018 264);
  --color-indigo-50:  oklch(0.97 0.008 264);

  --color-slate-950: oklch(0.15 0.025 255);
  --color-slate-900: oklch(0.20 0.030 255);
  --color-slate-800: oklch(0.28 0.025 255);
  --color-slate-200: oklch(0.88 0.010 255);
  --color-slate-100: oklch(0.94 0.006 255);
  --color-slate-50:  oklch(0.97 0.004 255);

  --color-white: oklch(1 0 0);
  --color-black: oklch(0 0 0);

  --color-error-dark:  oklch(0.53 0.22 27);   /* replaces hsl(0 100% 50%) */
  --color-error-light: oklch(0.43 0.18 27);   /* replaces hsl(0 75% 37%) */
  --color-success-dark:  oklch(0.72 0.25 145); /* replaces hsl(120 94% 49%) */
  --color-success-light: oklch(0.52 0.18 145); /* replaces #1f881f */
}

/* ── Tier 2: Semantic aliases — light-mode defaults ─────────── */
/* $type: color · light theme is `:root` default (dark is SSR initial) */
:root {
  /* Surface */
  /* $description: Page background */
  --color-surface-default: var(--color-white);
  /* $description: Card / panel background */
  --color-surface-raised: var(--color-indigo-50);

  /* Text */
  /* $description: Primary body text */
  --color-text-primary: oklch(0.10 0 0);
  /* $description: Secondary / subdued text */
  --color-text-secondary: oklch(0 0 0 / 0.64);
  /* $description: Hint / placeholder text */
  --color-text-hint: oklch(0 0 0 / 0.40);
  --color-text-error: var(--color-error-light);
  --color-text-success: var(--color-success-light);

  /* Interactive */
  --color-btn-bg: oklch(0 0 0 / 0.06);
  --color-btn-bg-hover: oklch(0 0 0 / 0.12);
  --color-btn-bg-active: oklch(0 0 0 / 0.20);

  /* Structural */
  --color-border-default: oklch(0 0 0 / 0.10);
  --color-scrollbar: oklch(0 0 0 / 0.12);

  /* Canvas (color graph) */
  --canvas-filter: none;
  --color-canvas-1: oklch(0.85 0 0);
  --color-canvas-2: oklch(0.94 0 0);

  /* ── shadcn bridge (DTCG names → shadcn var names) ── */
  --background: var(--color-surface-default);
  --foreground: var(--color-text-primary);
  --card: var(--color-surface-raised);
  --card-foreground: var(--color-text-primary);
  --popover: var(--color-surface-raised);
  --popover-foreground: var(--color-text-primary);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: var(--color-border-default);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: var(--radius-m);
  --sidebar: var(--color-surface-raised);
  --sidebar-foreground: var(--color-text-primary);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: var(--color-border-default);
  --sidebar-ring: oklch(0.708 0 0);
}

/* ── Tier 2 Dark overrides — data-theme="dark" ───────────────── */
/* next-themes sets this on <html>; @custom-variant dark propagates it */
[data-theme="dark"] {
  /* Surface */
  --color-surface-default: oklch(0.18 0.065 264); /* ~hsl(227 64% 4%) */
  --color-surface-raised:  oklch(0.24 0.028 264); /* ~hsl(227 14% 13%) */

  /* Text */
  --color-text-primary: oklch(1 0 0);
  --color-text-secondary: oklch(1 0 0 / 0.72);
  --color-text-hint: oklch(1 0 0 / 0.50);
  --color-text-error: var(--color-error-dark);
  --color-text-success: var(--color-success-dark);

  /* Interactive */
  --color-btn-bg: oklch(1 0 0 / 0.12);
  --color-btn-bg-hover: oklch(1 0 0 / 0.16);
  --color-btn-bg-active: oklch(1 0 0 / 0.24);

  /* Structural */
  --color-border-default: oklch(1 0 0 / 0.10);
  --color-scrollbar: oklch(1 0 0 / 0.16);

  /* Canvas */
  --canvas-filter: invert(1);
  --color-canvas-1: oklch(0.85 0 0);
  --color-canvas-2: oklch(0.94 0 0);

  /* shadcn overrides */
  --background: var(--color-surface-default);
  --foreground: var(--color-text-primary);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 0.10);
  --input: oklch(1 0 0 / 0.15);
  --ring: oklch(0.556 0 0);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 0.10);
  --sidebar-ring: oklch(0.439 0 0);
}

/* ── Display-P3 wide-gamut variants ──────────────────────────── */
@media (color-gamut: p3) {
  :root {
    --color-text-error: color(display-p3 0.72 0.12 0.08);
    --color-text-success: color(display-p3 0.12 0.53 0.12);
  }
  [data-theme="dark"] {
    --color-text-error: color(display-p3 0.95 0.15 0.10);
    --color-text-success: color(display-p3 0.20 0.90 0.20);
  }
}

/* ── Tier 3: Tailwind bridge — inline vars consumed as utilities */
@theme inline {
  --color-surface: var(--color-surface-default);
  --color-surface-card: var(--color-surface-raised);
  --color-text: var(--color-text-primary);
  --color-text-muted: var(--color-text-secondary);
  --color-border: var(--color-border-default);
}

/* ── Base resets ─────────────────────────────────────────────── */
@layer base {
  * {
    border-color: var(--color-border-default);
  }
  body {
    background-color: var(--color-surface-default);
    color: var(--color-text-primary);
  }
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
}
```

---

## 4. `next-themes` Integration Plan

### Placement in `layout.tsx`

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn('h-full', 'font-sans', geist.variable)}>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider
          attribute="data-theme"   // sets [data-theme="dark"] on <html>
          defaultTheme="dark"      // matches current SSR default
          enableSystem             // respects prefers-color-scheme
          disableTransitionOnChange // prevents flash during theme switch
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

`ThemeProvider` goes **inside** `<body>`, **after** the font wrapper (font class is on `<html>`, not inside the provider). `suppressHydrationWarning` stays on `<html>` — next-themes injects a blocking script before hydration that writes `data-theme`, so React's DOM mismatch warning is expected and suppressed.

### `attribute="data-theme"` vs `attribute="class"`

Use `attribute="data-theme"`. Reasons:
- Matches the reference repo pattern
- Compatible with `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))`
- Works for scoped per-section theming (e.g., a dark card on a light page)
- Current globals.css already keys off `[data-theme='dark']`

### What to delete from `shared/hooks/useColorScheme.tsx`

Delete the entire file. It contains:
- `ColorSchemeProvider` — replaced by `<ThemeProvider>`
- `useColorScheme` — replaced by `useTheme()` from `next-themes`
- Manual `localStorage` read/write of key `colorScheme`
- Manual `matchMedia` listeners
- Manual `document.documentElement.setAttribute('data-theme', scheme)`

All of these are handled by next-themes internally.

### What to delete from `PaletteStudioClient.tsx`

Remove the `ColorSchemeProvider` import and wrapper:

```tsx
// Before
import { ColorSchemeProvider } from '@/shared/hooks/useColorScheme'
export default function PaletteStudioClient() {
  return <ColorSchemeProvider><App /></ColorSchemeProvider>
}

// After
export default function PaletteStudioClient() {
  return <App />
}
```

### `useTheme()` replacement for `useColorScheme()`

```tsx
// Before
import { useColorScheme } from '@/shared/hooks/useColorScheme'
const [scheme, toggle] = useColorScheme()
// <button onClick={toggle}>

// After
import { useTheme } from 'next-themes'
const { theme, setTheme } = useTheme()
const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')
```

**Note:** `useTheme()` must only be called from client components. Add `'use client'` to any file that imports it if not already present.

---

## 5. Risk Register

| Risk | What breaks | Severity | Mitigation |
|---|---|---|---|
| **Styled-components** | Not present in this repo | — | No action needed |
| **Recoil** | Not present in this repo | — | No action needed |
| **nanostore persistence key collision** | `@nanostores/persistent` stores keyed by string (e.g., `palette`, `chartSettings`) survive the `src/` rename unaffected. The `colorScheme` key in localStorage will become stale after next-themes takes over (next-themes uses key `theme`). | L | On first load, add a one-time migration shim: `if (localStorage.colorScheme && !localStorage.theme) { localStorage.theme = localStorage.colorScheme }` in layout before ThemeProvider renders, then `localStorage.removeItem('colorScheme')`. |
| **Canvas worker import paths** | Comlink workers use `new URL('../worker/paintWorker.ts', import.meta.url)` — relative paths. After moving from `src/components/...` to `components/...` the relative depth changes by one segment if the directory structure is flattened differently. | M | Verify each `new URL(...)` call after restructure with `pnpm build` — Next.js/Webpack will error at build time if the path resolves to nothing. Fix the relative path or convert to an `@/` alias (Next.js supports `@/` in `new URL()` workers). |
| **Dark-mode flash during next-themes switchover** | During Phase 3, before next-themes is installed but after `ColorSchemeProvider` is removed, there will be no theme manager — brief flash. | M | Do Phase 3 as a single atomic commit: add package, update layout, remove provider, update callsites all in one PR. Never deploy intermediate state. |
| **`colorjs.io` in Comlink worker bundle** | `paintWorker.ts` runs in a Web Worker via Comlink. `colorjs.io` is ESM with dynamic `import()` internally. Turbopack/Webpack must bundle it statically into the worker chunk. | M | Test with `pnpm build` in Phase 5. If bundling fails, use the `colorjs.io/src` direct import path or add `transpilePackages: ['colorjs.io']` to `next.config.ts`. |
| **OKLCH gamut mismatch in canvas graph** | The color graph paints pixels using chroma-js scale interpolation in LCH. Switching to `colorjs.io` `Color.range()` with OKLCH interpolation produces different hue paths — the graph gradient will look different (usually better, but a visual break). | L | Accept as intentional improvement; document in PR. If exact parity required, keep chroma-js scale in worker only and migrate everything else. |
| **shadcn `base-nova` token conflicts** | `base-nova` style imports its own CSS with hardcoded token names. Switching to `style: "custom"` in `components.json` stops these from loading — components may lose styles if they relied on base-nova-specific tokens. | M | Audit with `pnpm shadcn diff` after style change. Patch any missing tokens into `globals.css` manually. Run visual regression check on all shadcn components in use. |
| **`noUncheckedIndexedAccess` in Phase 7** | Array and object index access returns `T \| undefined` — many tight loops in paint worker and palette reducers will fail to compile. | M | Fix systematically: add null-checks or use `!` assertions only where provably safe. Expect 30–60 TypeScript errors on first run. |
