'use client'

import { useStore } from '@nanostores/react'
import { Button } from '@/components/ui/button'
import { isPaletteDirtyStore, resetPaletteToBaseline } from '@/store/palette'

export function PaletteResetButton() {
  const dirty = useStore(isPaletteDirtyStore)

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      data-slot="palette-reset"
      disabled={!dirty}
      onClick={() => resetPaletteToBaseline()}
      title={
        dirty
          ? 'Restore all swatch colors to when this palette was selected'
          : 'No changes to reset'
      }
      className="w-full font-normal"
    >
      Reset palette
    </Button>
  )
}
