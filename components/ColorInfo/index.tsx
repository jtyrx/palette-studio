'use client'

import React, { FC, useEffect, useState } from 'react'
import { useStore } from '@nanostores/react'
import { selectedStore } from '@/store/currentPosition'
import { paletteStore } from '@/store/palette'
import { valid } from '@/shared/color'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ContrastBadgeAPCA, ContrastBadgeWCAG, ContrastBadgeDeltaE } from './ContrastBadge'

type ColorInfoVariant = 'default' | 'sidebar'

export const ColorInfo: FC<{ variant?: ColorInfoVariant }> = ({
  variant = 'default',
}) => {
  const { tones } = useStore(paletteStore)
  const isSidebar = variant === 'sidebar'

  return (
    <div
      id="color-info"
      data-slot="color-info"
      data-variant={variant}
      className={cn('flex flex-col', isSidebar ? 'gap-7' : 'gap-4')}
    >
      <ContrastGroup
        variant={variant}
        versusColor={tones[0]}
        versusKey="palette-tone"
      />
      <ContrastGroup variant={variant} versusColor="white" versusKey="white" />
      <ContrastGroup variant={variant} versusColor="black" versusKey="black" />
    </div>
  )
}

const ContrastGroup: FC<{
  versusColor: string
  versusKey: string
  variant?: ColorInfoVariant
}> = (props) => {
  const isSidebar = props.variant === 'sidebar'
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
    <div
      id={`contrast-comparison-${props.versusKey}`}
      data-slot="contrast-comparison"
      data-versus={props.versusKey}
      className={cn(
        'grid gap-2',
        isSidebar
          ? 'grid-cols-1'
          : 'grid-cols-3 max-[640px]:grid-cols-1',
      )}
    >
      <div
        className={cn(
          'col-span-full',
          isSidebar ? 'pb-0.5 text-left' : 'pt-2 text-center',
        )}
        data-slot="contrast-comparison-header"
      >
        <h4
          className={cn(
            'flex flex-wrap gap-2 text-sm font-medium text-default',
            isSidebar ? 'items-baseline justify-start' : 'items-center justify-center',
          )}
        >
          <span>{name} vs.</span>
          <Input
            variant="workbench"
            className="inline-flex h-8 w-auto min-w-16 max-w-full"
            value={colorInput}
            onChange={e => {
              setColorInput(e.target.value)
            }}
          />
        </h4>
      </div>
      <ContrastBadgeAPCA
        background={additionalColor}
        color={hex}
        polarity="versus-on-selected"
      />
      <ContrastBadgeAPCA
        background={hex}
        color={additionalColor}
        polarity="selected-on-versus"
      />
      <ContrastBadgeWCAG background={additionalColor} color={hex} />
      <ContrastBadgeDeltaE background={additionalColor} color={hex} />
    </div>
  )
}
