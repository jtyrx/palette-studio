# Palette Studio — Feature Documentation & Gamut Badge Specification

---

## 1. The 6 Graphs Explained

Each graph is rendered by `Scale` (`src/components/ColorGraph/index.tsx:22`) backed by `Canvas` (`src/components/ColorGraph/Chart/Canvas.tsx:35`). The canvas background is painted by a web worker pool (`paintWorker.ts`) that evaluates every pixel for gamut membership.

The app renders **two rows of three graphs**: one row per color channel (L, C, H), once for **all hue rows** (holding hue-row fixed, varying tone across X) and once for **all tone columns** (holding tone fixed, varying hue row across X). This yields 6 `<Scale>` instances.

---

### Graph 1 — Lightness across tones for a selected hue row
- **Name:** L across tones
- **Axes:** X = tone stops (100 → 900, left to right); Y = L value (0–100 for CIELCH; 0–100% for OKLCH)
- **Dots:** One draggable knob per tone stop in the selected hue row (`src/components/ColorGraph/index.tsx:104–125`)
- **Dragging:** Moving a dot up/down changes the L channel of that tone, calling `onColorChange(idx, [value, c, h])` (`index.tsx:39`)
- **Background fill:** The worker (`paintWorker.ts:25–83`) sweeps L from top (max) to bottom (min) for each column's interpolated C and H values; white pixels = in sRGB, light gray = in P3 only, darker gray = in Rec2020 only, transparent = out of all gamuts
- **What a designer learns:** Whether the lightness ramp across tones is perceptually smooth and what headroom exists before a tone exits the displayable gamut

`file: src/components/ColorGraph/index.tsx:36–41` — `setColor` maps drag direction to L channel update

---

### Graph 2 — Chroma across tones for a selected hue row
- **Name:** C across tones
- **Axes:** X = tone stops; Y = C value (0–134 CIELCH or 0–0.33 OKLCH)
- **Dots:** One knob per tone stop; position encodes the chroma of that tone
- **Dragging:** Up/down changes C, calling `onColorChange(idx, [l, value, h])` (`index.tsx:40`)
- **Background fill:** Worker sweeps C from top (max) to bottom (min) at each column's interpolated L and H; the visible fill region shows how much chroma the hue can sustain at those L values before clipping out of gamut
- **What a designer learns:** Where chroma "runs out" relative to the sRGB boundary, revealing tones that will be perceptually muted on standard displays

`file: src/components/ColorGraph/Chart/RenderStrategy/WorkerPool/worker/paintWorker.ts:85–` — `drawChromaChart`

---

### Graph 3 — Hue angle across tones for a selected hue row
- **Name:** H across tones
- **Axes:** X = tone stops; Y = H value (0–360°)
- **Dots:** One knob per tone; position encodes the hue angle of that tone
- **Dragging:** Up/down rotates H, calling `onColorChange(idx, [l, c, value])` (`index.tsx:41`)
- **Background fill:** Worker sweeps H from top to bottom at each column's L and C; the fill paints the actual hue color at that angle so a designer sees the hue-wheel mapped vertically
- **What a designer learns:** Whether hues stay consistent across tones or drift (useful for detecting unwanted CIELCH hue shift)

---

### Graph 4 — Lightness across hue rows for a selected tone column
- **Name:** L across hues
- **Axes:** X = hue rows (Reds → Blues, left to right); Y = L value
- **Dots:** One knob per hue row at the selected tone's L value
- **Dragging:** Adjusts L for that hue row at the fixed tone
- **Background fill:** Same gamut sweep logic, interpolated across hue-row C and H values
- **What a designer learns:** Whether all hues share the same perceived lightness at this tone stop — critical for building a harmonious palette where e.g. Red-500 and Blue-500 feel equally bright

---

### Graph 5 — Chroma across hue rows for a selected tone column
- **Name:** C across hues
- **Axes:** X = hue rows; Y = C value
- **Dots:** One knob per hue row at the fixed tone's C value
- **Dragging:** Adjusts C for that hue row; reveals how "saturated" each hue is at this tone
- **Background fill:** Gamut fill shows the max chroma available per hue before clipping
- **What a designer learns:** Which hues in the palette are chroma-limited by sRGB and which could be pushed further in a wider-gamut context

---

