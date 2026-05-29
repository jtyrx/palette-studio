import { describe, expect, it } from 'vitest'
import {
  classesForResolvedTheme,
  collectManagedClassTokens,
  nextClassListForTheme,
} from '@/lib/theme/apply-theme'

describe('apply-theme class helpers', () => {
  it('collects all managed tokens from multi-class value map', () => {
    const tokens = collectManagedClassTokens(['light', 'dark', 'dim'], {
      light: 'light',
      dark: 'dark high-contrast',
      dim: 'dark dim',
    })

    expect(tokens.sort()).toEqual(['dark', 'dim', 'high-contrast', 'light'])
  })

  it('removes stale classes when switching themes', () => {
    const current = ['dark', 'high-contrast', 'layout-root']
    const next = nextClassListForTheme(current, 'light', ['light', 'dark', 'dim'], {
      light: 'light',
      dark: 'dark high-contrast',
      dim: 'dark dim',
    })

    expect(next).toEqual(['layout-root', 'light'])
  })

  it('uses resolved theme name when value map is absent', () => {
    expect(classesForResolvedTheme('dark', undefined)).toEqual(['dark'])
  })
})
