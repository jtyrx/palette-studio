'use client'

import { PaletteSwatches } from '@/components/PaletteSwatches'
import { PaletteResetButton } from '@/components/PaletteResetButton'
import { ColorInfo } from '@/components/ColorInfo'
import { ExportField } from '@/components/ExportField'

export function PalettePanel() {
  return (
    <section
      id="palette-panel"
      data-slot="palette-panel"
      className="flex w-min min-w-(--layout-panel-min) shrink-0 flex-col gap-4 overflow-auto border-r border-hairline p-4 max-[860px]:w-full max-[860px]:min-w-0 max-[860px]:border-r-0 max-[860px]:border-b"
    >
      <div className="flex flex-col gap-2" data-slot="palette-swatches-scroll">
        <div className="overflow-x-auto">
          <PaletteSwatches />
        </div>
        <PaletteResetButton />
      </div>
      <ColorInfo />
      <ExportField />
    </section>
  )
}
