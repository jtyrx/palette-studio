'use client'

import { useSyncExternalStore } from 'react'
import { Moon } from '@/shared/icons/Moon'
import { Sun } from '@/shared/icons/Sun'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'

const emptySubscribe = () => () => undefined

function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

export function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()

  const isLight = resolvedTheme === 'light'
  const label = isLight ? 'Switch to dark theme' : 'Switch to light theme'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={mounted ? label : undefined}
      aria-label={label}
      disabled={!mounted}
      onClick={() => {
        if (!mounted) return
        setTheme(isLight ? 'dark' : 'light')
      }}
    >
      {!mounted ? (
        <span className="size-16" aria-hidden />
      ) : isLight ? (
        <Moon />
      ) : (
        <Sun />
      )}
    </Button>
  )
}