### Graph 6 — Hue angle across hue rows for a selected tone column
- **Name:** H across hues
- **Axes:** X = hue rows; Y = H value (0–360°)
- **Dots:** One knob per hue row; encodes that hue row's angle at the fixed tone
- **Dragging:** Rotates the hue of an entire row at this tone (useful for fine-tuning hue separation)
- **Background fill:** Displays the hue spectrum vertically; the fill makes it easy to visually confirm the hue angle's position in color space
- **What a designer learns:** Whether hue rows are well-separated in angle and whether any two rows overlap or conflict

---

**Gamut fill encoding (all 6 charts)** — `paintWorker.ts:19–23`

| Pixel color | Meaning |
|---|---|
| White `[255,255,255]` | In sRGB |
| Light gray `[198,198,198]` | In Display-P3 but outside sRGB |
| Darker gray `[171,171,171]` | In Rec2020 but outside P3 |
| Transparent (checkerboard shows through) | Outside all gamuts |

When "Show colors" is enabled, sRGB pixels render as the actual color instead of white (`paintWorker.ts:72`).

---

## 2. Color Computation Pipeline

Trace from user dragging the L-channel graph dot to the swatch rendering on screen:

1. **User drags `<input type="range">`** — `src/components/ColorGraph/index.tsx:108–125`  
   The range input fires `onChange`; the `Scale` component calls `setColor(color, idx, value)` (`index.tsx:36–42`), clamping the new value to channel ranges and assembling a new `LCH` tuple `[value, c, h]`.

2. **`onColorChange(idx, lch)` prop callback** — called from `Scale`  
   This calls `setLchColor(lch, hueId, toneId)` in `src/store/palette/actions.ts:108`.

3. **`setLchColor`** — `src/store/palette/actions.ts:108–121`  
   Reads the active `colorSpaceStore` to get the current `lch2color` function, then calls it with the new LCH tuple.

4. **`lch2color(lch: LCH): TColor`** — `src/shared/colorFuncs/index.ts:47–71`  
   The core converter. Steps:
   - Calls `lch2xyz(lch)` — the model-specific conversion (CIELCH or OKLCH)
   - Calls `xyz2rgb(xyz)` — linear XYZ → sRGB matrix
   - Evaluates `isWithinGamut(srgb)` — determines if all channels are in [0,1]
   - Lazily computes `.hex` via `forceIntoGamut` if out of sRGB, else `srgb2hex`
   - Lazily computes `.within_P3` via `xyz2p3(xyz)` and `.within_Rec2020` via `xyz2rec2020(xyz)`
   - Returns a `TColor` object with `{ mode, l, c, h, r, g, b, hex, within_sRGB, within_P3, within_Rec2020 }`

5. **CIELCH path** — `src/shared/colorFuncs/colorModels.ts:18`  
   `lch2xyz = (lch) => D50_to_D65(Lab_to_XYZ(LCH_to_Lab(lch)))`  
   Conversion functions imported from `src/shared/colorFuncs/colorMath/conversions`.

6. **OKLCH path** — `src/shared/colorFuncs/colorModels.ts:29–31`  
   `lch2xyz = (lch) => OKLab_to_XYZ(OKLCH_to_OKLab(fromDisplayOKLCH(lch)))`  
   `fromDisplayOKLCH` scales L from [0–100] display range back to [0–1] native OKLCH range before conversion.

7. **`setPalette(newPalette)`** — `src/store/palette/actions.ts:68`  
   Writes the updated palette (with the new `TColor` at [hueId][toneId]) to the `paletteStore` nanostores atom.

8. **`PaletteSwatches` re-renders** — `src/components/PaletteSwatches.tsx:32`  
   `useStore(paletteStore)` triggers a re-render. Each swatch button reads `color.hex` and sets it as `background` CSS. The `getMostContrast` function picks black or white label text via APCA.

9. **Canvas repaints** — `src/components/ColorGraph/Chart/Canvas.tsx:87–92`  
   `useEffect` fires when `colors` changes, calling the debounced `debouncedRepaint(colors, mode)`. This dispatches to the `ConcurrentSpreadRender` worker pool, which calls `paintWorker.ts` per tile and draws `ImageBitmap` segments onto the `<canvas>`.

---

## 3. APCA + WCAG Dual Contrast Model

### Toggle location

The contrast mode toggle is a `<Button>` in `src/components/Header/index.tsx:63–81`.

