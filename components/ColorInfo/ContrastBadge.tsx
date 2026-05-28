'use client'

import React, { FC } from 'react'
import { apcaContrast, wcagContrast, deltaEContrast } from '@/shared/color'

export const ContrastBadgeAPCA: FC<{ background: string; color: string }> = ({
  background,
  color,
}) => {
  const cr = apcaContrast(background, color)
  return (
    <div className="flex flex-col rounded-(--radius-m) bg-(--color-surface-card) text-center">
      <span
        className="w-full rounded-(--radius-m) leading-10 shadow-[inset_0_0_0_1px_(--color-border-subtle)]"
        style={{ background, color }}
      >
        APCA
      </span>
      <span
        className="p-2 text-sm leading-5"
        style={{ color: getAPCAColor(cr) }}
      >
        <strong>{cr}</strong> – {getAPCAComment(cr)}
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
    <div className="flex flex-col rounded-(--radius-m) bg-(--color-surface-card) text-center">
      <span
        className="w-full rounded-(--radius-m) leading-10 shadow-[inset_0_0_0_1px_(--color-border-subtle)]"
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

export const ContrastBadgeDeltaE: FC<{ background: string; color: string }> = ({
  background,
  color,
}) => {
  const cr = deltaEContrast(background, color)
  const displayCr = Math.floor(cr * 10) / 10
  return (
    <div className="col-span-full flex items-center gap-3 rounded-(--radius-m) bg-(--color-surface-card) px-3 py-2 text-sm">
      <span className="text-(--color-text-hint)">ΔE CIE76</span>
      <strong style={{ color: getDeltaEColor(cr) }}>{displayCr}</strong>
      <span className="text-(--color-text-secondary)">{getDeltaEComment(cr)}</span>
    </div>
  )
}

function getAPCAComment(cr: number) {
  const abs = Math.abs(cr)
  if (abs >= 75) return 'Best for text'
  if (abs >= 60) return 'Ok for text'
  if (abs >= 45) return 'Only large text'
  if (abs >= 30) return 'Not for reading text'
  if (abs >= 15) return 'Not for any text'
  return 'Fail'
}
function getAPCAColor(cr: number) {
  const abs = Math.abs(cr)
  if (abs >= 60) return 'var(--color-text-success)'
  if (abs < 30) return 'var(--color-text-error)'
  return 'var(--color-text-primary)'
}
function getWCAGComment(cr: number) {
  if (cr >= 7.0) return 'AAA'
  if (cr >= 4.5) return 'AA (normal), AAA (large)'
  if (cr >= 3.0) return 'AA (large & UI components)'
  return 'Fail'
}
function getWCAGColor(cr: number) {
  if (cr >= 4.5) return 'var(--color-text-success)'
  if (cr < 3) return 'var(--color-text-error)'
  return 'var(--color-text-primary)'
}
function getDeltaEComment(cr: number) {
  if (cr < 1) return 'Not perceptible'
  if (cr < 2) return 'Barely perceptible'
  if (cr < 10) return 'Noticeable'
  if (cr < 50) return 'Clearly different'
  return 'Very different'
}
function getDeltaEColor(cr: number) {
  if (cr >= 50) return 'var(--color-text-success)'
  if (cr < 10) return 'var(--color-text-error)'
  return 'var(--color-text-primary)'
}
