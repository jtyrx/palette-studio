import * as Comlink from 'comlink'
import { spaceName, TColor } from '@/shared/types'
import { colorSpaces } from '@/shared/colorFuncs'
import type { BorderColor } from '@/shared/colorFuncs/chartGamut'
import { Space } from '@/shared/colorFuncs/chartGamut'
import { paddedScale, sycledLerp } from '@/shared/interpolation'
import { Pixels } from './Pixels'
import { paintChartColumn } from './chartColumnPaint'

export type DrawChartProps = {
  width: number
  height: number
  widthFrom?: number
  widthTo?: number
  colors: TColor[]
  mode: spaceName
  showColors?: boolean
  showP3?: boolean
  showRec2020?: boolean
  p3Support?: boolean
  borderP3?: BorderColor
  borderRec2020?: BorderColor
}

const DEFAULT_BORDER_P3: BorderColor = {
  r: 130 / 255,
  g: 130 / 255,
  b: 130 / 255,
  alpha: 1,
}

const DEFAULT_BORDER_REC2020: BorderColor = {
  r: 100 / 255,
  g: 100 / 255,
  b: 100 / 255,
  alpha: 1,
}

type ColumnContext = {
  width: number
  height: number
  widthFrom: number
  widthTo: number
  showColors: boolean
  showP3: boolean
  showRec2020: boolean
  p3Support: boolean
  borderP3: BorderColor
  borderRec2020: BorderColor
  lch2xyz: (lch: import('@/shared/types').LCH) => import('@/shared/types').XYZ
}

function paintSlice(
  ctx: ColumnContext,
  paintColumn: (pixels: Pixels, columnX: number) => void
) {
  const sliceWidth = ctx.widthTo - ctx.widthFrom
  const pixels = new Pixels(sliceWidth, ctx.height)

  for (let x = ctx.widthFrom; x < ctx.widthTo; x++) {
    paintColumn(pixels, x - ctx.widthFrom)
  }

  return bakeBitmap(pixels)
}

function drawLuminosityChart(props: DrawChartProps) {
  const {
    width,
    height,
    colors,
    mode,
    showColors = false,
    showP3 = false,
    showRec2020 = false,
    p3Support = false,
    borderP3 = DEFAULT_BORDER_P3,
    borderRec2020 = DEFAULT_BORDER_REC2020,
    widthFrom = 0,
    widthTo = width,
  } = props

  const { ranges, lch2xyz } = colorSpaces[mode]
  const chromaScale = paddedScale(
    width,
    colors.map(color => color.c)
  )
  const hueScale = paddedScale(
    width,
    colors.map(color => color.h),
    ranges.h.max
  )

  return paintSlice(
    {
      width,
      height,
      widthFrom,
      widthTo,
      showColors,
      showP3,
      showRec2020,
      p3Support,
      borderP3,
      borderRec2020,
      lch2xyz,
    },
    (pixels, columnX) => {
      const x = widthFrom + columnX
      const c = chromaScale(x)
      const h = hueScale(x)

      paintChartColumn({
        pixels,
        columnX,
        height,
        block: 2,
        hasGaps: true,
        showP3,
        showRec2020,
        p3Support,
        showColors,
        borderP3,
        borderRec2020,
        lch2xyz,
        sampleLch: y => {
          const l = sycledLerp(ranges.l.max, ranges.l.min, y / height)
          return [l, c, h]
        },
        shouldStopColumn: (pixel, _y, hadColors) =>
          hadColors && pixel[0] === Space.Out,
      })
    }
  )
}

function drawChromaChart(props: DrawChartProps) {
  const {
    width,
    height,
    colors,
    mode,
    showColors = false,
    showP3 = false,
    showRec2020 = false,
    p3Support = false,
    borderP3 = DEFAULT_BORDER_P3,
    borderRec2020 = DEFAULT_BORDER_REC2020,
    widthFrom = 0,
    widthTo = width,
  } = props

  const { ranges, lch2xyz } = colorSpaces[mode]
  const luminostyScale = paddedScale(
    width,
    colors.map(color => color.l)
  )
  const hueScale = paddedScale(
    width,
    colors.map(color => color.h),
    ranges.h.max
  )

  return paintSlice(
    {
      width,
      height,
      widthFrom,
      widthTo,
      showColors,
      showP3,
      showRec2020,
      p3Support,
      borderP3,
      borderRec2020,
      lch2xyz,
    },
    (pixels, columnX) => {
      const x = widthFrom + columnX
      const l = luminostyScale(x)
      const h = hueScale(x)

      paintChartColumn({
        pixels,
        columnX,
        height,
        block: 6,
        hasGaps: false,
        showP3,
        showRec2020,
        p3Support,
        showColors,
        borderP3,
        borderRec2020,
        lch2xyz,
        sampleLch: y => {
          const c = sycledLerp(ranges.c.max, ranges.c.min, y / height)
          return [l, c, h]
        },
        // Max chroma is at y=0; do not stop on the initial Out region above the gamut body.
        shouldStopColumn: (pixel, _y, hadColors) =>
          hadColors && pixel[0] === Space.Out,
      })
    }
  )
}

function drawHueChart(props: DrawChartProps) {
  const {
    width,
    height,
    colors,
    mode,
    showColors = false,
    showP3 = false,
    showRec2020 = false,
    p3Support = false,
    borderP3 = DEFAULT_BORDER_P3,
    borderRec2020 = DEFAULT_BORDER_REC2020,
    widthFrom = 0,
    widthTo = width,
  } = props

  const { ranges, lch2xyz } = colorSpaces[mode]
  const luminostyScale = paddedScale(
    width,
    colors.map(color => color.l)
  )
  const chromaScale = paddedScale(
    width,
    colors.map(color => color.c)
  )

  return paintSlice(
    {
      width,
      height,
      widthFrom,
      widthTo,
      showColors,
      showP3,
      showRec2020,
      p3Support,
      borderP3,
      borderRec2020,
      lch2xyz,
    },
    (pixels, columnX) => {
      const x = widthFrom + columnX
      const l = luminostyScale(x)
      const c = chromaScale(x)

      paintChartColumn({
        pixels,
        columnX,
        height,
        block: 2,
        hasGaps: false,
        showP3,
        showRec2020,
        p3Support,
        showColors,
        borderP3,
        borderRec2020,
        lch2xyz,
        sampleLch: y => {
          const h = sycledLerp(ranges.h.max, ranges.h.min, y / height)
          return [l, c, h]
        },
      })
    }
  )
}

async function bakeBitmap(pixels: Pixels) {
  const data = Uint8ClampedArray.from(pixels.array)
  const imageData = new ImageData(data, pixels.width, pixels.height)

  if ('createImageBitmap' in self) {
    return createImageBitmap(imageData)
  }
  return imageData
}

export const obj = { drawChromaChart, drawLuminosityChart, drawHueChart }
export type WorkerObj = typeof obj
export default Comlink.expose(obj)
