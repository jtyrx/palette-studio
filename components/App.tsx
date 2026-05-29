'use client'

import { useStore } from '@nanostores/react'
import React, { FC, useMemo } from 'react'
import { ColorGraphScale } from './ColorGraph'
import { setLchColor } from '@/store/palette'
import { Help } from './Help'
import { KeyPressHandler } from './KeyPressHandler'
import { useKeyPress } from '@/shared/hooks/useKeyPress'
import { paletteStore } from '@/store/palette'
import { selectedStore, setSelected } from '@/store/currentPosition'
import { SelectedColorCard } from './SelectedColorCard'
import { AppShell } from '@/components/workbench/AppShell'
import { WorkbenchMain } from '@/components/workbench/WorkbenchMain'

export default function App() {
  const palette = useStore(paletteStore)
  const selected = useStore(selectedStore)

  const hueColors = useMemo(
    () => palette.colors.map(hue => hue[selected.toneId]),
    [palette.colors, selected.toneId],
  )

  return (
    <AppShell>
      <KeyPressHandler />
      <WorkbenchMain>
        <SelectedColorCard />
        <section
          id="color-graph-grid"
          data-slot="color-graph-grid"
          className="color-graph-grid min-w-0"
        >
          <ColorGraphScale
            axis="stop"
            selected={selected.toneId}
            channel="l"
            colors={palette.colors[selected.hueId]}
            onSelect={i => setSelected([selected.hueId, i])}
            onColorChange={(i, lch) => {
              setSelected([selected.hueId, i])
              setLchColor(lch, selected.hueId, i)
            }}
          />
          <ColorGraphAxisIndicator axis="l" />
          <ColorGraphScale
            axis="hue"
            selected={selected.hueId}
            channel="l"
            colors={hueColors}
            onSelect={i => setSelected([i, selected.toneId])}
            onColorChange={(i, lch) => {
              setSelected([i, selected.toneId])
              setLchColor(lch, i, selected.toneId)
            }}
          />

          <ColorGraphScale
            axis="stop"
            selected={selected.toneId}
            channel="c"
            colors={palette.colors[selected.hueId]}
            onSelect={i => setSelected([selected.hueId, i])}
            onColorChange={(i, lch) => {
              setSelected([selected.hueId, i])
              setLchColor(lch, selected.hueId, i)
            }}
          />
          <ColorGraphAxisIndicator axis="c" />
          <ColorGraphScale
            axis="hue"
            selected={selected.hueId}
            channel="c"
            colors={hueColors}
            onSelect={i => setSelected([i, selected.toneId])}
            onColorChange={(i, lch) => {
              setSelected([i, selected.toneId])
              setLchColor(lch, i, selected.toneId)
            }}
          />

          <ColorGraphScale
            axis="stop"
            selected={selected.toneId}
            channel="h"
            colors={palette.colors[selected.hueId]}
            onSelect={i => setSelected([selected.hueId, i])}
            onColorChange={(i, lch) => {
              setSelected([selected.hueId, i])
              setLchColor(lch, selected.hueId, i)
            }}
          />
          <ColorGraphAxisIndicator axis="h" />
          <ColorGraphScale
            axis="hue"
            selected={selected.hueId}
            channel="h"
            colors={hueColors}
            onSelect={i => setSelected([i, selected.toneId])}
            onColorChange={(i, lch) => {
              setSelected([i, selected.toneId])
              setLchColor(lch, i, selected.toneId)
            }}
          />
        </section>

        <div className="max-[860px]:hidden">
          <Help />
        </div>
      </WorkbenchMain>
    </AppShell>
  )
}

const ColorGraphAxisIndicator: FC<{ axis: 'l' | 'c' | 'h' }> = ({ axis }) => {
  const pressed = useKeyPress('Key' + axis.toUpperCase())
  return (
    <div
      className="color-graph-axis grid grid-rows-[1.625rem_auto]"
      data-slot="color-chart-axis-indicator"
      data-channel={axis}
      id={`color-chart-axis-${axis}`}
    >
      <span className="relative inline-block">
        <span
          className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 w-24 rounded-(--radius-m) text-center text-(--color-text-primary) leading-24"
          style={{
            fontWeight: pressed ? 900 : undefined,
            background: pressed
              ? 'var(--color-interactive-bg-active)'
              : 'var(--color-interactive-bg)',
          }}
        >
          {axis.toUpperCase()}
        </span>
      </span>
      {axis === 'l' && (
        <div
          className="w-8 rounded-lg"
          style={{
            background:
              'linear-gradient(#fff, #b9b9b9, #777, #3b3b3b, #000)',
          }}
        />
      )}
      {axis === 'c' && (
        <div
          className="w-8 rounded-lg"
          style={{
            background:
              'linear-gradient(#ff00ff, #f440f3, #ea58e7, #df69dc, #d377d0, #c783c4, #bb8db8, #ad97ac, #9f9f9f)',
          }}
        />
      )}
      {axis === 'h' && (
        <div
          className="w-8 rounded-lg"
          style={{
            background:
              'linear-gradient(#e183a1, #55aee8, #9bb054, #db9152, #e183a1)',
          }}
        />
      )}
    </div>
  )
}
