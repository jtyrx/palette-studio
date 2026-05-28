'use client'

import { useTheme } from 'next-themes'
import { Moon } from '@/shared/icons/Moon'
import { Sun } from '@/shared/icons/Sun'
import { Button } from '@/components/ui/button'

export function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}>
      {resolvedTheme === 'light' ? <Moon /> : <Sun />}
    </Button>
  )
}
