'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react'
import { InlineScript } from '@/components/inline-script'
import { DEFAULT_THEMES } from '@/lib/theme/constants'
import { buildThemeInitScript, themeProviderPropsToScriptConfig } from '@/lib/theme/script'
import {
  configureThemeStore,
  getThemeConfig,
  getThemeServerSnapshot,
  getThemeSnapshot,
  initThemeStore,
  setTheme as setThemeOnStore,
  subscribeThemeStore,
} from '@/lib/theme/store'
import type { ThemeProviderProps, UseThemeReturn } from '@/lib/theme/types'

type ThemeContextValue = UseThemeReturn<string>

const ThemeContext = createContext<ThemeContextValue | null>(null)

function ThemeProviderInner(props: ThemeProviderProps) {
  const { children, onThemeChange, nonce, ...scriptProps } = props
  const {
    themes: themesProp,
    defaultTheme,
    forcedTheme,
    enableSystem,
    followSystem,
    attribute,
    value: themeValueMap,
    target,
    storageKey,
    storage,
    enableColorScheme,
    disableTransitionOnChange,
  } = scriptProps

  const scriptHtml = useMemo(
    () => buildThemeInitScript(themeProviderPropsToScriptConfig(scriptProps)),
    [
      themesProp,
      defaultTheme,
      forcedTheme,
      enableSystem,
      followSystem,
      attribute,
      themeValueMap,
      target,
      storageKey,
      storage,
      enableColorScheme,
      disableTransitionOnChange,
    ],
  )

  const themes = useMemo(
    () => themesProp ?? [...DEFAULT_THEMES],
    [themesProp],
  )

  useEffect(() => {
    configureThemeStore(scriptProps)
    return initThemeStore(onThemeChange)
  }, [
    themesProp,
    defaultTheme,
    forcedTheme,
    enableSystem,
    followSystem,
    attribute,
    themeValueMap,
    target,
    storageKey,
    storage,
    enableColorScheme,
    disableTransitionOnChange,
    onThemeChange,
  ])

  const serverSnapshot = useMemo(
    () => getThemeServerSnapshot(scriptProps),
    [
      themesProp,
      defaultTheme,
      forcedTheme,
      enableSystem,
      followSystem,
      attribute,
      themeValueMap,
      target,
      storageKey,
      storage,
      enableColorScheme,
      disableTransitionOnChange,
    ],
  )

  const snapshot = useSyncExternalStore(
    subscribeThemeStore,
    getThemeSnapshot,
    () => serverSnapshot,
  )

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme: snapshot.theme,
      resolvedTheme: snapshot.resolvedTheme,
      systemTheme: snapshot.systemTheme,
      themes,
      setTheme: (theme) => setThemeOnStore(theme, onThemeChange),
    }),
    [snapshot, themes, onThemeChange],
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      <InlineScript html={scriptHtml} nonce={nonce} />
      {children}
    </ThemeContext.Provider>
  )
}

export function ThemeProvider(props: ThemeProviderProps) {
  return <ThemeProviderInner {...props} />
}

ThemeProvider.displayName = 'ThemeProvider'

export function useTheme<T extends string = string>(): UseThemeReturn<T> {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context as UseThemeReturn<T>
}

/** Read active theme config after provider mount (testing / debugging). */
export function useThemeConfig() {
  return getThemeConfig()
}
