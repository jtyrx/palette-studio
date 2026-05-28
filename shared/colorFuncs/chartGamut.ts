import type { LCH, XYZ } from '../types'
import {
  gam_2020,
  gam_P3,
  gam_sRGB,
  XYZ_to_lin_2020,
  XYZ_to_lin_P3,
  XYZ_to_lin_sRGB,
} from './colorMath/conversions'

/** Hot-path tolerance — matches evilmartians/oklch-picker RENDER_GAP */
export const RENDER_GAP = 1e-7

export const Space = {
  Out: 0,
  sRGB: 1,
  P3: 2,
  Rec2020: 3,
} as const

export type GamutSpace = (typeof Space)[keyof typeof Space]

/** Pixel tag + 8-bit channels for the active encoding */
export type ChartPixel = [GamutSpace, number, number, number]

export type BorderColor = {
  r: number
  g: number
  b: number
  alpha: number
}

function inRenderGap(r: number, g: number, b: number): boolean {
  return (
    r >= -RENDER_GAP &&
    r <= 1 + RENDER_GAP &&
    g >= -RENDER_GAP &&
    g <= 1 + RENDER_GAP &&
    b >= -RENDER_GAP &&
    b <= 1 + RENDER_GAP
  )
}

function toByte(channel: number): number {
  return Math.floor(255 * Math.min(1, Math.max(0, channel)))
}

function luminanceGray(lr: number, lg: number, lb: number): number {
  return toByte(0.2126 * lr + 0.7152 * lg + 0.0722 * lb)
}

const LIN = new Float64Array(3)
const P3 = new Float64Array(3)
const REC = new Float64Array(3)

function readLinSrgb(xyz: XYZ): void {
  const lin = XYZ_to_lin_sRGB(xyz)
  LIN[0] = lin[0]
  LIN[1] = lin[1]
  LIN[2] = lin[2]
}

function readLinP3(xyz: XYZ): void {
  const lin = XYZ_to_lin_P3(xyz)
  P3[0] = lin[0]
  P3[1] = lin[1]
  P3[2] = lin[2]
}

function readLinRec2020(xyz: XYZ): void {
  const lin = XYZ_to_lin_2020(xyz)
  REC[0] = lin[0]
  REC[1] = lin[1]
  REC[2] = lin[2]
}

const white: ChartPixel = [Space.sRGB, 255, 255, 255]

/**
 * Classify XYZ and choose display bytes — aligned with oklch-picker generateGetPixel.
 * With `p3Support`, wide-gamut regions use linear Display-P3 / Rec.2020 channel bytes.
 */
