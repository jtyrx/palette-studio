---
name: Palette Studio
description: A precision color studio for perceptually uniform, accessible palette generation in LCH/OKLCH space.
colors:
  surface-default: "var(--color-surface-default)"
  surface-card: "var(--color-surface-card)"
  surface-sunken: "var(--color-surface-sunken)"
  surface-subtle: "var(--color-surface-subtle)"
  surface-overlay: "var(--color-surface-overlay)"
  surface-inverse: "var(--color-surface-inverse)"
  text-primary: "var(--color-text-primary)"
  text-secondary: "var(--color-text-secondary)"
  text-hint: "var(--color-text-hint)"
  text-error: "var(--color-text-error)"
  text-success: "var(--color-text-success)"
  text-inverse: "var(--color-text-inverse)"
  border-subtle: "var(--color-border-subtle)"
  border-focus: "var(--color-border-focus)"
  interactive-bg: "var(--color-interactive-bg)"
  interactive-bg-hover: "var(--color-interactive-bg-hover)"
  interactive-bg-active: "var(--color-interactive-bg-active)"
  chrome-hairline: "var(--chrome-hairline)"
  chrome-chip: "var(--chrome-chip)"
  chrome-field: "var(--chrome-field)"
typography:
  display:
    fontFamily: "var(--font-sans)"
    fontSize: "clamp(1.25rem, 2vw, 1.75rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "var(--font-sans)"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "var(--font-sans)"
    fontSize: "var(--text-label)"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0"
  caption:
    fontFamily: "var(--font-sans)"
    fontSize: "var(--text-caption)"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  micro:
    fontFamily: "var(--font-sans)"
    fontSize: "var(--text-micro)"
    fontWeight: 400
    lineHeight: 1.3
  nano:
    fontFamily: "var(--font-sans)"
    fontSize: "var(--text-nano)"
    fontWeight: 400
    lineHeight: 1.2
rounded:
  pill: "var(--radius-full)"
  menu: "var(--radius-menu)"
  card: "var(--radius-card)"
  input: "var(--radius-input)"
  select: "var(--radius-select)"
  control: "var(--radius)"
  sm: "var(--radius-m)"
  lg: "var(--radius-l)"
spacing:
  widget-xs: "var(--spacing-widget-xs)"
  widget-sm: "var(--spacing-widget-sm)"
  widget-md: "var(--spacing-widget-md)"
  widget-lg: "var(--spacing-widget-lg)"
  toolbar-h: "var(--layout-shell-toolbar-h)"
  panel-min: "var(--layout-panel-min)"
  sidebar-min: "var(--layout-sidebar-min)"
  sidebar-max: "var(--layout-sidebar-max)"
components:
  button-default:
    backgroundColor: "var(--background-color-inverse)"
    textColor: "var(--text-color-inverse)"
    rounded: "{rounded.pill}"
    padding: "var(--spacing-widget-xs) var(--spacing-widget-sm)"
  button-default-hover:
    backgroundColor: "var(--color-interactive-bg-hover)"
    textColor: "var(--text-color-inverse)"
    rounded: "{rounded.pill}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "var(--color-text-primary)"
    rounded: "{rounded.pill}"
    padding: "var(--spacing-widget-xs) var(--spacing-widget-sm)"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "var(--color-text-primary)"
    rounded: "{rounded.pill}"
    padding: "var(--spacing-widget-xs) var(--spacing-widget-sm)"
  button-ghost-hover:
    backgroundColor: "var(--color-interactive-bg)"
    textColor: "var(--color-text-primary)"
    rounded: "{rounded.pill}"
---

# Design System: Palette Studio

## 1. Overview

**Creative North Star: "The Calibrated Instrument"**

A precision color studio must not compete with the thing it measures. Palette Studio's visual system is built on a single discipline: the UI recedes so the palette can speak. Every surface is achromatic by intention. The depth of `--color-surface-default` is not atmosphere; it is the controlled environment a colorimetrist needs to read hue accurately. The app is the room, not the exhibit.

This means chromatic interest comes from exactly one source: the palette being edited. A wide-gamut P3 swatch on a neutral surface reads at full perceptual intensity. The same swatch on a colored background would fight for dominance. The system refuses that fight. Every token decision — deep surface, zero brand accent, hairline borders — enforces the same principle: the instrument recedes; the reading is everything.

The design is information-rich and deliberately dense. It is built for someone who reads channel values, not button labels — a designer calibrating a production token system, not a casual visitor picking colors. Richness is a feature. The work of the system is packing meaning into every surface without noise. Typography and restrained spatial rhythm do that work.

