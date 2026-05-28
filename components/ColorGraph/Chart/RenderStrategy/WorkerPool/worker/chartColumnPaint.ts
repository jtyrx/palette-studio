import type { LCH, XYZ } from '@/shared/types'
import {
  BorderColor,
  ChartPixel,
  chartPixelFromLch,
  GamutSpace,
  Space,
} from '@/shared/colorFuncs/chartGamut'
import { Pixels } from './Pixels'

export type GetSeparator = (
  prevSpace: GamutSpace,
  nextSpace: GamutSpace
) => [number, number][]

export function createGetSeparator(): GetSeparator {
  const separators: Partial<Record<string, [number, number][]>> = {}
  return (prevSpace, nextSpace) => {
    const key = `${prevSpace}${nextSpace}`
    if (!separators[key]) separators[key] = []
    return separators[key]!
  }
}

/** Map scan coordinate to canvas row (0 = top). Matches legacy paintWorker setPixel(dx, y). */
function paintRow(
  pixels: Pixels,
  x: number,
  y: number,
  pixel: ChartPixel
): void {
  const row = Math.min(Math.max(0, y), pixels.height - 1)
  pixels.setPixel(x, row, [pixel[1], pixel[2], pixel[3], 255])
}

/** Draw gamut boundary strokes — ported from oklch-picker separate() */
export function drawGamutSeparators(
  pixels: Pixels,
  color: BorderColor,
  line: [number, number][] | undefined
): void {
  if (!line?.length) return

  let prevY = line[0]![1]
  let prevX = 0
  const data = pixels.array
  const { width } = pixels

  for (const [x, row] of line) {
    if (x > prevX + 1) {
      prevY = line[0]![1]!
    }
    if (Math.abs(prevY - row) < 10) {
      const pos = 4 * (row * width + x)
      data[pos] = Math.round(color.r * 255)
      data[pos + 1] = Math.round(color.g * 255)
      data[pos + 2] = Math.round(color.b * 255)
      data[pos + 3] = Math.round(color.alpha * 255)
    }
    prevX = x
    prevY = row
  }
}

export type ColumnPaintOptions = {
  pixels: Pixels
  columnX: number
  height: number
  block: number
  hasGaps: boolean
  showP3: boolean
  showRec2020: boolean
  p3Support: boolean
  showColors: boolean
  borderP3: BorderColor
  borderRec2020: BorderColor
  lch2xyz: (lch: LCH) => XYZ
  sampleLch: (y: number) => LCH
  shouldStopColumn?: (pixel: ChartPixel, y: number, hadColors: boolean) => boolean
}

/**
 * Block-step column rasterization (oklch-picker paint.ts).
 * sampleLch(y) uses y=0 at the top (channel max) — do not flip with (height - y).
 */
export function paintChartColumn(options: ColumnPaintOptions): void {
  const {
    pixels,
    columnX,
    height,
    block,
    hasGaps,
    showP3,
    showRec2020,
    p3Support,
    showColors,
    borderP3,
    borderRec2020,
    lch2xyz,
    sampleLch,
    shouldStopColumn,
  } = options

  const getSeparator = createGetSeparator()
  const maxGap = 0.42 * height
  let hadColors = false

  const getPixel = (y: number): ChartPixel =>
    chartPixelFromLch(
      sampleLch(y),
      lch2xyz,
      showP3,
      showRec2020,
      p3Support,
      showColors
    )

  let pixel = getPixel(0)
  let prevPixel = pixel

  for (let y = 0; y <= height; y += block) {
    const nextY = Math.min(y + block, height)
    const nextPixel = getPixel(nextY)

    if (nextPixel[0] !== pixel[0]) {
      if (pixel[0] !== Space.Out) {
        paintRow(pixels, columnX, y, pixel)
        if (pixel[0] === Space.sRGB) hadColors = true
      }

      let prevIPixel = pixel
      for (let i = 1; i <= block && y + i <= height; i++) {
        const iPixel = getPixel(y + i)
        if (iPixel[0] !== prevIPixel[0]) {
          getSeparator(prevIPixel[0], iPixel[0]).push([columnX, y + i])
        }
        if (iPixel[0] !== Space.Out) {
          paintRow(pixels, columnX, y + i, iPixel)
          if (iPixel[0] === Space.sRGB) hadColors = true
        }
        prevIPixel = iPixel
      }
    } else if (pixel[0] !== Space.Out) {
      for (let i = 0; i < block && y + i <= height; i++) {
        paintRow(pixels, columnX, y + i, pixel)
        if (pixel[0] === Space.sRGB) hadColors = true
      }
    } else if (hasGaps) {
      if (prevPixel[0] !== Space.Out && y > maxGap) {
        break
      }
    } else if (shouldStopColumn?.(pixel, y, hadColors)) {
      break
    }

    if (shouldStopColumn?.(nextPixel, nextY, hadColors)) break

    prevPixel = pixel
    pixel = nextPixel
  }

  if (showP3 && showRec2020) {
    drawGamutSeparators(pixels, borderP3, getSeparator(Space.sRGB, Space.P3))
    drawGamutSeparators(pixels, borderP3, getSeparator(Space.P3, Space.sRGB))
    drawGamutSeparators(
      pixels,
      borderRec2020,
      getSeparator(Space.P3, Space.Rec2020)
    )
    drawGamutSeparators(
      pixels,
      borderRec2020,
      getSeparator(Space.Rec2020, Space.P3)
    )
  } else if (!showRec2020 && showP3) {
    drawGamutSeparators(pixels, borderP3, getSeparator(Space.sRGB, Space.P3))
    drawGamutSeparators(pixels, borderP3, getSeparator(Space.P3, Space.sRGB))
  } else if (showRec2020 && !showP3) {
    drawGamutSeparators(
      pixels,
      borderRec2020,
      getSeparator(Space.sRGB, Space.Rec2020)
    )
    drawGamutSeparators(
      pixels,
      borderRec2020,
      getSeparator(Space.Rec2020, Space.sRGB)
    )
  }
}
