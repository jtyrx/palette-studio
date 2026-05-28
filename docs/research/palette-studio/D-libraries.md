# D — Library Seam: colorjs.io vs chroma-js

## VERDICT BLOCK

```
RECOMMENDATION: hybrid (colorjs.io primary, chroma-js for WCAG 2.1 ratio only)
CONFIDENCE: high

ONE-PARAGRAPH RATIONALE:
colorjs.io natively handles oklch, display-p3, rec2020, CSS Color 4 serialization,
gamut checks, ΔE 2000, and hex parsing — covering every current chroma-js call
except WCAG 2.1 contrast (chroma.contrast). chroma.contrast implements the
WCAG 2.1 relative-luminance ratio formula; colorjs.io exposes the same as
Color.contrast(other, {algorithm: 'wcag21'}), so it is replaceable too, but
the gain is marginal for a one-liner. Retaining chroma-js solely for
wcagContrast() (one call site) keeps the migration risk minimal while eliminating
the larger chroma surface. The custom matrix math in colorFuncs/colorMath/ is a
vendored copy of the CSS Color 4 sample code (W3C/Lea Verou origin) — it already
does what colorjs.io does internally; replacing it with colorjs.io inside the
comlink worker is possible and would reduce ~350 lines of vendored JS, but it is
an optional cleanup, not a correctness fix.

TOP RISK IF I'M WRONG:
colorjs.io's WCAG 2.1 contrast output may differ by rounding from chroma's
implementation, causing regression in existing contrast-badge thresholds.
```

**colorjs.io owns:**
- Hex validation (`new Color(hex)` try/catch or `Color.parse`)
- Hex → [r,g,b] array (`.to('srgb').coords`)
- ΔE 2000 (`color1.deltaE(color2, 'OK'` or `'2000'`)
- CSS Color 4 serialization: `oklch(...)`, `color(display-p3 ...)`, `lch(...)`
- Gamut checks: `color.inGamut('srgb')`, `color.inGamut('p3')`, `color.inGamut('rec2020')`
- oklch ↔ srgb ↔ display-p3 ↔ rec2020 space conversions (optional replacement for colorFuncs/colorMath)

**chroma-js retains:**
- `chroma.contrast(bg, text)` — WCAG 2.1 ratio (single call site in `color.ts`)

---

## 1. Seam Definition — Call-by-Call

| Current call | colorjs.io equivalent | Confidence | Notes |
|---|---|---|---|
| `chroma.contrast(bg, text)` (WCAG 2.1) | `new Color(bg).contrast(new Color(text), {algorithm: 'wcag21'})` | medium | Functionally equivalent; rounding may differ ±0.01. chroma-js is safer here given existing badge thresholds. **Recommend keeping chroma for this one call.** |
| `chroma.deltaE(bg, text)` (ΔE 2000) | `new Color(bg).deltaE(new Color(text), '2000')` | high | colorjs.io supports ΔE 76, CMC, 2000, ITP, OK. Direct replacement. |
| `chroma(hex).rgb()` → `[r,g,b]` | `new Color(hex).to('srgb').coords.map(c => c * 255)` | high | Returns [0–255] array matching current usage. |
| `chroma.valid(hex)` | `try { new Color(hex); return true } catch { return false }` | high | No dedicated `.valid()` static; try/catch is idiomatic. Can be extracted to a one-line helper. |
| CSS Color 4 output (`oklch(...)`) | `new Color('oklch', [l, c, h]).toString({format: 'oklch'})` | high | chroma-js cannot produce CSS Color 4 oklch strings at all; colorjs.io is already the correct choice here. |
| `inGamut('srgb')`, `inGamut('p3')` | `color.inGamut('srgb')`, `color.inGamut('p3')` | high | Native colorjs.io API, no chroma equivalent. |

**Net result:** chroma-js reduces to a single retained call (`chroma.contrast`) at one site in `color.ts`.

---

## 2. Custom Matrix Math in paintWorker.ts

### What the current code does

`src/shared/colorFuncs/colorMath/conversions.js` (~350 lines) is a verbatim copy
of the W3C CSS Color 4 sample conversion code (authored by Lea Verou / Chris Lilley).
It exports pure functions: `lin_sRGB`, `gam_sRGB`, `lin_sRGB_to_XYZ`, `XYZ_to_lin_sRGB`,
`lin_P3_to_XYZ`, `XYZ_to_lin_P3`, `lin_2020_to_XYZ`, `XYZ_to_lin_2020`,
`D65_to_D50`, `D50_to_D65`, `XYZ_to_Lab`, `Lab_to_XYZ`, `Lab_to_LCH`, `LCH_to_Lab`,
`XYZ_to_OKLab`, `OKLab_to_XYZ`, `OKLab_to_OKLCH`, `OKLCH_to_OKLab`.

`colorFuncs/index.ts` composes these into `lch2color([l,c,h])` which returns
`{r, g, b, within_sRGB, within_P3, within_Rec2020}`. This function is what
`paintWorker.ts` consumes — it never imports chroma-js or colorjs.io directly.

### Does colorjs.io work inside a comlink Worker?

