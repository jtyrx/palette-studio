'use client'

import React, { FC, useEffect, useState } from 'react'
import { useStore } from '@nanostores/react'
import { selectedStore } from '@/store/currentPosition'
import { paletteStore } from '@/store/palette'
import { valid } from '@/shared/color'
import { Input } from '../inputs'
import { ContrastBadgeAPCA, ContrastBadgeWCAG } from './ContrastBadge'

export const ColorInfo: FC = () => {
  const { tones } = useStore(paletteStore)
  return (
    <div className="flex flex-col gap-4">
      <ContrastGroup versusColor={tones[0]} />
      <ContrastGroup versusColor={'white'} />
      <ContrastGroup versusColor={'black'} />
    </div>
  )
}

const ContrastGroup: FC<{ versusColor: string }> = props => {
  const { color, hueId, toneId } = useStore(selectedStore)
  const { colors, tones, hues } = useStore(paletteStore)
  const hex = color.hex
  const [colorInput, setColorInput] = useState(props.versusColor)
  const [additionalColor, setAdditionalColor] = useState(colors[hueId][0].hex)
  const name = hues[hueId] + '-' + tones[toneId]

  useEffect(() => {
    const i = tones.indexOf(colorInput)
    if (i >= 0) {
      setAdditionalColor(colors[hueId][i].hex)
    } else if (valid(colorInput)) {
      setAdditionalColor(colorInput)
    }
  }, [colorInput, colors, hueId, tones])
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="col-span-full pt-2 text-center">
        <h4>
          {name} vs.{' '}
          <Input
            value={colorInput}
            onChange={e => {
              const value = e.target.value
              setColorInput(value)
            }}
          />
        </h4>
      </div>
      <ContrastBadgeAPCA background={additionalColor} color={hex} />
      <ContrastBadgeAPCA background={hex} color={additionalColor} />
      <ContrastBadgeWCAG background={additionalColor} color={hex} />
    </div>
  )
}