The system explicitly rejects: pastel card grids and swatch-row slot machines; floating panels and detached tool palettes; hero metrics and gradient text; glassmorphism; SaaS landing-page decoration; anything that would make a hiring team say "color picker" when they mean "instrument."

**Key Characteristics:**
- Dark-first: `--color-surface-default` (cool blue-tinted near-black) as the perceptual baseline — keeps every swatch readable at full gamut intensity
- Achromatic discipline: zero brand accent anywhere in the UI layer; all chroma lives in the palette data
- OKLCH throughout: every color token is defined in perceptual space; no HSL, no hardcoded hex in token definitions
- Density over whitespace: small controls sized by `--spacing-widget-*`, tight spacing, information at every level of zoom
- Ambient glow, not drama: `--shadow-*` tokens are opacity-mixed against `--color-text-default`, never hardcoded
- Pill controls with technical precision: `--radius-full` for all interactive controls; lesser radii for containers only

## 2. Colors

The palette is strictly neutral: `--color-surface-*` tokens for depth, `--color-text-*` tokens at varying opacity for hierarchy, two `--color-text-error` / `--color-text-success` signal colors for system state. Nothing else. The chromatic world lives in the palette editor, not the chrome.

### Primary

There is no chromatic primary accent. The "primary" button uses `--background-color-inverse` and `--text-color-inverse` — the flipped surface and text values — as achromatic emphasis. Rarity by architecture, not by color.

### Neutral

- **Blue-Black Void** (`--color-surface-default`): The default app background. Cool blue-tinted near-black. Used for the app shell, sidebar, and all outer surfaces. Adapts across themes via `[data-theme]` selector.
- **Elevated Slate** (`--color-surface-card`): The card/panel layer. One tonal step above the void. Charts panel background, sidebar card backgrounds, any container lifted one step above the shell.
- **Submerged Depth** (`--color-surface-sunken`): The sunken layer. Inset fields, canvas wells, anything that should read as below the default surface.
- **Recessed Surface** (`--color-surface-subtle`): The subtle layer between sunken and default. Interactive hover wells, secondary panels, data rows.
- **Overlay** (`--color-surface-overlay`): Floating surfaces — popovers, dropdowns, tooltips. Shares the card value; distinct role makes the intent explicit.
- **Pure Signal** (`--color-text-primary`): Primary text. Full-lightness, zero chroma. The baseline for all readable content.
- **Attenuated Signal** (`--color-text-secondary`): Secondary text. Reduced opacity of Pure Signal. Labels, descriptions, anything one tier below primary emphasis.
- **Ghost Signal** (`--color-text-hint`): Hint text, placeholder text, disabled labels. Minimum legible opacity.
- **Hairline** (`--chrome-hairline`): Borders and dividers. Computed as `color-mix(in oklch, --color-text-default 10%, transparent)` — auto-adapts across themes. Use `--chrome-hairline-strong` when slightly more contrast is needed.

### Tertiary (signal colors only)

- **Alert Ember** (`--color-text-error`): Error state text. High-chroma orange-red in the P3 gamut. The one moment of saturated color in the UI layer — reserved strictly for system errors.
- **Instrument Green** (`--color-text-success`): Success state text. Vivid perceptual green. Used only for confirmed-valid system states.

**The One-Chroma Rule.** No chromatic color (chroma above the surface baseline) appears in the UI layer except `--color-text-error` and `--color-text-success`. Any other chromatic value belongs in the palette data, not the chrome.

**The Inversion Rule.** Light-theme surfaces resolve `--color-surface-default` to near-white and `--color-surface-card` to a faint blue-tinted near-white. The same semantic tokens are used in both themes — never branch on theme in component code. The `[data-theme]` selector handles every divergence in `globals.css`.

**The Chrome Rule.** Transparent fill and border colors (`--chrome-chip`, `--chrome-field`, `--chrome-hairline`, `--chrome-overlay-*`) are `color-mix()` expressions computed from `--color-text-default`. They are never hardcoded values. New transparent surface overlays must follow this pattern.

## 3. Typography

**Font:** `var(--font-sans)` — Geist, with system-ui and sans-serif fallback throughout.

Palette Studio uses a single typeface. No serif display, no editorial pairing. Geist is a geometric sans built for code interfaces — it sits naturally beside hex values, channel numbers, and token names. Its mono companion shares the same optical metrics, so numeric data and prose coexist without size correction.

