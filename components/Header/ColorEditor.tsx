'use client'

import React, { FC, useEffect, useState } from 'react'
import { Channel, TColor } from '@/shared/types'
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'
import { useStore } from '@nanostores/react'
import { colorSpaceStore } from '@/store/palette'
import { clamp } from '@/shared/utils'
import { cn } from '@/lib/utils'

type ColorEditorProps = {
  color: TColor
  onChange: (color: TColor) => void
}

export const ColorEditor: FC<ColorEditorProps> = ({ color, onChange }) => {
  const { lch2color, hex2color, ranges } = useStore(colorSpaceStore)
  const { l, c, h, hex, within_sRGB } = color
  const [isFocused, setIsFocused] = useState(false)
  const [colorInput, setColorInput] = useState(hex)

  useEffect(() => {
    if (!isFocused) setColorInput(hex)
  }, [hex, isFocused])

  const setColor = (channel: Channel, value: number) => {
    value = clamp(value, ranges[channel].min, ranges[channel].max)
    if (channel === 'l') onChange(lch2color([value, c, h]))
    if (channel === 'c') onChange(lch2color([l, value, h]))
    if (channel === 'h') onChange(lch2color([l, c, value]))
  }

  const channelNumClass = cn(
    'channel-input h-8 w-20 border-0 bg-transparent py-0 pl-6 pr-2 text-sm',
    '[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none',
    '[&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none'
  )

  return (
    <ButtonGroup orientation="horizontal" className="max-w-full overflow-x-auto">
      <label className="relative isolate flex shrink-0">
        <span className="pointer-events-none absolute top-1/2 left-2 z-10 -translate-y-1/2 text-xs text-muted-foreground">
          L
        </span>
        <Input
          variant="workbench"
          className={channelNumClass}
          type="number"
          min={ranges.l.min}
          max={ranges.l.max}
          step={ranges.l.step}
          value={+l.toFixed(ranges.l.precision)}
          onChange={e => setColor('l', +e.target.value)}
        />
      </label>
      <label className="relative isolate flex shrink-0">
        <span className="pointer-events-none absolute top-1/2 left-2 z-10 -translate-y-1/2 text-xs text-muted-foreground">
          C
        </span>
        <Input
          variant="workbench"
          className={channelNumClass}
          type="number"
          min={ranges.c.min}
          max={ranges.c.max}
          step={ranges.c.step}
          value={+c.toFixed(ranges.c.precision)}
          onChange={e => setColor('c', +e.target.value)}
        />
      </label>
      <label className="relative isolate flex shrink-0">
        <span className="pointer-events-none absolute top-1/2 left-2 z-10 -translate-y-1/2 text-xs text-muted-foreground">
          H
        </span>
        <Input
          variant="workbench"
          className={channelNumClass}
          type="number"
          min={ranges.h.min}
          max={ranges.h.max}
          step={ranges.h.step}
          value={+h.toFixed(ranges.h.precision)}
          onChange={e => setColor('h', +e.target.value)}
        />
      </label>
      <Input
        variant="workbench"
        className="h-8 w-24 shrink-0"
        value={colorInput}
        style={{ color: within_sRGB ? undefined : 'var(--color-text-error)' }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false)
          setColorInput(hex)
        }}
        onChange={e => {
          const value = e.target.value
          setColorInput(value)
          const parsed = hex2color(value)
          if (parsed) onChange(parsed)
        }}
      />
    </ButtonGroup>
  )
}
