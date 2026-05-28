'use client'

import dynamic from 'next/dynamic'

const PaletteStudioClient = dynamic(
  () => import('@/components/PaletteStudioClient'),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-screen flex-1 bg-(--color-surface-default)"
        aria-busy="true"
        aria-label="Loading Palette Studio"
      />
    ),
  }
)

export default function PaletteStudioLoader() {
  return <PaletteStudioClient />
}
