import { Palette } from '@/shared/types'
import { computed, map, onMount } from 'nanostores'
import { colorSpaces } from '@/shared/colorFuncs'
import { persistentAtom } from '@nanostores/persistent'
import { PRESETS } from '@/shared/presets'
import { HexPalette } from '@/shared/types'
import { PALETTE_KEY } from '@/shared/constants'
import { atom } from 'nanostores'
import { isEqual } from 'lodash'
import { exportToHexPalette, normalizeHexPalette } from './converters'
import { hydratePaletteFromList } from './hydrate'
import {
  decodeUserPalettes,
  getUrlPalette,
  scheduleCleanURL,
  initialPalette,
} from './utils'

function cloneHexPalette(palette: HexPalette): HexPalette {
  return normalizeHexPalette(
    JSON.parse(JSON.stringify(palette)) as HexPalette
  )
}
const presets = PRESETS.map(p => ({ ...p, isPreset: true }))

// —————————————————————————————————————————————————————————————————————————————
// PALETTE INDEX

/** Index of selected palette */
export const paletteIdStore = atom<number>(0)

// —————————————————————————————————————————————————————————————————————————————
// PALETTE LIST

/** Array of user palettes saved in localStorage */
export const savedPalettesStore = persistentAtom<HexPalette[]>(
  PALETTE_KEY,
  [],
  { encode: JSON.stringify, decode: decodeUserPalettes }
)

/** Array of all palettes: user palettes + presets */
export const paletteListStore = computed(savedPalettesStore, palettes => {
  return palettes.concat(presets)
})

/** On mount add palette from the URL in the beginning of the list. */
onMount(paletteListStore, () => {
  if (typeof window === 'undefined') return
  const urlPalette = getUrlPalette()
  scheduleCleanURL()
  if (!urlPalette) return
  const savedPalettes = savedPalettesStore.get()
  const urlIdx = savedPalettes.findIndex(p => isEqual(p, urlPalette))
  if (urlIdx > -1) {
    paletteIdStore.set(urlIdx)
  } else {
    savedPalettesStore.set([urlPalette, ...savedPalettesStore.get()])
  }
  hydratePaletteFromList()
})

// —————————————————————————————————————————————————————————————————————————————
// CURRENT PALETTE

export const paletteStore = map<Palette>(initialPalette)

/** Hex snapshot when the current palette was loaded; used by reset. */
export const paletteBaselineStore = atom<HexPalette | null>(null)

export const isPaletteDirtyStore = computed(
  [paletteStore, paletteBaselineStore],
  (palette, baseline) => {
    if (!baseline) return false
    return !isEqual(
      normalizeHexPalette(exportToHexPalette(palette)),
      normalizeHexPalette(baseline)
    )
  }
)

export function setPaletteBaseline(hex: HexPalette) {
  paletteBaselineStore.set(cloneHexPalette(hex))
}

onMount(paletteStore, () => {
  queueMicrotask(() => hydratePaletteFromList())
})

export const colorSpaceStore = computed(
  paletteStore,
  palette => colorSpaces[palette.mode]
)
