'use client'

import React, { FC } from 'react'
import { useStore } from '@nanostores/react'
import { exportToTokens } from '@/store/palette'
import { exportToCSS } from '@/store/palette/converters'
import { paletteStore } from '@/store/palette'
import { CopyButton } from './CopyButton'

export const TokenExportButton: FC = () => {
  const palette = useStore(paletteStore)
  return (
    <CopyButton
      getContent={() => {
        const tokens = exportToTokens(palette)
        return JSON.stringify(tokens, null, 2)
      }}
    >
      Copy tokens
    </CopyButton>
  )
}

export const CSSExportButton: FC = () => {
  const palette = useStore(paletteStore)
  return (
    <CopyButton getContent={() => exportToCSS(palette)}>
      Copy CSS variables
    </CopyButton>
  )
}
