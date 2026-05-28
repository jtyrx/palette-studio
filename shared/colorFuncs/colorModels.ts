import Color from 'colorjs.io'
import { LCH, spaceName, XYZ } from '../types'
import { TLchModel } from '.'

export const cielch: TLchModel = {
  name: spaceName.cielch,
  lch2xyz: ([l, c, h]: LCH): XYZ =>
    new Color('lch', [l, c, h] as [number, number, number]).to('xyz-d65').coords.map(v => v ?? 0) as XYZ,
  xyz2lch: (xyz: XYZ): LCH =>
    new Color('xyz-d65', xyz as [number, number, number]).to('lch').coords.map(v => v ?? 0) as LCH,
  ranges: {
    l: { min: 0, max: 100, step: 0.5, precision: 2 },
    c: { min: 0, max: 134, step: 0.5, precision: 2 },
    h: { min: 0, max: 360, step: 0.5, precision: 2 },
  },
}

export const oklch: TLchModel = {
  name: spaceName.oklch,
  // l is [0-100] display scale; colorjs.io uses [0-1]
  lch2xyz: ([l, c, h]: LCH): XYZ =>
    new Color('oklch', [l / 100, c, h] as [number, number, number]).to('xyz-d65').coords.map(v => v ?? 0) as XYZ,
  xyz2lch: (xyz: XYZ): LCH => {
    const coords = new Color('xyz-d65', xyz as [number, number, number]).to('oklch').coords
    const [l, c, h] = coords.map(v => v ?? 0)
    return [l * 100, c, h]
  },
  ranges: {
    l: { min: 0, max: 100, step: 0.5, precision: 2 },
    c: { min: 0, max: 0.33, step: 0.005, precision: 3 },
    h: { min: 0, max: 360, step: 0.5, precision: 2 },
  },
}
