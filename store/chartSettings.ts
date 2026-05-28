import { persistentMap } from '@nanostores/persistent'

export type TSettings = {
  showColors: boolean
  showP3: boolean
  showRec2020: boolean
}

export const chartSettingsStore = persistentMap<TSettings>(
  'settings:',
  {
    showColors: false,
    showP3: false,
    showRec2020: false,
  },
  { encode: JSON.stringify, decode: JSON.parse }
)

export function toggleShowColors() {
  chartSettingsStore.setKey('showColors', !chartSettingsStore.get().showColors)
}

export function toggleShowP3() {
  chartSettingsStore.setKey('showP3', !chartSettingsStore.get().showP3)
}

export function toggleShowRec2020() {
  chartSettingsStore.setKey(
    'showRec2020',
    !chartSettingsStore.get().showRec2020
  )
}