export function chartPixelFromXyz(
  xyz: XYZ,
  showP3: boolean,
  showRec2020: boolean,
  p3Support: boolean,
  showColors: boolean
): ChartPixel {
  readLinSrgb(xyz)
  const lr = LIN[0]
  const lg = LIN[1]
  const lb = LIN[2]
  const srgb = gam_sRGB([lr, lg, lb])

  if (!showP3 && !showRec2020) {
    if (inRenderGap(lr, lg, lb)) {
      if (!showColors) return white
      return [Space.sRGB, toByte(srgb[0]), toByte(srgb[1]), toByte(srgb[2])]
    }
    return [Space.Out, 0, 0, 0]
  }

  if (showP3 && showRec2020) {
    if (p3Support) {
      readLinP3(xyz)
      const pr = P3[0]
      const pg = P3[1]
      const pb = P3[2]
      const pixel: ChartPixel = [Space.Out, toByte(pr), toByte(pg), toByte(pb)]

      if (inRenderGap(lr, lg, lb)) {
        pixel[0] = Space.sRGB
        if (!showColors) return white
        pixel[1] = toByte(srgb[0])
        pixel[2] = toByte(srgb[1])
        pixel[3] = toByte(srgb[2])
      } else if (inRenderGap(pr, pg, pb)) {
        pixel[0] = Space.P3
        if (!showColors) {
          const y = luminanceGray(lr, lg, lb)
          return [Space.P3, y, y, y]
        }
      } else {
        readLinRec2020(xyz)
        if (inRenderGap(REC[0], REC[1], REC[2])) {
          pixel[0] = Space.Rec2020
          if (!showColors) {
            const y = luminanceGray(lr, lg, lb)
            return [Space.Rec2020, y, y, y]
          }
          pixel[1] = toByte(REC[0])
          pixel[2] = toByte(REC[1])
          pixel[3] = toByte(REC[2])
        }
      }
      return pixel
    }

    const pixel: ChartPixel = [
      Space.Out,
      toByte(srgb[0]),
      toByte(srgb[1]),
      toByte(srgb[2]),
    ]
    if (inRenderGap(lr, lg, lb)) {
      pixel[0] = Space.sRGB
      if (!showColors) return white
    } else {
      readLinP3(xyz)
      if (inRenderGap(P3[0], P3[1], P3[2])) {
        pixel[0] = Space.P3
        if (!showColors) {
          const y = luminanceGray(lr, lg, lb)
          return [Space.P3, y, y, y]
        }
        const p3g = gam_P3([P3[0], P3[1], P3[2]])
        pixel[1] = toByte(p3g[0])
        pixel[2] = toByte(p3g[1])
        pixel[3] = toByte(p3g[2])
      } else {
        readLinRec2020(xyz)
        if (inRenderGap(REC[0], REC[1], REC[2])) {
          pixel[0] = Space.Rec2020
          if (!showColors) {
            const y = luminanceGray(lr, lg, lb)
            return [Space.Rec2020, y, y, y]
          }
          const recg = gam_2020([REC[0], REC[1], REC[2]])
          pixel[1] = toByte(recg[0])
          pixel[2] = toByte(recg[1])
          pixel[3] = toByte(recg[2])
        }
      }
    }
    return pixel
  }

  if (showP3) {
    if (p3Support) {
      readLinP3(xyz)
      const pr = P3[0]
      const pg = P3[1]
      const pb = P3[2]
      const pixel: ChartPixel = [Space.Out, toByte(pr), toByte(pg), toByte(pb)]
      if (inRenderGap(lr, lg, lb)) {
        pixel[0] = Space.sRGB
        if (!showColors) return white
        pixel[1] = toByte(srgb[0])
        pixel[2] = toByte(srgb[1])
        pixel[3] = toByte(srgb[2])
      } else if (inRenderGap(pr, pg, pb)) {
        pixel[0] = Space.P3
        if (!showColors) {
          const y = luminanceGray(lr, lg, lb)
          return [Space.P3, y, y, y]
        }
      }
      return pixel
    }

    const pixel: ChartPixel = [
      Space.Out,
      toByte(srgb[0]),
      toByte(srgb[1]),
      toByte(srgb[2]),
    ]
    if (inRenderGap(lr, lg, lb)) {
      pixel[0] = Space.sRGB
      if (!showColors) return white
    } else {
      readLinP3(xyz)
      if (inRenderGap(P3[0], P3[1], P3[2])) {
        pixel[0] = Space.P3
        if (!showColors) {
          const y = luminanceGray(lr, lg, lb)
          return [Space.P3, y, y, y]
        }
        const p3g = gam_P3([P3[0], P3[1], P3[2]])
        pixel[1] = toByte(p3g[0])
        pixel[2] = toByte(p3g[1])
        pixel[3] = toByte(p3g[2])
      }
    }
    return pixel
  }

  // Rec.2020 only
  if (p3Support) {
    readLinP3(xyz)
    const pixel: ChartPixel = [
      Space.Out,
      toByte(P3[0]),
      toByte(P3[1]),
      toByte(P3[2]),
    ]
    if (inRenderGap(lr, lg, lb)) {
      pixel[0] = Space.sRGB
      if (!showColors) return white
      pixel[1] = toByte(srgb[0])
      pixel[2] = toByte(srgb[1])
      pixel[3] = toByte(srgb[2])
    } else {
      readLinRec2020(xyz)
      if (inRenderGap(REC[0], REC[1], REC[2])) {
        pixel[0] = Space.Rec2020
        if (!showColors) {
          const y = luminanceGray(lr, lg, lb)
          return [Space.Rec2020, y, y, y]
        }
        pixel[1] = toByte(REC[0])
        pixel[2] = toByte(REC[1])
        pixel[3] = toByte(REC[2])
      }
    }
    return pixel
  }

  const pixel: ChartPixel = [
    Space.Out,
    toByte(srgb[0]),
    toByte(srgb[1]),
    toByte(srgb[2]),
  ]
  if (inRenderGap(lr, lg, lb)) {
    pixel[0] = Space.sRGB
    if (!showColors) return white
  } else {
    readLinRec2020(xyz)
    if (inRenderGap(REC[0], REC[1], REC[2])) {
      pixel[0] = Space.Rec2020
      if (!showColors) {
        const y = luminanceGray(lr, lg, lb)
        return [Space.Rec2020, y, y, y]
      }
      const recg = gam_2020([REC[0], REC[1], REC[2]])
      pixel[1] = toByte(recg[0])
      pixel[2] = toByte(recg[1])
      pixel[3] = toByte(recg[2])
    }
  }
  return pixel
}

export function chartPixelFromLch(
  lch: LCH,
  lch2xyz: (lch: LCH) => XYZ,
  showP3: boolean,
  showRec2020: boolean,
  p3Support: boolean,
  showColors: boolean
): ChartPixel {
  return chartPixelFromXyz(
    lch2xyz(lch),
    showP3,
    showRec2020,
    p3Support,
    showColors
  )
}