```tsx
// Header/index.tsx:24
const modes: TOverlayMode[] = ['APCA', 'WCAG', 'NONE', 'DELTA_E']
```

Clicking the button cycles through modes in order by calling `setOverlayMode(modes[idx % modes.length])` (`Header/index.tsx:65–66`). The current mode name renders as the button label (`texts[overlay.mode]`).

A secondary button appears when the mode is not `'NONE'`, toggling `overlay.versus` between `'selected'` (the selected swatch color) and `'white'` (`Header/index.tsx:71–81`).

### Four overlay modes

| Mode | Description |
|---|---|
| `APCA` | Advanced Perceptual Contrast Algorithm — lightness-based, polarity-aware |
| `WCAG` | WCAG 2.x ratio (relative luminance) — the legacy standard |
| `DELTA_E` | CIE Delta E perceptual color distance — not a contrast model, but color difference |
| `NONE` | No overlay; contrast badges hidden |

### Function signatures — `src/shared/color.ts`

```ts
// line 5
export const wcagContrast = (backgroundHex: string, textHex: string): number =>
  chroma.contrast(backgroundHex, textHex)

// line 8
export const apcaContrast = (backgroundHex: string, textHex: string): number =>
  Math.round(
    Math.abs(
      +APCAcontrast(
        sRGBtoY(chroma(textHex).rgb()),
        sRGBtoY(chroma(backgroundHex).rgb())
      )
    )
  )

// line 18
export const deltaEContrast = (
  backgroundHex: string,
  textHex: string
): number => chroma.deltaE(backgroundHex, textHex)
```

### `apca-w3` library inputs and outputs

- **`sRGBtoY(rgb: [r,g,b]): number`** — converts an 8-bit `[r, g, b]` array (0–255) to a linearized relative luminance Y value. Called for both text and background before passing to `APCAcontrast`.
- **`APCAcontrast(txtY: number, bgY: number): number`** — returns a signed Lc (lightness contrast) value, roughly –108 to +106. Positive = light text on dark background; negative = dark text on light. The implementation wraps it with `Math.abs()` and `Math.round()`, so the stored value is always a positive integer.

### APCA passing thresholds (from `ContrastBadge.tsx:54–62`)

| Lc value | Use case |
|---|---|
| **Lc ≥ 75** | Best for body text |
| **Lc ≥ 60** | OK for normal text |
| **Lc ≥ 45** | Large text only (≥18pt or bold ≥14pt) |
| **Lc ≥ 30** | Non-reading text (icons, decorative) |
| **Lc < 30** | Not for any text |

### Where `ContrastBadge` renders

`src/components/ColorInfo/index.tsx:11–19` renders `ContrastGroup` components for three reference colors: the first tone name (e.g., 100), white, and black. Each `ContrastGroup` renders both `ContrastBadgeAPCA` and `ContrastBadgeWCAG` side by side in the `ColorInfo` sidebar panel.

`ContrastBadgeAPCA` and `ContrastBadgeWCAG` both accept `{ background: string; color: string }` (hex values) and display the computed contrast score with a qualitative label (`src/components/ColorInfo/ContrastBadge.tsx:6–52`).

---

## 4. Gamut Badge Specification

### 4a. Viewer-Screen Gamut Badge (Header)

**Purpose:** Inform the designer what color gamut their display supports, so they know whether they can trust what they see in the P3/Rec2020 graph regions.

**Placement:** Top-right area of `<Header>` (`src/components/Header/index.tsx`), inside the existing `flex flex-wrap gap-2` container — add a `<GamutBadge />` component alongside the existing `<ChartSettings />` and `<ThemeButton />`.

**Detection:** Use `window.matchMedia` on mount only (SSR-safe):

```tsx
// components/GamutBadge.tsx
'use client'

import { useEffect, useState } from 'react'

type Gamut = 'srgb' | 'p3' | 'rec2020'

export function GamutBadge() {
  const [gamut, setGamut] = useState<Gamut | null>(null)

  useEffect(() => {
    if (window.matchMedia('(color-gamut: rec2020)').matches) {
      setGamut('rec2020')
    } else if (window.matchMedia('(color-gamut: p3)').matches) {
      setGamut('p3')
    } else {
      setGamut('srgb')
    }
  }, [])

  if (!gamut) return null // render nothing during SSR and first paint

  return (
    <div className="flex gap-1 text-xs" title="Your display's color gamut">
      <Chip label="sRGB" active={true}  dim={gamut !== 'srgb'} />
      <Chip label="P3"   active={gamut === 'p3' || gamut === 'rec2020'} />
      <Chip label="Rec2020" active={gamut === 'rec2020'} />
    </div>
  )
}
```

