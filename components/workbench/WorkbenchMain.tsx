'use client'

import type { ReactNode } from 'react'
import { PalettePanel } from '@/components/workbench/PalettePanel'

export function WorkbenchMain({ children }: { children: ReactNode }) {
  return (
    <main
      className="flex min-h-0 flex-1 max-[860px]:flex-col"
      data-slot="workbench-main"
    >
      <PalettePanel />
      <section
        id="charts-panel"
        data-slot="charts-panel"
        className="flex min-w-0 flex-1 flex-col gap-16 overflow-auto bg-(--color-surface-card) px-24 py-16"
      >
        {children}
      </section>
    </main>
  )
}
