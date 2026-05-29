import { describe, expect, it } from 'vitest'
import { buildThemeInitScript } from '@/lib/theme/script'

describe('buildThemeInitScript', () => {
  it('includes storage key and attribute config', () => {
    const script = buildThemeInitScript({
      themes: ['light', 'dark'],
      defaultTheme: 'dark',
      enableSystem: true,
      followSystem: false,
      attribute: 'data-theme',
      target: 'html',
      storageKey: 'theme',
      storage: 'localStorage',
      enableColorScheme: true,
      legacyStorageKey: 'colorScheme',
    })

    expect(script).toMatch(/localStorage/)
    expect(script).toMatch(/"storageKey":"theme"/)
    expect(script).toMatch(/"attribute":"data-theme"/)
    expect(script).toMatch(/prefers-color-scheme/)
    expect(script).toMatch(/colorScheme/)
  })

  it('is a self-contained IIFE', () => {
    const script = buildThemeInitScript({
      themes: ['light', 'dark'],
      defaultTheme: 'dark',
      enableSystem: false,
      followSystem: false,
      attribute: 'data-theme',
      target: 'html',
      storageKey: 'theme',
      storage: 'localStorage',
      enableColorScheme: false,
    })

    expect(script.startsWith('(function(){')).toBe(true)
    expect(script.endsWith('})();')).toBe(true)
  })
})
