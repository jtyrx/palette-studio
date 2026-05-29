import { SYSTEM_THEME } from '@/lib/theme/constants'
import type { SystemTheme } from '@/lib/theme/types'

export type ResolveThemeInput = {
  theme: string | undefined
  systemTheme: SystemTheme
  forcedTheme?: string
  themes: readonly string[]
  defaultTheme: string
  enableSystem: boolean
}

export type ResolveThemeResult = {
  theme: string
  resolvedTheme: string
}

function isKnownTheme(theme: string, themes: readonly string[]): boolean {
  return theme === SYSTEM_THEME || themes.includes(theme)
}

function resolveSystemPreference(
  systemTheme: SystemTheme,
  defaultTheme: string,
  enableSystem: boolean,
): string {
  if (enableSystem) {
    return systemTheme
  }
  if (defaultTheme === SYSTEM_THEME) {
    return systemTheme
  }
  return defaultTheme
}

export function resolveTheme(input: ResolveThemeInput): ResolveThemeResult {
  const { systemTheme, forcedTheme, themes, defaultTheme, enableSystem } = input

  let theme = forcedTheme ?? input.theme ?? defaultTheme

  if (!isKnownTheme(theme, themes)) {
    theme = defaultTheme
  }

  let resolvedTheme =
    theme === SYSTEM_THEME
      ? resolveSystemPreference(systemTheme, defaultTheme, enableSystem)
      : theme

  if (!themes.includes(resolvedTheme) && resolvedTheme !== 'light' && resolvedTheme !== 'dark') {
    resolvedTheme = resolveSystemPreference(systemTheme, defaultTheme, enableSystem)
  }

  return { theme, resolvedTheme }
}

export function readSystemTheme(
  prefersDark: boolean | (() => boolean) = false,
): SystemTheme {
  const isDark = typeof prefersDark === 'function' ? prefersDark() : prefersDark
  return isDark ? 'dark' : 'light'
}
