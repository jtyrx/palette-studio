import { describe, expect, it } from 'vitest'
import { resolveTheme } from '@/lib/theme/resolve-theme'

const base = {
  themes: ['light', 'dark'] as const,
  defaultTheme: 'dark',
  enableSystem: false,
  systemTheme: 'light' as const,
}

describe('resolveTheme', () => {
  it('resolves stored light to light', () => {
    expect(resolveTheme({ ...base, theme: 'light' })).toEqual({
      theme: 'light',
      resolvedTheme: 'light',
    })
  })

  it('resolves system preference when theme is system and enableSystem is true', () => {
    expect(
      resolveTheme({
        ...base,
        theme: 'system',
        enableSystem: true,
        systemTheme: 'dark',
      }),
    ).toEqual({ theme: 'system', resolvedTheme: 'dark' })
  })

  it('uses defaultTheme when enableSystem is false and theme is system', () => {
    expect(resolveTheme({ ...base, theme: 'system' })).toEqual({
      theme: 'system',
      resolvedTheme: 'dark',
    })
  })

  it('forcedTheme overrides stored value', () => {
    expect(
      resolveTheme({
        ...base,
        theme: 'light',
        forcedTheme: 'dark',
      }),
    ).toEqual({ theme: 'dark', resolvedTheme: 'dark' })
  })

  it('falls back to defaultTheme for unknown stored values', () => {
    expect(resolveTheme({ ...base, theme: 'sepia' })).toEqual({
      theme: 'dark',
      resolvedTheme: 'dark',
    })
  })
})
