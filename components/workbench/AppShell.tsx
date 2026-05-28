'use client'

import type { ReactNode } from 'react'
import { useStore } from '@nanostores/react'
import { getPaletteLink } from '@/store/palette'
import { paletteStore } from '@/store/palette'
import { CopyButton } from '@/components/CopyButton'
import { Link } from '@/shared/icons/Link'
import { PaletteSelect } from '@/components/Header/PaletteSelect'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { AppToolbar } from '@/components/workbench/AppToolbar'

export function AppShell({ children }: { children: ReactNode }) {
  const palette = useStore(paletteStore)

  return (
    <SidebarProvider defaultOpen className="h-full min-h-0">
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="shrink-0 gap-2 border-b border-hairline px-3 pt-3 pb-4">
          <div className="flex flex-col gap-2.5 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold leading-tight tracking-tight text-default">
              Palette Studio
            </p>
            <PaletteSelect />
            <CopyButton
              className="w-full justify-center"
              variant="outline"
              size="sm"
              getContent={() => getPaletteLink(palette)}
            >
              <Link />
              <span>Copy link</span>
            </CopyButton>
          </div>
        </SidebarHeader>
        <SidebarContent className="min-h-0 group-data-[collapsible=icon]:hidden" />
      </Sidebar>

      <SidebarInset className="min-h-0 flex flex-col">
        <AppToolbar />
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          data-slot="workbench-inset-main"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
