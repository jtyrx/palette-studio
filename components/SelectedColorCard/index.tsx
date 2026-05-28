'use client'

import { useStore } from '@nanostores/react'
import { useCallback, useEffect, useState } from 'react'
import { getSelectedColorDisplay } from '@/shared/colorDisplay'
import { selectedStore } from '@/store/currentPosition'
import { paletteStore } from '@/store/palette'
function copyText(text: string) {
  void navigator.clipboard.writeText(text)
}

function ValueRow({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  const onCopy = useCallback(() => {
    copyText(value)
    setCopied(true)
  }, [value])

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onCopy}
        className="flex w-full cursor-pointer items-stretch overflow-hidden rounded-[var(--radius-m)] bg-[var(--color-interactive-bg)] text-left transition-colors hover:bg-[var(--color-interactive-bg-hover)] focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text-primary)]"
        title={copied ? 'Copied' : `Copy ${label}`}
      >
        <span className="flex w-8 shrink-0 items-center justify-center border-r border-[var(--color-border-subtle)] text-sm font-medium text-[var(--color-text-hint)]">
          {label}
        </span>
        <span className="min-w-0 flex-1 truncate px-3 py-2 font-mono text-sm text-[var(--color-text-primary)]">
          {copied ? 'Copied!' : value}
        </span>
      </button>
      {hint ? (
        <p className="px-1 text-xs text-[var(--color-text-hint)]">{hint}</p>
      ) : null}
    </div>
  )
}

function Swatch({
  label,
  background,
  gamut,
}: {
  label: string
  background: string
  gamut: 'p3' | 'srgb'
}) {
  const style =
    gamut === 'srgb'
      ? background.startsWith('linear-gradient')
        ? { backgroundImage: background }
        : { backgroundColor: background }
      : { background }

  return (
    <div
      className="relative min-h-[5.5rem] flex-1 overflow-hidden rounded-[var(--radius-m)] ring-1 ring-[var(--color-border-subtle)]"
      style={style}
      data-color-gamut={gamut}
    >
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-surface-default)]/80 px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-primary)] backdrop-blur-sm">
        {label}
      </span>
    </div>
  )
}

export function SelectedColorCard() {
  const { color, hueId, toneId } = useStore(selectedStore)
  const { hues, tones } = useStore(paletteStore)
  const display = getSelectedColorDisplay(color)
  const swatchName = `${hues[hueId]}-${tones[toneId]}`

  return (
    <section
      className="flex flex-col gap-3"
      aria-label={`Selected color ${swatchName}`}
    >
      <div className="flex gap-3">
        <Swatch label="P3" gamut="p3" background={display.p3Background} />
        <Swatch
          label="Fallback"
          gamut="srgb"
          background={display.fallbackBackground}
        />
      </div>

      <ValueRow label="O" value={display.oklch} />
      <ValueRow
        label="R"
        value={display.hex}
        hint={
          display.showFallbackNote
            ? 'Closest fallback (by chroma) in sRGB'
            : undefined
        }
      />
    </section>
  )
}
