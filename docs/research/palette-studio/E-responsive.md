# Palette Studio — Responsive Layout Proposal (Medium Scope)

## 1. Current Layout Summary

`App.tsx` renders a vertical flex column: a full-width `<Header>` bar, then a horizontal `<main>` split into a left panel (`w-min min-w-[400px]`) containing the palette grid, contrast info, and export field, and a right panel (`flex-1 bg-card`) containing 6 `<Scale>` graphs arranged in a 3-column CSS grid (`${chartWidth}px 8px ${chartWidth}px`, where `chartWidth = 400`) with L, C, H rows and an 8px `ScaleIndicator` column separator between the two graph columns (App.tsx:31–121). The header (`Header/index.tsx:39–98`) is a flex-wrap row with three wrapping groups: (1) palette select + copy link, (2) color editor + color actions, (3) overlay mode cycle, chart settings, theme toggle, GitHub link. The existing custom breakpoint `max-[860px]:flex-col` (App.tsx:31) already stacks main areas vertically below 860px, but no further responsive adaptation exists beyond that.

---

## 2. Breakpoint Behavior Table

| Viewport | Palette grid | 6 Graphs | Contrast panel | Header controls | Toolbar/actions |
|---|---|---|---|---|---|
| **xl+ (1280px+) — floor** | Fixed CSS grid, `64px + repeat(toneCount, 48px) + 24px` columns; no scroll | Two columns of 400px each, 3 rows (L/C/H); 8px indicator gutter | Below palette grid, in left panel | All three header groups fully visible, flex-wrap | ColorEditor + ColorActions fully visible |
| **lg (1024px)** | Same fixed grid; left panel may clip — add `overflow-x: auto` to left `<section>` | Two-column graph grid unchanged (fits at 1024px — 2×400 + 8 = 808px, plus 24px padding); may be tight, consider reducing `chartWidth` to 340px at `lg` | Unchanged | Header groups still wrap naturally | Unchanged |
| **md (768px)** | Left panel: `overflow-x: auto`, grid preserved at native width; horizontal scroll enabled | Graphs go 1-column: each Scale stacks full-width; `gridTemplateColumns` becomes `1fr`; 3 rows × 2 graphs = 6 stacked graphs | Moves below the stacked graphs (already below in source order within left panel) | Second header group (ColorEditor) collapses to icon-only button that opens a bottom sheet or popover; overlay mode text truncated to short label | ColorActions icons only (no labels) |
| **sm (640px)** | Horizontal scroll; palette swatch buttons remain 48px wide (touch-friendly) | All 6 graphs full-width, single column, each ~`min(100%, 400px)` | Below graphs; 3-column contrast grid collapses to 1 column | PaletteSelect collapses to icon + truncated name; CopyLink icon-only; overlay mode becomes icon toggle; GitHub and theme icons remain | ColorEditor hidden by default, opens as sheet on "Edit color" tap |
| **<sm (<640px)** | Same as sm; `64px` hue label column may clip — consider `min-width: 48px` for labels | Same as sm | Collapsed: show only the single most-relevant contrast pair; expand button reveals full panel | Minimal: palette name (truncated), theme toggle, overflow menu (`⋯`) for remaining actions | All editor controls in overflow sheet |

---

## 3. Layout Proposal (Prose per Breakpoint)

### xl+ (Desktop floor — must not regress)

No changes. The existing layout is the reference. Left panel is `w-min min-w-[400px]`, right panel is `flex-1`. Graphs are a 3-column CSS grid with `400px 8px 400px` columns. Header wraps naturally. All keyboard shortcuts (`L`, `C`, `H`, `B`) and dense numeric inputs are fully available.

---

### lg (1024px)

**Palette grid:** No change to the grid template itself. Add `overflow-x: auto` to the left `<section>` (currently `overflow-auto` is already present at App.tsx:33). At 1024px the left panel with a default 11-tone palette is approximately `64 + 11×48 + 24 = 616px`, which fits. No reflow needed.

**6 Graphs:** The graph section is `808px + padding`. At 1024px total viewport, with the left panel's `min-w-[400px]`, remaining space is ~`600px` — too narrow for the 2-column graph grid. Two approaches:
- **Option A (recommended):** Reduce `chartWidth` to `280px` at `lg` via a responsive prop or CSS container query, keeping the 2-column side-by-side layout.
- **Option B:** Collapse to 1 column (each Scale full-width) at `lg`, which is simpler and avoids prop threading.

Option B is safer for medium scope. Apply `lg:grid-cols-1` equivalent — replace the inline `gridTemplateColumns` style with a CSS class at `lg` that sets a single-column layout.

**Contrast panel:** Stays in the left panel below the palette grid, unchanged.

**Header:** Wraps naturally. No collapsing needed at `lg`.

---

### md (768px)

**Palette grid:** The left panel already has `overflow-auto`. The grid's inline `gridTemplateColumns` style is fixed-width and must be preserved. Wrap the `<PaletteSwatches>` in a `div` with `overflow-x: auto` and let the grid scroll horizontally at its natural width. The containing `<section>` should be `min-w-0` instead of `w-min min-w-[400px]` at `md` and below, so it doesn't force the layout wider than the viewport.

