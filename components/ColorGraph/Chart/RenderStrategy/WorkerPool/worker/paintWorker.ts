import * as Comlink from 'comlink'
import { spaceName, TColor } from '@/shared/types'
import { colorSpaces } from '@/shared/colorFuncs'
import { paddedScale, sycledLerp } from '@/shared/interpolation'
import { Pixels, TPixelData } from './Pixels'

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
}

const getSrgbPixel = (): TPixelData => [255, 255, 255, 255]
const getP3pixel = (x: number, y: number): TPixelData => [198, 198, 198, 255]
const getRec2020pixel = (x: number, y: number): TPixelData => [171, 171, 171, 255]
// 1px stroke at the sRGB→P3 gamut boundary
const P3_CONTOUR: TPixelData = [130, 130, 130, 255]

function drawLuminosityChart(props: DrawChartProps) {
  const {
    width,
    height,
    colors,
    mode,
    showColors,
    showP3,
    showRec2020,
    widthFrom = 0,
    widthTo = width,
  } = props
  const { ranges, lch2color } = colorSpaces[mode]
  let pixels = new Pixels(widthTo - widthFrom, height)
  let chromaScale = paddedScale(
    width,
    colors.map(color => color.c)
  )
  let hueScale = paddedScale(
    width,
    colors.map(color => color.h),
    ranges.h.max
  )

  for (let x = widthFrom; x < widthTo; x++) {
    let c = chromaScale(x)
    let h = hueScale(x)
    let hadColors = false
    let wasInSRGB = false

    for (let y = height; y >= 0; y--) {
      let l = sycledLerp(ranges.l.max, ranges.l.min, y / height)
      const { r, g, b, within_sRGB, within_P3, within_Rec2020 } = lch2color([l, c, h])

      const dx = x - widthFrom
      if (within_sRGB) {
        hadColors = true
        wasInSRGB = true
        pixels.setPixel(dx, y, showColors ? [r, g, b, 255] : getSrgbPixel())
      } else if (wasInSRGB && within_P3) {
        pixels.setPixel(dx, y, P3_CONTOUR)
        wasInSRGB = false
      } else if (showP3 && within_P3) {
        pixels.setPixel(dx, y, getP3pixel(dx, y))
      } else if (showRec2020 && within_Rec2020) {
        pixels.setPixel(dx, y, getRec2020pixel(dx, y))
      } else {
        wasInSRGB = false
      }

      // Luminosity chart only has colors in the middle; once undisplayable after hadColors, no more will appear.
      const displayable = showRec2020 ? within_Rec2020 : showP3 ? within_P3 : within_sRGB
      if (!displayable && hadColors) break
    }
  }

  return bakeBitmap(pixels)
}

function drawChromaChart(props: DrawChartProps) {
  const {
    width,
    height,
    colors,
    mode,
    showColors,
    showP3,
    showRec2020,
    widthFrom = 0,
    widthTo = width,
  } = props
  const { ranges, lch2color } = colorSpaces[mode]
  let pixels = new Pixels(widthTo - widthFrom, height)
  let luminostyScale = paddedScale(
    width,
    colors.map(color => color.l)
  )
  let hueScale = paddedScale(
    width,
    colors.map(color => color.h),
    ranges.h.max
  )

  for (let x = widthFrom; x < widthTo; x++) {
    let l = luminostyScale(x)
    let h = hueScale(x)

    // TODO: it will be a good optimisation to remember previous L H values and return the same column if they haven't changed

    // TODO: another good optimisation is to remember previous last displayable color and start from it. Or even combine it with binary search.

    let wasInSRGB = false

    for (let y = height; y >= 0; y--) {
      let c = sycledLerp(ranges.c.max, ranges.c.min, y / height)
      const { r, g, b, within_sRGB, within_P3, within_Rec2020 } = lch2color([l, c, h])

      const dx = x - widthFrom
      if (within_sRGB) {
        wasInSRGB = true
        pixels.setPixel(dx, y, showColors ? [r, g, b, 255] : getSrgbPixel())
      } else if (wasInSRGB && within_P3) {
        pixels.setPixel(dx, y, P3_CONTOUR)
        wasInSRGB = false
      } else if (showP3 && within_P3) {
        pixels.setPixel(dx, y, getP3pixel(dx, y))
      } else if (showRec2020 && within_Rec2020) {
        pixels.setPixel(dx, y, getRec2020pixel(dx, y))
      } else {
        wasInSRGB = false
      }

      // If color with this chroma is undisplayable, all colors with higher chroma also will be undisplayable.
      const displayable = showRec2020 ? within_Rec2020 : showP3 ? within_P3 : within_sRGB
      if (!displayable) break
    }
  }

  return bakeBitmap(pixels)
}

function drawHueChart(props: DrawChartProps) {
  const {
    width,
    height,
    colors,
    mode,
    showColors,
    showP3,
    showRec2020,
    widthFrom = 0,
    widthTo = width,
  } = props
  const { ranges, lch2color } = colorSpaces[mode]
  let pixels = new Pixels(widthTo - widthFrom, height)
  let luminostyScale = paddedScale(
    width,
    colors.map(color => color.l)
  )
  let chromaScale = paddedScale(
    width,
    colors.map(color => color.c)
  )

  for (let x = widthFrom; x < widthTo; x++) {
    let l = luminostyScale(x)
    let c = chromaScale(x)

    let wasInSRGB = false

    for (let y = height; y >= 0; y--) {
      let h = sycledLerp(ranges.h.max, ranges.h.min, y / height)
      const { r, g, b, within_sRGB, within_P3, within_Rec2020 } = lch2color([l, c, h])

      const dx = x - widthFrom
      if (within_sRGB) {
        wasInSRGB = true
        pixels.setPixel(dx, y, showColors ? [r, g, b, 255] : getSrgbPixel())
      } else if (wasInSRGB && within_P3) {
        pixels.setPixel(dx, y, P3_CONTOUR)
        wasInSRGB = false
      } else if (showP3 && within_P3) {
        pixels.setPixel(dx, y, getP3pixel(dx, y))
      } else if (showRec2020 && within_Rec2020) {
        pixels.setPixel(dx, y, getRec2020pixel(dx, y))
      } else {
        wasInSRGB = false
      }
    }
  }

  return bakeBitmap(pixels)
}

async function bakeBitmap(pixels: Pixels) {
  /* Copy so ImageData receives a clamped buffer typed as plain ArrayBuffer (TS DOM lib mismatch). */
  const data = Uint8ClampedArray.from(pixels.array)
  const imageData = new ImageData(data, pixels.width, pixels.height)

  // Safari has very sketchy ImageBitmap implementation
  // eslint-disable-next-line no-restricted-globals
  if ('createImageBitmap' in self) {
    // if super-sampling becomes a viable option, scaling also can be performed with bitmap options here
    return createImageBitmap(imageData)
  } else {
    return imageData
  }
}

export const obj = { drawChromaChart, drawLuminosityChart, drawHueChart }
export type WorkerObj = typeof obj
export default Comlink.expose(obj)
