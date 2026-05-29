import {
  applyThemeToElement,
  runWithoutTransitions,
} from '@/lib/theme/apply-theme'
import {
  createDefaultThemeConfig,
  LEGACY_STORAGE_KEY,
} from '@/lib/theme/constants'
import { resolveTheme, readSystemTheme } from '@/lib/theme/resolve-theme'
import type {
  SystemTheme,
  ThemeConfig,
  ThemeScriptProps,
  ThemeSnapshot,
} from '@/lib/theme/types'
import { themeProviderPropsToScriptConfig } from '@/lib/theme/script'

type Listener = () => void

let config: ThemeConfig = createDefaultThemeConfig()
let snapshot: ThemeSnapshot = {
  theme: undefined,
  resolvedTheme: undefined,
  systemTheme: undefined,
}

const listeners = new Set<Listener>()

let mediaQuery: MediaQueryList | null = null
let mediaListener: (() => void) | null = null
let storageListener: ((event: StorageEvent) => void) | null = null
let initialized = false

function emit(): void {
  for (const listener of listeners) {
    listener()
  }
}

function getTargetElement(): HTMLElement | null {
  if (typeof document === 'undefined') return null
  if (config.target === 'html' || config.target === 'documentElement') {
    return document.documentElement
  }
  if (config.target === 'body') {
    return document.body
  }
  return document.querySelector<HTMLElement>(config.target)
}

function readStorage(): string | null {
  if (typeof window === 'undefined') return null
  if (config.storage === 'none') return null

  try {
    if (config.storage === 'localStorage' || config.storage === 'hybrid') {
      return window.localStorage.getItem(config.storageKey)
    }
    if (config.storage === 'sessionStorage') {
      return window.sessionStorage.getItem(config.storageKey)
    }
    if (config.storage === 'cookie') {
      const match = document.cookie.match(
        new RegExp(`(?:^|; )${config.storageKey}=([^;]*)`),
      )
      return match ? decodeURIComponent(match[1]) : null
    }
  } catch {
    return null
  }

  return null
}

function writeStorage(theme: string): void {
  if (typeof window === 'undefined' || config.storage === 'none') return

  try {
    if (config.storage === 'localStorage' || config.storage === 'hybrid') {
      window.localStorage.setItem(config.storageKey, theme)
    } else if (config.storage === 'sessionStorage') {
      window.sessionStorage.setItem(config.storageKey, theme)
    } else if (config.storage === 'cookie') {
      document.cookie = `${config.storageKey}=${encodeURIComponent(theme)};path=/;max-age=31536000;samesite=lax`
    }
  } catch {
    // Private mode / blocked storage
  }
}

function migrateLegacyStorage(): void {
  if (typeof window === 'undefined') return
  if (config.storage !== 'localStorage' && config.storage !== 'hybrid') return

  try {
    const current = window.localStorage.getItem(config.storageKey)
    if (current) return

    const legacyKey = config.legacyStorageKey ?? LEGACY_STORAGE_KEY
    const legacy = window.localStorage.getItem(legacyKey)
    if (legacy === 'light' || legacy === 'dark') {
      window.localStorage.setItem(config.storageKey, legacy)
      window.localStorage.removeItem(legacyKey)
    }
  } catch {
    // ignore
  }
}

function getSystemTheme(): SystemTheme {
  if (typeof window === 'undefined') return 'dark'
  return readSystemTheme(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
}

function computeSnapshot(storedTheme: string | null): ThemeSnapshot {
  const systemTheme = getSystemTheme()
  const themeInput = config.forcedTheme ?? storedTheme ?? config.defaultTheme
  const { theme, resolvedTheme } = resolveTheme({
    theme: themeInput,
    systemTheme,
    forcedTheme: config.forcedTheme,
    themes: config.themes,
    defaultTheme: config.defaultTheme,
    enableSystem: config.enableSystem || config.followSystem,
  })

  return { theme, resolvedTheme, systemTheme }
}

function applyToDom(resolvedTheme: string): void {
  const element = getTargetElement()
  if (!element) return

  const run = () => {
    applyThemeToElement(element, resolvedTheme, config)
  }

  runWithoutTransitions(config.disableTransitionOnChange, run)
}

function syncFromStorage(storedTheme: string | null): void {
  snapshot = computeSnapshot(storedTheme)
  if (snapshot.resolvedTheme) {
    applyToDom(snapshot.resolvedTheme)
  }
  emit()
}

export function configureThemeStore(props: ThemeScriptProps): ThemeConfig {
  const scriptConfig = themeProviderPropsToScriptConfig(props)
  config = createDefaultThemeConfig({
    ...scriptConfig,
    disableTransitionOnChange:
      props.disableTransitionOnChange ?? false,
  })
  return config
}

export function getThemeSnapshot(): ThemeSnapshot {
  return snapshot
}

export function getThemeServerSnapshot(props: ThemeScriptProps): ThemeSnapshot {
  const nextConfig = configureThemeStore(props)
  const { resolvedTheme, theme } = resolveTheme({
    theme: nextConfig.forcedTheme ?? nextConfig.defaultTheme,
    systemTheme: 'dark',
    forcedTheme: nextConfig.forcedTheme,
    themes: nextConfig.themes,
    defaultTheme: nextConfig.defaultTheme,
    enableSystem: nextConfig.enableSystem || nextConfig.followSystem,
  })
  return { theme, resolvedTheme, systemTheme: 'dark' }
}

export function subscribeThemeStore(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function initThemeStore(onThemeChange?: (theme: string) => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  migrateLegacyStorage()

  const stored = readStorage()
  snapshot = computeSnapshot(stored)
  if (snapshot.resolvedTheme) {
    applyToDom(snapshot.resolvedTheme)
  }
  emit()

  if (!initialized) {
    initialized = true

    storageListener = (event: StorageEvent) => {
      if (event.key !== config.storageKey && event.key !== null) return
      syncFromStorage(readStorage())
      if (snapshot.theme) onThemeChange?.(snapshot.theme)
    }
    window.addEventListener('storage', storageListener)

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaListener = () => {
      const currentStored = readStorage()
      if (snapshot.theme !== 'system' && !config.followSystem) return
      syncFromStorage(currentStored)
      if (snapshot.theme) onThemeChange?.(snapshot.theme)
    }
    mediaQuery.addEventListener('change', mediaListener)
  }

  return () => {
    if (storageListener) {
      window.removeEventListener('storage', storageListener)
      storageListener = null
    }
    if (mediaQuery && mediaListener) {
      mediaQuery.removeEventListener('change', mediaListener)
      mediaListener = null
    }
    initialized = false
  }
}

export function setTheme(
  theme: string,
  onThemeChange?: (theme: string) => void,
): void {
  if (config.forcedTheme) return

  if (!config.themes.includes(theme) && theme !== 'system') {
    return
  }

  writeStorage(theme)
  syncFromStorage(theme)
  onThemeChange?.(theme)
}

export function getThemeConfig(): ThemeConfig {
  return config
}

/** @internal test helper */
export function resetThemeStoreForTests(): void {
  config = createDefaultThemeConfig()
  snapshot = {
    theme: undefined,
    resolvedTheme: undefined,
    systemTheme: undefined,
  }
  listeners.clear()
  initialized = false
  mediaQuery = null
  mediaListener = null
  storageListener = null
}