```tsx
// App.tsx left section — add md:w-full md:min-w-0
<section className="flex w-min min-w-[400px] flex-col gap-4 overflow-auto p-4
                    md:w-full md:min-w-0">
  <div className="overflow-x-auto">
    <PaletteSwatches />
  </div>
  ...
</section>
```

**6 Graphs:** Collapse to 1 column. The graph `<section>` inline style is `gridTemplateColumns: "${chartWidth}px 8px ${chartWidth}px"`. At `md`, override with a wrapper class `md:block` and each Scale becomes full-width. The `ScaleIndicator` columns (`8px` gutter) can be hidden at `md` (`md:hidden`) since they only serve as separators between side-by-side charts.

```tsx
// App.tsx graph section — switch to block at md
<section
  className="grid gap-4 md:block md:space-y-4"
  style={{ gridTemplateColumns: `${chartWidth}px 8px ${chartWidth}px` }}
>
```

Each `<Scale>` receives `width={chartWidth}` as a prop and sets an inline `width` style. At `md`, pass `width={Math.min(chartWidth, containerWidth)}` or use a CSS `max-width: 100%` on the Scale's root div. The cleanest approach: remove the inline `width` style on the Scale root div and let it be `width: 100%` at narrow viewports via a Tailwind utility on the wrapper.

**Contrast panel:** Already below the palette grid in source order; no change needed. The `grid-cols-3` layout in `ContrastGroup` (ColorInfo/index.tsx:39) can collapse to `grid-cols-1` at `sm`.

**Header:** The `ColorEditor` group (second flex group in Header) is the densest. At `md`, it remains visible but wraps. No collapsing yet — the header already uses `flex-wrap`.

---

### sm (640px)

**Palette grid:** `overflow-x: auto` wrapper as above. Swatch buttons are `48px` square — adequate for touch. Hue label inputs are `64px` wide, sufficient.

**6 Graphs:** Single-column, each Scale `width: 100%`. The `<Canvas>` inside Scale uses an explicit `width` prop for drawing; this needs to receive the actual rendered width (use a `ResizeObserver` or hard-code a reasonable responsive fallback like `width={Math.min(400, windowWidth - 32)}`). The `graph-knob` range inputs use `left` positioning derived from `sectionWidth * i`; these remain correct as long as `width` prop matches the rendered canvas width.

**Contrast panel:** `ContrastGroup` collapses from `grid-cols-3` to `grid-cols-1` (`sm:grid-cols-1`).

