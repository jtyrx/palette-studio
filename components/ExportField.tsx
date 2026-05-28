'use client'

import React, { FC, useEffect, useState, useRef } from 'react'
import { useStore } from '@nanostores/react'
import {
  exportToHexPalette,
  parseHexPalette,
} from '@/store/palette'
import { paletteStore, setPalette } from '@/store/palette'
import { cn } from '@/lib/utils'

export const ExportField: FC = () => {
  const palette = useStore(paletteStore)
  const ref = useRef<HTMLTextAreaElement>(null)
  const [areaValue, setAreaValue] = useState('')
  const currentJSON = JSON.stringify(exportToHexPalette(palette), null, 2)

  useEffect(() => {
    if (document.activeElement !== ref.current) {
      setAreaValue(currentJSON)
    }
  }, [currentJSON])

  return (
    <textarea
      ref={ref}
      className={cn('ns-input min-h-30 w-full resize-none font-mono text-xs')}
      onBlur={() => setAreaValue(currentJSON)}
      value={areaValue}
      onFocus={e => e.target.select()}
      onChange={e => {
        const value = e.target.value
        setAreaValue(value)
        if (value) {
          try {
            const json = JSON.parse(value)
            const newPalette = parseHexPalette(json, palette.mode)
            setPalette(newPalette)
          } catch (error) {
            console.warn('Parsing error', error)
          }
        }
      }}
    />
  )
}
