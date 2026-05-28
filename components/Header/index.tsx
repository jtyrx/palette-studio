'use client'

import { useStore } from '@nanostores/react'
import React from 'react'
import { getPaletteLink, setColor, setPalette } from '@/store/palette'
import { Button, ControlGroup, buttonClass } from '../inputs'
import { ThemeButton } from './ThemeButton'
import { PaletteSelect } from './PaletteSelect'
import { CopyButton } from '../CopyButton'
import { Link } from '@/shared/icons/Link'
import { GitHub } from '@/shared/icons/GitHub'
import { paletteStore } from '@/store/palette'
import {
  overlayStore,
  setOverlayMode,
  setVersusColor,
  TOverlayMode,
} from '@/store/overlay'
import { ColorEditor } from './ColorEditor'
import { ColorActions } from './ColorActions'
import { selectedStore } from '@/store/currentPosition'
import { ChartSettings } from './ChartSettings'

const modes: TOverlayMode[] = ['APCA', 'WCAG', 'NONE', 'DELTA_E']

const texts = {
  APCA: 'APCA contrast',
  WCAG: 'WCAG contrast',
  NONE: 'Without overlay',
  DELTA_E: 'Delta E distance',
}

export function Header() {
  const palette = useStore(paletteStore)
  const overlay = useStore(overlayStore)
  const selected = useStore(selectedStore)

  return (
    <header className="flex w-full flex-wrap items-start justify-between gap-2 border-b border-[var(--color-border-subtle)] p-4">
      <div className="flex flex-wrap gap-2">
        <PaletteSelect />
        <CopyButton getContent={() => getPaletteLink(palette)}>
          <Link />
          Copy link
        </CopyButton>
      </div>

      <div className="flex flex-wrap gap-2">
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

      <div className="flex flex-wrap gap-2">
        <ControlGroup>
          <Button
            onClick={() => {
              const idx = modes.findIndex(mode => overlay.mode === mode) + 1
              setOverlayMode(modes[idx % modes.length])
            }}
          >
            {texts[overlay.mode]}
          </Button>
          {overlay.mode !== 'NONE' && (
            <Button
              onClick={() =>
                setVersusColor(
                  overlay.versus === 'selected' ? 'white' : 'selected'
                )
              }
            >
              vs. {overlay.versus}
            </Button>
          )}
        </ControlGroup>

        <ChartSettings />

        <ThemeButton />
        <a
          className={buttonClass}
          href="https://github.com/ardov/huetone"
          title="Based on Huetone (upstream)"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHub />
        </a>
      </div>
    </header>
  )
}
