import { describe, expect, it } from 'vitest'
import { colorSpaces } from './colorFuncs'
import { getSelectedColorDisplay } from './colorDisplay'
import { spaceName } from './types'

describe('getSelectedColorDisplay', () => {
  it('uses display-p3 for P3 swatch and hex for fallback', () => {
    const color = colorSpaces[spaceName.oklch].lch2color([65, 0.29, 350])
    const display = getSelectedColorDisplay(color)

    expect(display.p3Background).toMatch(/display-p3/)
    expect(display.fallbackBackground).not.toMatch(/display-p3/)
    expect(display.fallbackBackground).toMatch(/#|linear-gradient/)
    if (!display.fallbackBackground.startsWith('linear-gradient')) {
      expect(display.fallbackBackground).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
