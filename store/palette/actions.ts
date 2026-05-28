import { HexPalette, LCH, Palette, spaceName } from '@/shared/types'
import { convertToMode } from './paletteReducers'
import {
  paletteBaselineStore,
  paletteStore,
  paletteIdStore,
  paletteListStore,
  setPaletteBaseline,
} from './stores'
import {
  clampColorsToRgb,
  setHueHue,
  setToneLuminance,
} from './paletteReducers'
import { exportToHexPalette, normalizeHexPalette, parseHexPalette } from './converters'
import { hydratePaletteFromList, runWithoutHydrate } from './hydrate'
import { selectedStore } from '../currentPosition'
import { colorSpaceStore, savedPalettesStore } from '.'

export const switchPalette = (id: number) => {
  if (id === paletteIdStore.get()) return
  const paletteList = paletteListStore.get()
  if (!paletteList[id]) return
  paletteIdStore.set(id)
  hydratePaletteFromList()
}

/** Restore all swatch/token values to the snapshot for the active palette. */
export function resetPaletteToBaseline() {
  const baseline = paletteBaselineStore.get()
  if (!baseline) return

  const { mode } = paletteStore.get()
  const restored = parseHexPalette(normalizeHexPalette(baseline), mode)
  const currentId = paletteIdStore.get()
  const savedCount = savedPalettesStore.get().length

  runWithoutHydrate(() => {
    paletteStore.set(restored)
    if (currentId < savedCount) {
      updateSavedPalette(exportToHexPalette(restored), currentId)
    }
  })
}

export function switchColorSpace(space: spaceName) {
  const palette = paletteStore.get()
  if (palette.mode === space) return
  paletteStore.set(convertToMode(palette, space))
}

function removeSavedPalette(idx: number) {
  const paletteList = savedPalettesStore.get()
  savedPalettesStore.set(paletteList.filter((_, i) => i !== idx))
}

export function updateSavedPalette(palette: HexPalette, idx: number) {
  const paletteList = savedPalettesStore.get()
  savedPalettesStore.set(paletteList.map((p, i) => (i === idx ? palette : p)))
}

export const deletePalette = (idx: number) => {
  removeSavedPalette(idx)
  const currentId = paletteIdStore.get()
  if (currentId > idx) paletteIdStore.set(currentId - 1)
  if (currentId === idx) switchPalette(currentId)
}

export const duplicatePalette = (idx: number) => {
  const savedPalettes = savedPalettesStore.get()
  if (savedPalettes[idx]) {
    savedPalettesStore.set(
      savedPalettes.flatMap((palette, i) =>
        i === idx
          ? [palette, { ...palette, name: palette.name + ' copy' }]
          : palette
      )
    )
    switchPalette(idx + 1)
  }
}

export function toggleColorSpace() {
  const palette = paletteStore.get()
  switchColorSpace(
    palette.mode === spaceName.cielch ? spaceName.oklch : spaceName.cielch
  )
}

/** Main action for editing the palette. */
export function setPalette(newPalette: Palette) {
  const savedPalettes = savedPalettesStore.get()
  const currentId = paletteIdStore.get()
  if (currentId > savedPalettes.length - 1) {
    const name = newPalette.name + ' copy'
    const changedPalette = { ...newPalette, name }
    savedPalettesStore.set([
      exportToHexPalette(changedPalette),
      ...savedPalettes,
    ])
    paletteIdStore.set(0)
    paletteStore.set(changedPalette)
  } else {
    paletteStore.set(newPalette)
    setTimeout(() => {
      updateSavedPalette(exportToHexPalette(newPalette), currentId)
    }, 10)
  }
}

export function pushColorsIntoRgb() {
  setPalette(clampColorsToRgb(paletteStore.get()))
}

export function currentLuminanceToColumn() {
  const selected = selectedStore.get()
  setPalette(
    setToneLuminance(paletteStore.get(), selected.color.l, selected.toneId)
  )
}

export function currentHueToRow() {
  const selected = selectedStore.get()
  setPalette(setHueHue(paletteStore.get(), selected.color.h, selected.hueId))
}

export function renamePalette(name: string) {
  setPalette({ ...paletteStore.get(), name })
}

export function setLchColor(lch: LCH, hueId: number, toneId: number) {
  const palette = paletteStore.get()
  const { lch2color } = colorSpaceStore.get()
  const color = lch2color(lch)
  setPalette({
    ...palette,
    colors: palette.colors.map((tones, hue) =>
      hue === hueId
        ? tones.map((toneColor, tone) =>
            toneId === tone ? color : toneColor
          )
        : tones
    ),
  })
}
