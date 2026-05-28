'use client'

import { useStore } from '@nanostores/react'
import { getMostContrast } from '@/shared/color'
import type { Channel, LCH, TColor } from '@/shared/types'
import { colorSpaceStore } from '@/store/palette'
import { chartSettingsStore } from '@/store/chartSettings'
import type { ChangeEvent, CSSProperties } from 'react'
import { Canvas } from './Chart/Canvas'
import { clamp } from '@/shared/utils'
import { useElementSize } from '@/shared/hooks/useElementSize'

type ChartAxis = 'stop' | 'hue'

export type ColorGraphScaleProps = {
  colors: TColor[]
  selected: number
  channel: Channel
  axis: ChartAxis
  onSelect: (idx: number) => void
  onColorChange: (idx: number, lch: LCH) => void
}

export function ColorGraphScale({
  colors,
  selected,
  channel = 'l',
  axis,
  onSelect,
  onColorChange,
}: ColorGraphScaleProps) {
  const { showColors } = useStore(chartSettingsStore)
  const { ranges } = useStore(colorSpaceStore)
  const { ref: chartRef, size } = useElementSize<HTMLDivElement>()

  if (!colors?.length) return null

  const setColor = (color: TColor, idx: number, value: number) => {
    const { l, c, h } = color
    value = clamp(value, ranges[channel].min, ranges[channel].max)
    if (channel === 'l') onColorChange(idx, [value, c, h])
    if (channel === 'c') onColorChange(idx, [l, value, h])
    if (channel === 'h') onColorChange(idx, [l, c, value])
  }

  const chartReady = size.width > 0 && size.height > 0

  const chartId = `color-chart-${channel}-${axis}`

  return (
    <div
      id={chartId}
      data-slot="color-chart"
      data-channel={channel}
      data-axis={axis}
      className="color-graph-scale"
    >
      <div
        className="flex overflow-hidden rounded-t-lg"
        data-slot="color-chart-values"
      >
        {colors.map((color, i) => {
          const contrasting = getMostContrast(color.hex, ['black', 'white'])
          return (
            <input
              key={i}
              data-slot="color-chart-value-input"
              data-index={i}
              className="graph-value-input"
              type="number"
              title={color[channel].toFixed(ranges[channel].precision)}
              min={ranges[channel].min}
              max={ranges[channel].max}
              step={ranges[channel].step}
              value={
                +color[channel].toFixed(
                  i === selected ? ranges[channel].precision : 1
                )
              }
              style={{
                backgroundColor: color.hex,
                color: contrasting,
                ['--color-text-contrasting' as string]: contrasting,
              }}
              onMouseDown={e => {
                if (i === selected || e.ctrlKey) return
                e.preventDefault()
                onSelect(i)
                const active = document.activeElement
                if (active instanceof HTMLInputElement) active.blur()
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  e.currentTarget.blur()
                }
              }}
              onFocus={e => {
                onSelect(i)
                setTimeout(() => e.target.select(), 0)
              }}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setColor(color, i, +e.target.value)
              }
            />
          )
        })}
      </div>
      <div
        ref={chartRef}
        className="color-graph-chart"
        data-slot="color-chart-plot"
        id={`${chartId}-plot`}
      >
        {chartReady && (
          <Canvas
            width={size.width}
            height={size.height}
            channel={channel}
            axis={axis}
            colors={colors}
          />
        )}

        {colors.map((color, i) => {
          const contrastThumb = getMostContrast(color.hex, ['#fff', '#000'])
          const knobLeft = `${((i + 0.5) / colors.length) * 100}%`
          return (
            <input
              key={i}
              type="range"
              className="graph-knob"
              data-slot="color-chart-knob"
              data-index={i}
              data-selected={i === selected ? 'true' : 'false'}
              min={ranges[channel].min}
              max={ranges[channel].max}
              step={ranges[channel].step}
              value={color[channel]}
              onChange={e => setColor(color, i, +e.target.value)}
              onClick={() => onSelect(i)}
              style={
                {
                  left: knobLeft,
                  '--track':
                    i === selected ? 'var(--color-border-subtle)' : 'transparent',
                  '--bg': showColors ? contrastThumb : color.hex,
                  '--contrast': contrastThumb,
                } as CSSProperties
              }
            />
          )
        })}
      </div>
    </div>
  )
}