**Character:** Precise and legible at small sizes. The type system is built for the `--text-caption` to `--text-label` range, not headline drama. Hierarchy is earned through weight contrast and size steps, not decorative contrast.

### Hierarchy

- **Display** (weight 600, clamped fluid size, leading 1.1, tracking −0.02em): Reserved for section identifiers and palette names where headline weight is needed. Used sparingly — one instance per major surface.
- **Body** (weight 400, 0.875rem, leading 1.5): The workhorse. Color info panels, tooltip descriptions, sidebar content. Line length capped at 65ch.
- **Label** (weight 500, `--text-label`, leading 1.3, tracking 0): Button labels, field labels, menu items, chip text. The default UI text size. All interactive controls use this role.
- **Caption** (weight 400, `--text-caption`, leading 1.4): Secondary annotations, gamut badge labels, contrast ratio subscripts. Used where space is at a premium.
- **Micro** (`--text-micro`) / **Nano** (`--text-nano`): Extreme-density labels in graph tick marks and pixel-level annotations. Never used for interactive elements.

**The Small-Text-First Rule.** The default reading size is `--text-label`, not 1rem. Every new text element should ask: can this be Label or Caption before reaching for Body?

## 4. Elevation

Every raised surface carries a gentle ambient shadow. All `--shadow-*` tokens are derived from `color-mix(in oklch, var(--color-text-default) X%, transparent)` — they are computed from the foreground color, not hardcoded values. In dark mode this produces a soft luminous glow; in light mode the same formula produces conventional soft grays. Both themes use the same tokens.

No surface is harshly elevated. Nothing floats with hard edges. The instrument is precise, not theatrical.

### Shadow Vocabulary

- **`--shadow-raised`**: Minimal ambient lift. Used on interactive controls at rest — buttons, chips, input fields.
- **`--shadow-lg`**: Panel-level elevation. Used on sidebar, tool panels, and sticky toolbars.
- **`--shadow-overlay`**: Floating layer elevation. Popovers, dropdowns, tooltips.
- **`--shadow-xl`**: Maximum elevation. Dialogs and sheets only.

**The Relative Shadow Rule.** Never write a shadow with a hardcoded color. Always reach for a `--shadow-*` token. If a new shadow role is needed, add it to `globals.css` using the same `color-mix(in oklch, var(--color-text-default) X%, transparent)` pattern — never inline a raw shadow value in component CSS.

## 5. Components

### Buttons

Pill-shaped (`--radius-full`), sized by `--spacing-widget-*`, technically minimal at rest. Controls don't announce themselves. They respond.

- **Shape:** `var(--radius-full)` on all interactive buttons and chips. `--radius-input` and `--radius-card` are for field and container elements only.
- **Default:** `--background-color-inverse` background with `--text-color-inverse` text. The only control that asserts itself — used once per interaction zone.
- **Hover / Focus:** Hover reduces opacity of the inverse surface. Focus applies a 3px ring using `--ring` at 50% opacity (`--ring/50`). All state transitions use the `btn-sys` utility at 150ms.
- **Outline:** `transparent` background, `--color-border-subtle` border at rest. On hover, background fills with `--color-interactive-bg-hover`. Used for secondary toolbar actions.
- **Ghost:** No border, no background at rest. Background wells on hover with `--color-interactive-bg`. Used for icon-only controls, menu triggers, and low-priority actions.
- **Destructive:** Ghost base with `--destructive`-tinted focus ring at `--color-destructive-subtle` opacity. Used for irreversible actions only.
- **Sizes:** xs (`--spacing-widget-xs` tall), sm (`--spacing-widget-sm`), md (`--spacing-widget-md` — default), lg (`--spacing-widget-lg`). Icon variants use square sizing at equivalent widget steps.

### Chips

- **Style:** `--chrome-chip` background (6% text-color opacity), Label typography (`--text-label`), `--radius-full` shape. No border at rest.
- **State:** Selected chips gain weight 500 text and a 6px trailing dot indicator (via the `menu-item-selected` utility). Unselected are low-contrast by design — they are informational, not interactive affordances.

### Cards / Containers

- **Corner Style:** `var(--radius-card)` — gently curved, softer than inputs, firmer than menus.
- **Background:** `--color-surface-card` against the `--color-surface-default` shell. One step of tonal separation; no border required unless the card is adjacent to another card.
- **Shadow Strategy:** `--shadow-lg` for panel-level containers; `--shadow-raised` for inline elevated elements.
- **Border:** `--chrome-hairline` on containers that need explicit separation from sibling panels. Never a fixed-color border.
- **Internal Padding:** 1rem default; use tighter spacing only when the content density explicitly requires it.

