import Color from 'colorjs.io'
import type { TColor } from './types'
import { spaceName } from './types'

export type SelectedColorDisplay = {
  /** CSS background for P3 swatch (display-p3 only) */
  p3Background: string
  /** CSS background for Fallback swatch (sRGB only — hex / color(srgb)) */
  fallbackBackground: string
  oklch: string
  hex: string
  within_sRGB: boolean
  showFallbackNote: boolean
}

function colorFromTColor(color: TColor): Color {
  const { mode, l, c, h } = color
  if (mode === spaceName.oklch) {
    return new Color('oklch', [l / 100, c, h] as [number, number, number])
  }
  return new Color('lch', [l, c, h] as [number, number, number])
}

/** sRGB-only CSS color (hex). Hex is always interpreted as sRGB in CSS. */
function toSrgbHex(c: Color, method: 'clip' | 'map' = 'map'): string {
  const mapped =
    method === 'clip'
      ? c.to('srgb').toGamut({ space: 'srgb', method: 'clip' })
      : c.to('srgb').toGamut({ space: 'srgb' })
  return mapped.toString({ format: 'hex' })
}

/** P3-only CSS color — never use for the Fallback swatch. */
function toP3Css(c: Color): string {
  return c.to('p3').toString()
}

/** P3 swatch + sRGB fallback strings for the selected swatch card (oklch.com-style). */
export function getSelectedColorDisplay(color: TColor): SelectedColorDisplay {
  const native = colorFromTColor(color)

  const p3Background = toP3Css(native)
  const fallbackHex = toSrgbHex(native, 'map')
  const hex = fallbackHex

  let fallbackBackground = fallbackHex
  if (!color.within_sRGB) {
    const clipHex = toSrgbHex(native, 'clip')
    fallbackBackground = `linear-gradient(to right, ${clipHex}, ${fallbackHex})`
  }

  const oklch = native.to('oklch')
  const [L, C, H] = oklch.coords.map(v => v ?? 0)
  const oklchString = `oklch(${formatCoord(L)} ${formatCoord(C)} ${formatCoord(H)})`

  return {
    p3Background,
    fallbackBackground,
    oklch: oklchString,
    hex,
    within_sRGB: color.within_sRGB,
    showFallbackNote: !color.within_sRGB,
  }
}

function formatCoord(value: number): string {
  const rounded = Math.round(value * 10_000) / 10_000
  return String(rounded)
}
