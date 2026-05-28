'use client'

import { useStore } from '@nanostores/react'
import { Button } from '@/components/ui/button'
import { isPaletteDirtyStore, resetPaletteToBaseline } from '@/store/palette'

export function PaletteResetButton() {
  const dirty = useStore(isPaletteDirtyStore)

  return (
    <Button
      type="button"
      data-slot="palette-reset"
      disabled={!dirty}
      onClick={() => resetPaletteToBaseline()}
      title={
        dirty
          ? 'Restore all swatch colors to when this palette was selected'
          : 'No changes to reset'
      }
      className="w-full border border-(--color-border-subtle) bg-transparent px-2 py-1.5 text-xs font-normal text-(--color-text-hint) hover:bg-(--color-interactive-bg) hover:text-(--color-text-secondary) disabled:pointer-events-none disabled:opacity-40"
    >
      Reset palette
    </Button>
  )
}
