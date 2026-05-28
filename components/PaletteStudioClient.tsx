'use client'

import App from '@/components/App'

/** Client-only shell: palette state uses localStorage and must not SSR. */
export default function PaletteStudioClient() {
  return <App />
}
