import { spaceName } from '@/shared/types'
import { parseHexPalette } from './converters'
import {
  paletteIdStore,
  paletteListStore,
  paletteStore,
  setPaletteBaseline,
} from './stores'

let suppressHydrate = false

export function runWithoutHydrate(run: () => void) {
  suppressHydrate = true
  try {
    run()
  } finally {
    suppressHydrate = false
  }
}

/** Load the active list entry into paletteStore and refresh the reset baseline. */
export function hydratePaletteFromList() {
  if (suppressHydrate) return

  const list = paletteListStore.get()
  const idx = paletteIdStore.get()
  const entry = list[idx]
  if (!entry) return

  const mode = paletteStore.get().mode ?? spaceName.oklch
  setPaletteBaseline(entry)
  paletteStore.set(parseHexPalette(entry, mode))
}
