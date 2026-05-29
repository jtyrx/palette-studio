import type { ReactNode } from 'react'

export type ThemeStorage = 'localStorage' | 'sessionStorage' | 'cookie' | 'hybrid' | 'none'

export type ThemeAttribute = string | string[]

export type SystemTheme = 'light' | 'dark'

export type ThemeConfig = {
  themes: string[]
  defaultTheme: string
  forcedTheme?: string
  enableSystem: boolean
  followSystem: boolean
  attribute: ThemeAttribute
  value?: Record<string, string>
  target: string
  storageKey: string
  storage: ThemeStorage
  enableColorScheme: boolean
  disableTransitionOnChange: boolean | string
  legacyStorageKey?: string
}

export type ThemeScriptProps = {
  themes?: string[]
  defaultTheme?: string
  forcedTheme?: string
  enableSystem?: boolean
  followSystem?: boolean
  attribute?: ThemeAttribute
  value?: Record<string, string>
  target?: string
  storageKey?: string
  storage?: ThemeStorage
  enableColorScheme?: boolean
  disableTransitionOnChange?: boolean | string
  nonce?: string
}

export type ThemeProviderProps = ThemeScriptProps & {
  children: ReactNode
  onThemeChange?: (theme: string) => void
}

export type ThemeSnapshot = {
  theme: string | undefined
  resolvedTheme: string | undefined
  systemTheme: SystemTheme | undefined
}

export type UseThemeReturn<T extends string = string> = {
  theme: (T | 'system') | undefined
  resolvedTheme: T | undefined
  systemTheme: SystemTheme | undefined
  themes: string[]
  setTheme: (theme: T | 'system') => void
}
