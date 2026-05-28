import { computed, map } from 'nanostores'
import { selectedStore } from './currentPosition'

export type TOverlayMode = 'APCA' | 'WCAG' | 'NONE' | 'DELTA_E'
type TVersus = 'selected' | string

export const overlayStore = map<{ mode: TOverlayMode; versus: TVersus }>({
  mode: 'APCA',
  versus: 'white',
})

export const versusColorStore = computed(
  [overlayStore, selectedStore],
  (overlay, selected) => {
    if (overlay.versus === 'selected') {
      return selected.color.hex
    }
    return overlay.versus
  }
)

export function setOverlayMode(mode: TOverlayMode) {
  overlayStore.setKey('mode', mode)
}

export function setVersusColor(color: TVersus) {
  overlayStore.setKey('versus', color)
}
