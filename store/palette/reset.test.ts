import { beforeEach, expect, test } from 'vitest'
import { spaceName } from '@/shared/types'
import { exportToHexPalette, normalizeHexPalette, parseHexPalette } from './converters'
import { resetPaletteToBaseline } from './actions'
import { setColor } from './paletteReducers'
import { runWithoutHydrate } from './hydrate'
import {
  isPaletteDirtyStore,
  paletteBaselineStore,
  paletteStore,
  setPaletteBaseline,
} from './stores'

const hexPalette = {
  name: 'Test palette',
  tones: ['100', '200'],
  hues: [
    { name: 'Blue', colors: ['#3366cc', '#224488'] },
    { name: 'Red', colors: ['#cc3333', '#882222'] },
  ],
}

beforeEach(() => {
  runWithoutHydrate(() => {
    const parsed = parseHexPalette(hexPalette, spaceName.oklch)
    paletteStore.set(parsed)
    setPaletteBaseline(hexPalette)
  })
})

test('reset restores edited swatch hex values', () => {
  expect(isPaletteDirtyStore.get()).toBe(false)

  const edited = setColor(paletteStore.get(), [0.5, 0.1, 180], 0, 0)
  paletteStore.set(edited)
  expect(isPaletteDirtyStore.get()).toBe(true)

  resetPaletteToBaseline()

  expect(isPaletteDirtyStore.get()).toBe(false)
  expect(normalizeHexPalette(exportToHexPalette(paletteStore.get()))).toEqual(
    normalizeHexPalette(hexPalette)
  )
})

test('reset is a no-op when baseline is missing', () => {
  paletteBaselineStore.set(null)
  const before = exportToHexPalette(paletteStore.get())
  resetPaletteToBaseline()
  expect(exportToHexPalette(paletteStore.get())).toEqual(before)
})