### Inputs / Fields

- **Style:** `--chrome-field` background (4% text-color opacity) at rest, `--radius-input` corners, 1px `transparent` border.
- **Focus:** Border shifts to `--color-border-focus` (resolved from `--ring`). Outline ring at `--ring/50` opacity.
- **Disabled:** 50% opacity, pointer-events none. No additional color treatment.
- **Error:** Border shifts to `--destructive`. Ring at 3px, `--color-destructive-subtle` fill.

### Sidebar / Navigation

- **Style:** `--color-surface-card` background. Collapsible to icon-only state. Header carries the palette name (`--text-label`, weight 600) and the palette selector.
- **Default state:** No active indicator beyond typography weight. Navigation is positional, not highlighted.
- **Toolbar height:** `--layout-shell-toolbar-h`. Never hardcode this value in sibling layout elements — use the token so adjustments propagate.

### Signature Component: Graph Knob

The LCH/OKLCH channel graph uses custom range inputs styled as draggable circular knobs. The swatch's own color drives the visual — no UI token involvement.

- **Track:** Thin hairline track at `--chart-axis-gap` spacing, full channel width.
- **Thumb (selected):** 15px circle, transparent fill, thick inner border in `--bg` (the swatch color), glow shadow in the contrast color. Scale(1).
- **Thumb (unselected):** Same geometry at scale(0.75). Larger inner border, lighter shadow.
- **Cursor:** `grab` at rest; `grabbing` on active drag.

## 6. Do's and Don'ts

### Do:
- **Do** define every color value in OKLCH. Hex codes are translation artifacts; produce them only as sRGB export targets.
- **Do** reference semantic tokens (`--color-surface-*`, `--color-text-*`, `--color-border-*`) in component code. Never reference Tier 1 primitive values directly.
- **Do** derive transparent fills and borders from `color-mix(in oklch, var(--color-text-default) X%, transparent)` — or use the pre-built `--chrome-*` tokens that already follow this pattern.
- **Do** use `--shadow-raised`, `--shadow-lg`, `--shadow-overlay`, `--shadow-xl` from the token set. New shadow roles belong in `globals.css`, not inline CSS.
- **Do** use `--radius-full` for all interactive buttons and chips. `--radius-card`, `--radius-input`, `--radius-menu` are for containers and fields — not controls.
- **Do** size controls using `--spacing-widget-*`. Never hardcode pixel heights for interactive elements.
- **Do** set text sizes via `--text-label`, `--text-caption`, `--text-micro`, `--text-nano`. The default is `--text-label`, not `1rem`.
- **Do** use `data-theme="dark"` and `data-theme="light"]` selectors for theme overrides. Never `@media (prefers-color-scheme)` as the primary. Never `.dark` class.
- **Do** express depth through the surface tonal stack (`--color-surface-sunken` → `--color-surface-subtle` → `--color-surface-default` → `--color-surface-card` → `--color-surface-overlay`) before reaching for a shadow.
- **Do** respect `prefers-reduced-motion`. All transitions are state-driven at 150ms ease-out; choreographed entrance animations are prohibited.

### Don't:
- **Don't** hardcode any OKLCH, hex, HSL, or RGB color value in a component file. If the token doesn't exist yet, add it to `globals.css` first.
- **Don't** add a brand accent color to the UI layer. The One-Chroma Rule is absolute: the only chromatic values in the UI are `--color-text-error` and `--color-text-success`.
- **Don't** write inline shadow values. Every box-shadow in component code must reference a `--shadow-*` token.
- **Don't** hardcode spacing or sizing values for interactive elements. Use `--spacing-widget-*` for control heights and padding.
- **Don't** use gradient text (`background-clip: text` with a gradient). Emphasis through weight or size only.
- **Don't** use glassmorphism: blurred, translucent card surfaces as decoration.
- **Don't** build SaaS hero-metric layouts: big number, small label, gradient accent. This is not a dashboard.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe. Rewrite with background tints, full borders, or nothing.
- **Don't** use HSL anywhere in token definitions. OKLCH is the canonical color model.
- **Don't** add modal dialogs as the first solution. Exhaust inline and progressive-disclosure alternatives first.
- **Don't** reach for whitespace to communicate hierarchy. Hierarchy comes from scale contrast and weight contrast. The tool is dense. That is the design.
