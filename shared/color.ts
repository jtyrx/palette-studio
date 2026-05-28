import chroma from 'chroma-js'
import Color from 'colorjs.io'
import { APCAcontrast, sRGBtoY } from 'apca-w3'
import { TColor } from './types'

const hexTo255 = (hex: string) =>
  new Color(hex).to('srgb').coords.map((v: number | null) => (v ?? 0) * 255) as [number, number, number]

export const wcagContrast = (backgroundHex: string, textHex: string): number =>
  chroma.contrast(backgroundHex, textHex)

export const apcaContrast = (backgroundHex: string, textHex: string): number =>
  Math.round(
    +APCAcontrast(sRGBtoY(hexTo255(textHex)), sRGBtoY(hexTo255(backgroundHex)))
  )

export const deltaEContrast = (backgroundHex: string, textHex: string): number =>
  chroma.deltaE(backgroundHex, textHex)

export const getMostContrast = (color: string, colorList: string[]): string => {
  const contrastRatios = colorList.map(c => Math.abs(apcaContrast(color, c)))
  const maxContrast = Math.max(...contrastRatios)
  const i = contrastRatios.indexOf(maxContrast)
  return colorList[i]
}

export const valid = (hex: string): boolean => {
  try {
    new Color(hex)
    return true
  } catch {
    return false
  }
}

export const colorToLchString = (color: TColor) => {
  const { mode, l, c, h } = color
  if (mode === 'cielch') {
    return `lch(${round(l)}% ${round(c, 3)} ${round(h)})`
  } else if (mode === 'oklch') {
    return `oklch(${round(l)}% ${round(c, 3)} ${round(h)})`
  }
  return ''
}

function round(v: number, exp = 2) {
  return Math.round(v * 10 ** exp) / 10 ** exp
}