**Header controls:** 
- `PaletteSelect` stays visible (it's the primary action).
- `CopyButton` becomes icon-only (`sm:hidden` on "Copy link" text, keep icon).
- The overlay mode cycle button text shortens: "APCA" / "WCAG" / "None" / "ΔE" labels instead of full sentences (`sm:hidden` on descriptive text, show abbreviation).
- `ThemeButton` and GitHub icon stay as-is (already icon-only).
- `ColorEditor` moves behind a "Edit" button that opens a `<dialog>` or Radix Sheet.
- `ColorActions` collapses into the same sheet or a compact icon row.

---

### <sm (<640px)

**Palette grid:** Same as sm. If the palette has many tones (12+), horizontal scroll will be significant — acceptable per scope.

**Header:** Minimal bar: palette name (truncated), theme toggle, `⋯` overflow menu containing copy link, overlay mode, chart settings, GitHub.

**Contrast panel:** Show only one `ContrastGroup` by default (vs. tone[0]); the other two collapse behind a "Show more" disclosure.

---

## 4. Tailwind v4 Utilities List

All utilities below are core Tailwind v4 (no plugins required). Utilities marked `*` require an inline style override or a `@utility` custom definition because the current layout uses inline `style={}` for grid columns.

| Utility | Purpose |
|---|---|
| `md:w-full` | Left panel: full width below md |
| `md:min-w-0` | Left panel: remove min-width constraint |
| `overflow-x-auto` | Palette grid horizontal scroll wrapper |
| `md:block` | Graph section: exit CSS grid, become block |
| `md:space-y-4` | Graph section: vertical gap between stacked graphs |
| `md:hidden` | Hide ScaleIndicator columns at md |
| `sm:hidden` | Hide verbose button labels at sm |
| `sm:grid-cols-1` | ContrastGroup: single column at sm |
| `lg:grid-cols-1` | Graph section 1-column at lg (if Option B chosen) |
| `max-w-full` | Scale root div: prevent overflow of parent |
| `min-w-0` | Flex children that need to shrink |

**Note:** `gridTemplateColumns` on the graph `<section>` and Scale root `<div>` are set via inline `style={}` (App.tsx:44–46, ColorGraph/index.tsx:47–50). These cannot be overridden by Tailwind responsive utilities directly. The recommended approach is to conditionally pass the style only above `md`, and at `md` and below omit the inline style so the block layout takes over. A `@utility` custom definition is not required if the responsive switch is handled in JSX via a `useMediaQuery` hook or by restructuring the render path.

---

## 5. Touch Targets and Graph Drag Interaction

### Pointer Events on Touch

The `<Scale>` component uses `<input type="range">` elements with CSS positioning for the graph knobs (`graph-knob` class, ColorGraph/index.tsx:108–129) and `onMouseDown` / `onFocus` on the value inputs (ColorGraph/index.tsx:73–79). 

- **Range inputs (`<input type="range">`):** These are native browser controls. Touch works out of the box — browsers fire pointer/touch events on range inputs. The drag behavior on touch is handled natively.
- **Value inputs (`graph-value-input`):** The `onMouseDown` handler (line 73) calls `e.preventDefault()` to suppress focus during selection. On touch, `mousedown` does fire before `touchstart` on most browsers, so this should work. However, testing on iOS Safari is recommended as behavior can differ.
- **Pointer Events conclusion:** The existing handlers should function on touch screens without changes for the knob drag interaction.

### Minimum Touch Target Size

Per WCAG 2.5.5, touch targets should be at least 44×44px (2.75rem × 2.75rem). The `graph-knob` range inputs are absolutely positioned and rotated. Their effective tap area depends on CSS — verify the computed touch target includes at minimum 44px in both dimensions. If not, add:

```css
/* In globals or graph-knob class */
.graph-knob {
  min-height: 44px; /* before rotation */
}
```

The swatch buttons in `PaletteSwatches` are `48px × 48px` (set by grid row/column size) — compliant.

### Fallback for Very Narrow Viewports

For viewports where drag is impractical (pointer: coarse, narrow screen):

**Proposed fallback — tap-to-select + arrow key / stepper buttons:**

1. Tapping a graph knob fires `onSelect(i)` (already implemented via `onClick`, line 117).
2. Once selected, the existing `KeyPressHandler` + `useKeyPress` hooks already support keyboard arrow key adjustment of channel values.
3. Add a small `+` / `−` button pair that appears below the selected graph at touch viewports. These buttons call the same `onColorChange` callback with `value ± step`.

```tsx
// Minimal stepper — shown only at touch viewports (pointer: coarse)
{isTouchDevice && i === selected && (
  <div className="flex gap-2 mt-1">
    <button onClick={() => setColor(color, i, color[channel] - ranges[channel].step)}>−</button>
    <button onClick={() => setColor(color, i, color[channel] + ranges[channel].step)}>+</button>
  </div>
)}
```

Each stepper button must be at least 44×44px. Detect touch via `window.matchMedia('(pointer: coarse)')` in a `useEffect`. No new drag logic is required.

---

## 6. What Stays Purely Desktop

The following are explicitly **out of scope** for mobile in this pass:

| Feature | Reason |
|---|---|
| Multi-key channel shortcuts (`L`, `C`, `H`, `B` key modifiers) | No physical keyboard on mobile; `KeyPressHandler` can remain but has no touch equivalent |
| Dense numeric channel inputs in `ColorEditor` (L/C/H three-field editor) | Numeric spinners are unusable at narrow widths; mobile path is the sheet fallback |
| Graph drag-to-reshape (pointer drag on Canvas) | Canvas drag requires precision not achievable on touch; stepper fallback covers the need |
| `ChartSettings` popover (advanced graph configuration) | Low-priority advanced control; collapses into overflow menu at sm, no mobile-optimized UI |
| Keyboard navigation of palette grid (arrow keys between swatches) | Desktop convenience; touch users tap directly |
| `Help` component (keyboard shortcut reference) | Entirely keyboard-focused; hidden at sm |
| Side-by-side tone/hue graph columns (the 2×3 layout) | At md and below, graphs go single-column |

---

## 7. Open Questions

1. **`chartWidth` at responsive breakpoints:** Should `Scale` accept a responsive width (e.g., via `ResizeObserver` in a wrapper) or should the parent pass a different hardcoded `width` prop per breakpoint? A `ResizeObserver` approach is cleanest but adds complexity. A `useWindowSize` hook with thresholds is simpler.

2. **`ColorEditor` on mobile:** Should it open as a bottom sheet (Radix `Sheet` or native `<dialog>`) or as an inline collapse below the header? Sheet is better UX but requires a new dependency or custom implementation.

3. **ScaleIndicator at md:** When graphs stack single-column, the `ScaleIndicator` (8px gradient bar) loses its purpose as a row separator. Should it be repurposed as a horizontal label above each graph row, or removed entirely at md?

4. **Left panel stacking order at md:** Currently `PaletteSwatches` → `ColorInfo` → `ExportField`. On mobile, should `ExportField` (copy token values) move above `ColorInfo` (contrast data)? Depends on the primary mobile use case — copying values vs. checking contrast.

5. **Graph canvas width prop:** `Canvas` receives a `width` prop and uses it for `<canvas width={width}>`. Changing it dynamically will cause the canvas to re-render. Is a brief repaint flash acceptable, or should the canvas size be CSS-only (with `width: 100%` on the canvas element and logical coordinates scaled internally)?

6. **Minimum supported viewport width:** Is there a hard floor below which the app is allowed to show a "use a wider screen" message? If so, what width? Alternatively, is the `<sm` column layout expected to be fully functional?
