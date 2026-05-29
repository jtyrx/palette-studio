import type { ThemeAttribute, ThemeConfig } from '@/lib/theme/types'

export function getAttributeNames(attribute: ThemeAttribute): string[] {
  return Array.isArray(attribute) ? attribute : [attribute]
}

export function getThemeAttributeValue(
  resolvedTheme: string,
  value: Record<string, string> | undefined,
): string {
  return value?.[resolvedTheme] ?? resolvedTheme
}

/** All class tokens that any theme mapping may apply (for removal before switching). */
export function collectManagedClassTokens(
  themes: readonly string[],
  value: Record<string, string> | undefined,
): string[] {
  const tokens = new Set<string>()

  if (value) {
    for (const theme of themes) {
      const mapped = value[theme]
      if (mapped) {
        for (const token of mapped.split(/\s+/)) {
          if (token) tokens.add(token)
        }
      }
    }
    return [...tokens]
  }

  for (const theme of themes) {
    if (theme !== 'system') {
      for (const token of theme.split(/\s+/)) {
        if (token) tokens.add(token)
      }
    }
  }

  return [...tokens]
}

export function classesForResolvedTheme(
  resolvedTheme: string,
  value: Record<string, string> | undefined,
): string[] {
  const raw = getThemeAttributeValue(resolvedTheme, value)
  return raw.split(/\s+/).filter(Boolean)
}

/** Pure: next classList after applying a theme (for tests). */
export function nextClassListForTheme(
  currentClasses: readonly string[],
  resolvedTheme: string,
  themes: readonly string[],
  value: Record<string, string> | undefined,
): string[] {
  const managed = new Set(collectManagedClassTokens(themes, value))
  const kept = currentClasses.filter((c) => !managed.has(c))
  const next = classesForResolvedTheme(resolvedTheme, value)
  return [...kept, ...next]
}

export function usesClassAttribute(attribute: ThemeAttribute): boolean {
  const names = getAttributeNames(attribute)
  return names.includes('class') || names.includes('className')
}

export function applyThemeToElement(
  element: HTMLElement,
  resolvedTheme: string,
  config: Pick<ThemeConfig, 'attribute' | 'value' | 'themes' | 'enableColorScheme'>,
): void {
  const { attribute, value, themes, enableColorScheme } = config
  const attrValue = getThemeAttributeValue(resolvedTheme, value)

  if (usesClassAttribute(attribute)) {
    const managed = collectManagedClassTokens(themes, value)
    for (const token of managed) {
      element.classList.remove(token)
    }
    for (const token of classesForResolvedTheme(resolvedTheme, value)) {
      element.classList.add(token)
    }
  }

  for (const name of getAttributeNames(attribute)) {
    if (name === 'class' || name === 'className') continue
    element.setAttribute(name, attrValue)
  }

  if (enableColorScheme) {
    element.style.colorScheme = resolvedTheme
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function runWithoutTransitions(
  disableTransitionOnChange: boolean | string,
  callback: () => void,
): void {
  if (!disableTransitionOnChange || prefersReducedMotion()) {
    callback()
    return
  }

  const css =
    typeof disableTransitionOnChange === 'string'
      ? `*{-webkit-transition:${disableTransitionOnChange}!important;-moz-transition:${disableTransitionOnChange}!important;transition:${disableTransitionOnChange}!important;}`
      : `*{-webkit-transition:none!important;-moz-transition:none!important;transition:none!important;}`

  const style = document.createElement('style')
  style.appendChild(document.createTextNode(css))
  document.head.appendChild(style)
  callback()

  // Force restyle before removing the guard.
  void document.documentElement.offsetHeight
  style.remove()
}
