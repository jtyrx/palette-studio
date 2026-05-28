'use client'

import { useTheme } from 'next-themes'
import { MoonIcon } from '@/shared/icons/Moon'
import { SunIcon } from '@/shared/icons/Sun'
import { Button } from '../inputs'

export function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}>
      {resolvedTheme === 'light' ? <MoonIcon /> : <SunIcon />}
    </Button>
  )
}
