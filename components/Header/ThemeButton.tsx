'use client'

import { useTheme } from 'next-themes'
import { Moon } from '@/shared/icons/Moon'
import { Sun } from '@/shared/icons/Sun'
import { Button } from '@/components/ui/button'

export function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      title={resolvedTheme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
    >
      {resolvedTheme === 'light' ? <Moon /> : <Sun />}
    </Button>
  )
}
