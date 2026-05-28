'use client'

import { useStore } from '@nanostores/react'
import React, { FC, useMemo } from 'react'
import { Scale } from './ColorGraph'
import { PaletteSwatches } from './PaletteSwatches'
import { setLchColor } from '@/store/palette'
import { ExportField } from './Export'
import { ColorInfo } from './ColorInfo'
import { Help } from './Help'
import { KeyPressHandler } from './KeyPressHandler'
import { useKeyPress } from '@/shared/hooks/useKeyPress'
import { paletteStore } from '@/store/palette'
import { selectedStore, setSelected } from '@/store/currentPosition'
import { Header } from './Header'
import { SelectedColorCard } from './SelectedColorCard'

export default function App() {
  const palette = useStore(paletteStore)
  const selected = useStore(selectedStore)

  const hueColors = useMemo(
    () => palette.colors.map(hue => hue[selected.toneId]),
    [palette.colors, selected.toneId]
  )

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <Header />
      <main className="flex min-h-0 flex-1 max-[860px]:flex-col">
        <KeyPressHandler />
        <section className="flex w-min min-w-[var(--layout-panel-min)] flex-col gap-4 overflow-auto p-4">
          <PaletteSwatches />
          <ColorInfo />
          <div className="flex flex-wrap gap-2">
            <ExportField />
          </div>
        </section>

        <section className="bg-[var(--color-surface-card)] flex flex-1 flex-col gap-4 overflow-auto px-6 py-4">
          <SelectedColorCard />
          <section className="color-graph-grid">
            <Scale
              selected={selected.toneId}
              channel="l"
              colors={palette.colors[selected.hueId]}
              onSelect={i => setSelected([selected.hueId, i])}
              onColorChange={(i, lch) => {
                setSelected([selected.hueId, i])
                setLchColor(lch, selected.hueId, i)
              }}
            />
            <ScaleIndicator axis="l" />
            <Scale
              selected={selected.hueId}
              channel="l"
              colors={hueColors}
              onSelect={i => setSelected([i, selected.toneId])}
              onColorChange={(i, lch) => {
                setSelected([i, selected.toneId])
                setLchColor(lch, i, selected.toneId)
              }}
            />

            <Scale
              selected={selected.toneId}
              channel="c"
              colors={palette.colors[selected.hueId]}
              onSelect={i => setSelected([selected.hueId, i])}
              onColorChange={(i, lch) => {
                setSelected([selected.hueId, i])
                setLchColor(lch, selected.hueId, i)
              }}
            />
            <ScaleIndicator axis="c" />
            <Scale
              selected={selected.hueId}
              channel="c"
              colors={hueColors}
              onSelect={i => setSelected([i, selected.toneId])}
              onColorChange={(i, lch) => {
                setSelected([i, selected.toneId])
                setLchColor(lch, i, selected.toneId)
              }}
            />

            <Scale
              selected={selected.toneId}
              channel="h"
              colors={palette.colors[selected.hueId]}
              onSelect={i => setSelected([selected.hueId, i])}
              onColorChange={(i, lch) => {
                setSelected([selected.hueId, i])
                setLchColor(lch, selected.hueId, i)
              }}
            />
            <ScaleIndicator axis="h" />
            <Scale
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
          <Help />
        </section>
      </main>
    </div>
  )
}

const ScaleIndicator: FC<{ axis: 'l' | 'c' | 'h' }> = ({ axis }) => {
  const pressed = useKeyPress('Key' + axis.toUpperCase())
  return (
    <div className="grid grid-rows-[1.625rem_auto]">
      <span className="relative inline-block">
        <span
          className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 w-6 rounded-[var(--radius-m)] text-center text-[var(--color-text-primary)] leading-6"
          style={{
            fontWeight: pressed ? 900 : undefined,
            background: pressed ? 'var(--color-interactive-bg-active)' : 'var(--color-interactive-bg)',
          }}
        >
          {axis.toUpperCase()}
        </span>
      </span>
      {axis === 'l' && (
        <div
          className="w-2 rounded-lg"
          style={{
            background:
              'linear-gradient(#fff, #b9b9b9, #777, #3b3b3b, #000)',
          }}
        />
      )}
      {axis === 'c' && (
        <div
          className="w-2 rounded-lg"
          style={{
            background:
              'linear-gradient(#ff00ff, #f440f3, #ea58e7, #df69dc, #d377d0, #c783c4, #bb8db8, #ad97ac, #9f9f9f)',
          }}
        />
      )}
      {axis === 'h' && (
        <div
          className="w-2 rounded-lg"
          style={{
            background:
              'linear-gradient(#e183a1, #55aee8, #9bb054, #db9152, #e183a1)',
          }}
        />
      )}
    </div>
  )
}
