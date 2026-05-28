'use client'

import React, { FC } from 'react'
import { apcaContrast, wcagContrast } from '@/shared/color'

export const ContrastBadgeAPCA: FC<{ background: string; color: string }> = ({
  background,
  color,
}) => {
  const cr = apcaContrast(background, color)
  const displayCr = Math.floor(cr * 10) / 10
  return (
    <div className="flex flex-col rounded-[var(--radius-m)] bg-[var(--c-bg-card)] text-center">
      <span
        className="w-full rounded-[var(--radius-m)] leading-10 shadow-[inset_0_0_0_1px_var(--c-divider)]"
        style={{ background, color }}
      >
        APCA
      </span>
      <span
        className="p-2 text-sm leading-5"
        style={{ color: getAPCAColor(cr) }}
      >
        <strong>{displayCr}</strong> – {getAPCAComment(cr)}
      </span>
    </div>
  )
}

export const ContrastBadgeWCAG: FC<{ background: string; color: string }> = ({
  background,
  color,
}) => {
  const cr = wcagContrast(background, color)
  const displayCr = Math.floor(cr * 10) / 10
  return (
    <div className="flex flex-col rounded-[var(--radius-m)] bg-[var(--c-bg-card)] text-center">
      <span
        className="w-full rounded-[var(--radius-m)] leading-10 shadow-[inset_0_0_0_1px_var(--c-divider)]"
        style={{ background, color }}
      >
        WCAG
      </span>
      <span
        className="p-2 text-sm leading-5"
        style={{ color: getWCAGColor(cr) }}
      >
        <strong>{displayCr}</strong> – {getWCAGComment(cr)}
      </span>
    </div>
  )
}

function getAPCAComment(cr: number) {
  if (cr >= 75) return 'Best for text'
  if (cr >= 68.95 && cr <= 69.05) return 'Nice'
  if (cr >= 60) return 'Ok for text'
  if (cr >= 45) return 'Only large text'
  if (cr >= 30) return 'Not for reading text'
  if (cr >= 15) return 'Not for any text'
  return 'Fail'
}
function getAPCAColor(cr: number) {
  if (cr >= 60) return 'var(--c-text-success)'
  if (cr < 30) return 'var(--c-text-error)'
  return 'var(--c-text-primary)'
}
function getWCAGComment(cr: number) {
  if (cr >= 7.0) return 'AAA'
  if (cr >= 4.5) return 'AA (normal), AAA (large)'
  if (cr >= 3.0) return 'AA (large & UI components)'
  return 'Fail'
}
function getWCAGColor(cr: number) {
  if (cr >= 4.5) return 'var(--c-text-success)'
  if (cr < 3) return 'var(--c-text-error)'
  return 'var(--c-text-primary)'
}
