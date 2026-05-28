'use client'

import React, { FC, useEffect, useState } from 'react'
import { Channel, TColor } from '@/shared/types'
import { ControlGroup, Input } from '../inputs'
import { useStore } from '@nanostores/react'
import { colorSpaceStore } from '@/store/palette'
import { clamp } from '@/shared/utils'

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

  const channelNumClass =
    'channel-input [-moz-appearance:textfield] h-full w-20 py-[5px] pl-6 pr-2 text-sm leading-5 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none'

  return (
    <ControlGroup>
      <label className="relative isolate">
        <span className="-translate-y-1/2 absolute top-1/2 left-0 py-1 pl-2 text-[var(--c-text-hint)]">
          L
        </span>
        <Input
          className={channelNumClass}
          type="number"
          min={ranges.l.min}
          max={ranges.l.max}
          step={ranges.l.step}
          value={+l.toFixed(ranges.l.precision)}
          onChange={e => setColor('l', +e.target.value)}
        />
      </label>
      <label className="relative isolate">
        <span className="-translate-y-1/2 absolute top-1/2 left-0 py-1 pl-2 text-[var(--c-text-hint)]">
          C
        </span>
        <Input
          className={channelNumClass}
          type="number"
          min={ranges.c.min}
          max={ranges.c.max}
          step={ranges.c.step}
          value={+c.toFixed(ranges.c.precision)}
          onChange={e => setColor('c', +e.target.value)}
        />
      </label>
      <label className="relative isolate">
        <span className="-translate-y-1/2 absolute top-1/2 left-0 py-1 pl-2 text-[var(--c-text-hint)]">
          H
        </span>
        <Input
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
        className="w-20"
        value={colorInput}
        style={{ color: within_sRGB ? 'inherit' : 'red' }}
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
    </ControlGroup>
  )
}
