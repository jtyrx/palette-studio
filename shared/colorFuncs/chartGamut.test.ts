import { describe, expect, it } from 'vitest'
import { chartPixelFromLch, Space } from './chartGamut'
import { colorSpaces } from './index'
import { spaceName } from '../types'

describe('chartGamut', () => {
  const { lch2xyz } = colorSpaces[spaceName.oklch]

  it('classifies near-white OKLCH as sRGB space', () => {
    const pixel = chartPixelFromLch(
      [100, 0, 0],
      lch2xyz,
      false,
      false,
      false,
      true
    )
    expect(pixel[0]).toBe(Space.sRGB)
    expect(pixel[1]).toBeGreaterThan(250)
    expect(pixel[2]).toBeGreaterThan(250)
    expect(pixel[3]).toBeGreaterThan(250)
  })

  it('marks out-of-gamut OKLCH as Out when wide gamuts disabled', () => {
    const pixel = chartPixelFromLch(
      [0.6, 0.33, 30],
      lch2xyz,
      false,
      false,
      false,
      true
    )
    expect(pixel[0]).toBe(Space.Out)
  })

})