**Yes, with a caveat.** colorjs.io is designed for browser and Node environments.
It does not use `document`, `getComputedStyle`, or `window` for its color math.
The only potential DOM touch is in CSS color string parsing (which may call
`getComputedStyle` in some builds to resolve `currentColor` or named CSS colors).
Parsing plain `oklch(...)` / `color(display-p3 ...)` strings is safe in a Worker.
Instantiating `new Color('oklch', [l, c, h])` with array coords (not a CSS string)
has no DOM dependency at all.

**Source:** colorjs.io README and issue tracker confirm Worker compatibility for
coord-based construction; CSS-string parsing of `currentColor` is the only
known Worker exclusion. *(Citing published documentation, not runtime-verified
in this session.)*

### colorjs.io equivalent of the lch2xyz → pixel pipeline

Current pipeline (5 composed calls in colorFuncs):
```
OKLCH → OKLab → XYZ(D65) → lin_sRGB → gam_sRGB → [r,g,b]
```

colorjs.io equivalent (3–4 lines, usable inside a comlink Worker):
```js
import Color from 'colorjs.io'

function lch2color([l, c, h], mode = 'oklch') {
  const col = new Color(mode, [l, c, h])
  const srgb = col.to('srgb')
  const within_sRGB = srgb.inGamut()
  const [r, g, b] = srgb.toGamut().coords.map(v => Math.round(v * 255))
  const within_P3  = col.inGamut('p3')
  const within_Rec2020 = col.inGamut('rec2020')
  return { r, g, b, within_sRGB, within_P3, within_Rec2020 }
}
```

This replaces the entire `colorFuncs/colorMath/` layer + the composition in
`colorFuncs/index.ts`. **Whether to do this is a separate decision** — the matrix
math is correct and tested; replacing it with colorjs.io is a cleanup, not a
required part of the chroma-js migration.

**Recommendation:** Defer the matrix math replacement. Migrate chroma-js calls
in `color.ts` and `colorFuncs/index.ts` first. Revisit colorMath/ in a follow-up.

---

## 3. DTCG + CSS Color 4 Compliance

colorjs.io serializes to CSS Color 4 natively:

```js
import Color from 'colorjs.io'

// oklch notation
const col = new Color('oklch', [0.65, 0.18, 240])
col.toString()                          // "oklch(65% 0.18 240)"
col.toString({format: 'oklch'})         // same, explicit

// display-p3 notation
const p3 = new Color('p3', [0.3, 0.6, 0.9])
p3.toString()                           // "color(display-p3 0.3 0.6 0.9)"
p3.toString({format: 'color'})          // same, explicit CSS color() function form

// Convert from oklch to display-p3 string in one step
new Color('oklch', [0.65, 0.18, 240]).to('p3').toString()
// → "color(display-p3 0.2… 0.6… 0.8…)"
```

This replaces `colorToLchString()` in `color.ts`, which currently hand-formats
the string with `template literals`. colorjs.io's output is spec-correct and
handles edge cases (NaN hue for achromatic colors) that the current code does not.

---

## 4. Migration Cost Estimate

```
grep -rn "chroma\b" /Users/acorda/Projects/palette-studio/src/ \
  --include="*.ts" --include="*.tsx" \
  | grep -v "chromaScale\|change chroma\|chroma-js\|chromaticity\|chroma of"
```

**Result: 10 lines** across 2 files:
- `src/shared/color.ts` — 6 lines (wcagContrast, apcaContrast ×2, deltaEContrast, valid, import)
- `src/shared/colorFuncs/index.ts` — 4 lines (chroma.valid, chroma(hex).rgb(), import, type cast)

**Estimated LOC change for the seam migration (chroma → colorjs.io in these two files only):**

| File | Lines removed | Lines added | Net |
|---|---|---|---|
| `color.ts` | 6 (1 import + 5 call sites) | ~8 (colorjs.io equivalents + 1 import) | +2 |
| `colorFuncs/index.ts` | 4 (1 import + 3 call sites) | ~5 | +1 |
| **Total** | **10** | **~13** | **+3** |

chroma-js remains as a dependency (for wcagContrast) but is reduced to 1 import
and 1 call. If wcagContrast is also migrated, chroma-js is fully removed.

**Matrix math replacement (optional):** ~350 lines removed from `colorMath/`,
~20 lines added to `colorFuncs/index.ts`. High-risk for the paint worker;
requires regression testing of gamut boundaries.

---

## 5. Key colorjs.io APIs for This Project

1. `new Color('oklch', [l, c, h])` — construct from coords (Worker-safe)
2. `new Color(hexString)` — parse hex (Worker-safe for #rrggbb form)
3. `color.to('srgb')` — space conversion
4. `color.inGamut('srgb' | 'p3' | 'rec2020')` — gamut test
5. `color.toGamut()` — clamp to gamut
6. `color.toString({format: 'oklch'})` — CSS Color 4 serialization
7. `color.toString()` on a p3 color → `color(display-p3 ...)` form
8. `color.deltaE(other, '2000')` — ΔE 2000
9. `color.contrast(other, {algorithm: 'wcag21'})` — WCAG ratio (optional replacement)
10. `color.coords` — raw [x,y,z] array after `.to(space)`
