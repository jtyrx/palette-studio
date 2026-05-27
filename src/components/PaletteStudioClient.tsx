'use client'

import App from '@/components/App'
import { ColorSchemeProvider } from '@/shared/hooks/useColorScheme'

/** Client-only shell: palette state uses localStorage and must not SSR. */
export default function PaletteStudioClient() {
  return (
    <ColorSchemeProvider>
      <App />
    </ColorSchemeProvider>
  )
}