**Visual states:**

| Chip | Condition | Appearance |
|---|---|---|
| `sRGB` | Always visible | Grayed out (`opacity-40`) when wider gamut detected; highlighted otherwise |
| `P3` | Visible always | Highlighted (filled) when `gamut === 'p3'` or `'rec2020'` |
| `Rec2020` | Visible always | Highlighted only when `gamut === 'rec2020'` |

Reference: [MDN color-gamut media feature](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/color-gamut)

**SSR safety:** `useState(null)` + `return null` until `useEffect` fires ensures no server/client mismatch. The badge simply doesn't render during SSR.

---

### 4b. Per-Swatch P3 Badge

**Purpose:** Flag individual swatches that will look different on sRGB vs. P3 displays — informational only, not decorative.

**Render rule:** Render the badge if and only if `color.within_sRGB === false && color.within_P3 === true`. This property is already present on every `TColor` object (`src/shared/colorFuncs/index.ts:63–66`) — no additional computation needed.

**Detection:** Use the `TColor.within_sRGB` and `TColor.within_P3` getters already computed by `lch2color`. Do NOT use `colorjs.io` — the codebase already has this data via `isWithinGamut(xyz2p3(xyz))` (`src/shared/colorFuncs/index.ts:65`).

**Placement:** Inside the `<button>` element in `src/components/PaletteSwatches.tsx:86–103`, positioned `absolute top-0 right-0` within the `relative` swatch button.

**Visual spec:**

```tsx
{!color.within_sRGB && color.within_P3 && (
  <span
    title="This color is in Display-P3 but outside sRGB"
    style={{
      position: 'absolute',
      top: '2px',
      right: '2px',
      background: 'oklch(0.7 0.15 145)',
      color: 'white',
      fontSize: '0.625rem',
      lineHeight: 1,
      padding: '0.125rem 0.25rem',
      borderRadius: '0.25rem',
      pointerEvents: 'none',
      userSelect: 'none',
    }}
  >
    P3
  </span>
)}
```

**SSR safety:** Swatch colors come from `paletteStore` (a nanostores client atom); the component is already `'use client'`. No SSR concern.

---

## 5. Open Questions

1. **Graph count / layout:** The code exposes a generic `Scale` component parameterized by `channel`. The host page/layout that mounts the 6 `<Scale>` instances was not found in the files reviewed. Confirm which file composes the 6 graphs and how hue-row vs. tone-column selection is wired — this matters for documenting graph layout precisely.

2. **`showP3` / `showRec2020` flags:** `DrawChartProps` in `paintWorker.ts:7–17` includes `showP3` and `showRec2020` booleans, but their wiring from `chartSettingsStore` was not traced in this pass. Confirm whether a UI toggle already controls these flags (the ChartSettings component was not read), or whether enabling the P3 graph fill is a new feature to implement.

3. **Gamut badge — `colorjs.io` vs internal:** The spec calls for `Color.inGamut('srgb')` from `colorjs.io`, but the codebase already computes `within_sRGB` and `within_P3` on every `TColor` in `src/shared/colorFuncs/index.ts:50–66`. Confirm whether the per-swatch badge should use the existing `TColor` flags (preferred — zero additional dependency) or introduce `colorjs.io` as a new import.

4. **`deltaEContrast` badge:** There is no `ContrastBadgeDeltaE` component, yet `DELTA_E` is a selectable overlay mode. Confirm whether a delta-E badge should be added to `ColorInfo`, or whether the mode is intentionally display-only (shown in swatches as a number without a dedicated info badge).

5. **APCA sign convention:** `apcaContrast` uses `Math.abs()` discarding polarity. APCA polarity (light-on-dark vs. dark-on-light) is semantically meaningful. Confirm whether the absolute-value wrap is intentional or a known simplification to be addressed.

6. **Header gamut badge position:** The header already has multiple `ControlGroup` sections with flexible wrapping. Confirm preferred exact position (before or after `ChartSettings`) and whether the gamut chips should be inside a `ControlGroup` border or stand alone.
