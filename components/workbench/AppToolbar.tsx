'use client'

import { useStore } from '@nanostores/react'
import { setColor, setPalette } from '@/store/palette'
import { Button, ButtonLink, buttonVariants } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeButton } from '@/components/Header/ThemeButton'
import { ColorEditor } from '@/components/Header/ColorEditor'
import { ColorActions } from '@/components/Header/ColorActions'
import { ChartSettings } from '@/components/Header/ChartSettings'
import { GitHub } from '@/shared/icons/GitHub'
import { paletteStore } from '@/store/palette'
import {
  overlayStore,
  setOverlayMode,
  setVersusColor,
  type TOverlayMode,
} from '@/store/overlay'
import { selectedStore } from '@/store/currentPosition'

const modes: TOverlayMode[] = ['APCA', 'WCAG', 'NONE', 'DELTA_E']

const texts: Record<TOverlayMode, string> = {
  APCA: 'APCA contrast',
  WCAG: 'WCAG contrast',
  NONE: 'Without overlay',
  DELTA_E: 'Delta E distance',
}

export function AppToolbar() {
  const palette = useStore(paletteStore)
  const overlay = useStore(overlayStore)
  const selected = useStore(selectedStore)

  return (
    <header
      data-slot="app-toolbar"
      className="flex min-h-(--layout-shell-toolbar-h) shrink-0 flex-wrap items-center gap-12 border-b border-hairline bg-default px-16 py-8"
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-12">
        <SidebarTrigger />

        <ColorEditor
          color={selected.color}
          onChange={color => {
            const { l, c, h } = color
            setPalette(
              setColor(palette, [l, c, h], selected.hueId, selected.toneId)
            )
          }}
        />

        <ColorActions />
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <ButtonGroup orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const idx = modes.findIndex(mode => overlay.mode === mode) + 1
              setOverlayMode(modes[idx % modes.length])
            }}
          >
            {texts[overlay.mode]}
          </Button>
          {overlay.mode !== 'NONE' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setVersusColor(
                  overlay.versus === 'selected' ? 'white' : 'selected'
                )
              }
            >
              vs. {overlay.versus}
            </Button>
          )}
        </ButtonGroup>

        <ChartSettings />
        <ThemeButton />
        <ButtonLink
          className={buttonVariants({ variant: 'ghost', size: 'icon-sm' })}
          href="https://github.com/ardov/huetone"
          title="Based on Huetone (upstream)"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHub />
        </ButtonLink>
      </div>
    </header>
  )
}
