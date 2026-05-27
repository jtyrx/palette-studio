'use client'

import React, { FC, Fragment, useCallback } from 'react'
import {
  getMostContrast,
  wcagContrast,
  apcaContrast,
  deltaEContrast,
} from '@/shared/color'
import {
  addHue,
  addTone,
  removeHue,
  removeTone,
  renameHue,
  renameTone,
} from '@/store/palette'
import { useKeyPress } from '@/shared/hooks/useKeyPress'
import { Button, InvisibleInput } from './inputs'
import { useStore } from '@nanostores/react'
import { colorSpaceStore, paletteStore, setPalette } from '@/store/palette'
import { selectedStore, setSelected } from '@/store/currentPosition'
import { overlayStore, versusColorStore } from '@/store/overlay'

const contrast = {
  WCAG: wcagContrast,
  APCA: apcaContrast,
  DELTA_E: deltaEContrast,
  NONE: () => undefined,
}

export const PaletteSwatches: FC = () => {
  const palette = useStore(paletteStore)
  const selected = useStore(selectedStore)
  const overlay = useStore(overlayStore)
  const versusColor = useStore(versusColorStore)
  const colorSpace = useStore(colorSpaceStore)
  const bPress = useKeyPress('KeyB')
  const { hues, tones, colors } = palette
  const getCR = useCallback(
    (hex: string) => {
      const cr = contrast[overlay.mode](versusColor, hex)
      return cr && Math.floor(cr * 10) / 10
    },
    [overlay.mode, versusColor]
  )

  const { tones: toneCount, hues: hueCount } = {
    tones: tones.length,
    hues: hues.length,
  }

  return (
    <div
      className="group grid"
      style={{
        gridTemplateColumns: `64px repeat(${toneCount}, 48px) 24px`,
        gridTemplateRows: `32px repeat(${hueCount}, 48px) 24px`,
      }}
    >
      <div />
      {tones.map((toneName, tone) => (
        <InvisibleInput
          key={tone}
          className="text-center"
          value={toneName}
          onChange={e => setPalette(renameTone(palette, tone, e.target.value))}
        />
      ))}
      <SmallButton title="Add tone" onClick={() => setPalette(addTone(palette))}>
        +
      </SmallButton>

      {colors.map((hueColors, hueId) => (
        <Fragment key={hueId}>
          <InvisibleInput
            value={hues[hueId]}
            onChange={e =>
              setPalette(renameHue(palette, hueId, e.target.value))
            }
          />
          {hueColors.map((color, toneId) => {
            const isSelected =
              hueId === selected.hueId && toneId === selected.toneId
            return (
              <button
                key={toneId + '-' + hueId}
                type="button"
                className="relative flex cursor-pointer items-center justify-center border-0 outline-none transition-transform duration-150 will-change-transform focus:outline-none"
                onClick={() => setSelected([hueId, toneId])}
                style={{
                  background: !bPress
                    ? color.hex
                    : colorSpace.lch2color([color.l, 0, 0]).hex,
                  color: getMostContrast(color.hex, ['#000', '#fff']),
                  borderRadius: isSelected ? 'var(--radius-m)' : 0,
                  transform: isSelected ? 'scale(1.25)' : 'scale(1)',
                  zIndex: isSelected ? 3 : 0,
                  fontWeight: isSelected ? 900 : 400,
                }}
              >
                <span>{getCR(color.hex)}</span>
              </button>
            )
          })}
          <SmallButton
            title="Delete this row"
            onClick={() => setPalette(removeHue(palette, hueId))}
          >
            ×
          </SmallButton>
        </Fragment>
      ))}

      <SmallButton title="Add row" onClick={() => setPalette(addHue(palette))}>
        +
      </SmallButton>
      {tones.map((toneName, toneId) => (
        <SmallButton
          key={toneId}
          title="Delete this column"
          onClick={() => setPalette(removeTone(palette, toneId))}
        >
          ×
        </SmallButton>
      ))}
    </div>
  )
}

/** Small +/- controls; fades in when grid is hovered. */
function SmallButton(props: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className="pointer-events-none bg-transparent p-0 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100"
      {...props}
    />
  )
}
