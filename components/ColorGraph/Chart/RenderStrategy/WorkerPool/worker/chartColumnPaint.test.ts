import { describe, expect, it } from 'vitest'
import { colorSpaces } from '@/shared/colorFuncs'
import { spaceName } from '@/shared/types'
import { Space } from '@/shared/colorFuncs/chartGamut'
import { sycledLerp } from '@/shared/interpolation'
import { Pixels } from './Pixels'
import { paintChartColumn } from './chartColumnPaint'

describe('paintChartColumn chroma scan', () => {
  it('paints in-gamut pixels when max chroma at y=0 is out of gamut', () => {
    const height = 120
    const { ranges, lch2xyz } = colorSpaces[spaceName.oklch]
    const l = 65
    const h = 54
    const pixels = new Pixels(1, height)

    paintChartColumn({
      pixels,
      columnX: 0,
      height,
      block: 6,
      hasGaps: false,
      showP3: false,
      showRec2020: false,
      p3Support: false,
      showColors: false,
      borderP3: { r: 0.5, g: 0.5, b: 0.5, alpha: 1 },
      borderRec2020: { r: 0.4, g: 0.4, b: 0.4, alpha: 1 },
      lch2xyz,
      sampleLch: y => {
        const c = sycledLerp(ranges.c.max, ranges.c.min, y / height)
        return [l, c, h]
      },
      shouldStopColumn: (pixel, _y, hadColors) =>
        hadColors && pixel[0] === Space.Out,
    })

    let painted = 0
    for (let i = 0; i < pixels.array.length; i += 4) {
      if (pixels.array[i + 3]! > 0) painted++
    }
    expect(painted).toBeGreaterThan(40)
  })
})
