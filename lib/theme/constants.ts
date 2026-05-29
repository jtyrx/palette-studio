import type { ThemeConfig } from '@/lib/theme/types'

export const DEFAULT_THEMES = ['light', 'dark'] as const

export const DEFAULT_STORAGE_KEY = 'theme'

export const LEGACY_STORAGE_KEY = 'colorScheme'

export const SYSTEM_THEME = 'system'

export function createDefaultThemeConfig(
  overrides: Partial<ThemeConfig> = {},
): ThemeConfig {
  return {
    themes: [...DEFAULT_THEMES],
    defaultTheme: 'dark',
    enableSystem: false,
    followSystem: false,
    attribute: 'data-theme',
    target: 'html',
    storageKey: DEFAULT_STORAGE_KEY,
    storage: 'localStorage',
    enableColorScheme: true,
    disableTransitionOnChange: false,
    legacyStorageKey: LEGACY_STORAGE_KEY,
    ...overrides,
  }
}
