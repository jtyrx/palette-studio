'use client'

import { useStore } from '@nanostores/react'
import { getMostContrast } from '@/shared/color'
import type { Channel, LCH, TColor } from '@/shared/types'
import { colorSpaceStore } from '@/store/palette'
import { chartSettingsStore } from '@/store/chartSettings'
import type { ChangeEvent, CSSProperties } from 'react'
import { Canvas } from './Chart/Canvas'
import { clamp } from '@/shared/utils'

type ScaleProps = {
  colors: TColor[]
  selected: number
  channel: Channel
  height?: number
  width?: number
  onSelect: (idx: number) => void
  onColorChange: (idx: number, lch: LCH) => void
}

export function Scale({
  colors,
  selected,
  channel = 'l',
  height = 150,
  width = 400,
  onSelect,
  onColorChange,
}: ScaleProps) {
  const { showColors } = useStore(chartSettingsStore)
  const { ranges } = useStore(colorSpaceStore)
  if (!colors?.length) return null
  const sectionWidth = width / colors.length

  const setColor = (color: TColor, idx: number, value: number) => {
    const { l, c, h } = color
    value = clamp(value, ranges[channel].min, ranges[channel].max)
    if (channel === 'l') onColorChange(idx, [value, c, h])
    if (channel === 'c') onColorChange(idx, [l, value, h])
    if (channel === 'h') onColorChange(idx, [l, c, value])
  }

  return (
    <div
      className="flex flex-col"
      style={{
        width: width,
      }}
    >
      <div className="flex overflow-hidden rounded-t-lg">
        {colors.map((color, i) => {
          const contrasting = getMostContrast(color.hex, ['black', 'white'])
          return (
            <input
              key={i}
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
      <div className="relative m-0 flex p-0 leading-none">
        <Canvas
          width={width}
          height={height}
          channel={channel}
          colors={colors}
        />

        {colors.map((color, i) => {
          const contrastThumb = getMostContrast(color.hex, ['#fff', '#000'])
          return (
            <input
              key={i}
              type="range"
              className="graph-knob"
              data-selected={i === selected ? 'true' : 'false'}
              min={ranges[channel].min}
              max={ranges[channel].max}
              step={ranges[channel].step}
              value={color[channel]}
              onChange={e => setColor(color, i, +e.target.value)}
              onClick={() => onSelect(i)}
              style={
                {
                  left: `${sectionWidth * i + sectionWidth / 2}px`,
                  width: `${height + 16}px`,
                  '--track':
                    i === selected ? 'var(--color-border-subtle)' : 'transparent',
                  '--track-size': `${height}px`,
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
