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
    <div
      className="flex min-h-0 flex-1 flex-col gap-1"
      data-slot={`selected-color-value-${label.toLowerCase()}`}
    >
      <button
        type="button"
        onClick={onCopy}
        className="flex h-full min-h-10 w-full cursor-pointer items-stretch overflow-hidden rounded-(--radius-m) bg-(--color-interactive-bg) text-left transition-colors hover:bg-(--color-interactive-bg-hover) focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-(--color-text-primary)"
        title={copied ? 'Copied' : `Copy ${label}`}
      >
        <span className="flex w-8 shrink-0 items-center justify-center border-r border-(--color-border-subtle) text-sm font-medium text-(--color-text-hint)">
          {label}
        </span>
        <span className="min-w-0 flex-1 truncate px-3 py-2 font-mono text-sm text-(--color-text-primary)">
          {copied ? 'Copied!' : value}
        </span>
      </button>
      {hint ? (
        <p className="px-1 text-xs text-(--color-text-hint)">{hint}</p>
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
      data-slot={`selected-color-swatch-${gamut}`}
      className="relative min-h-20 w-full flex-1 overflow-hidden rounded-(--radius-m) ring-1 ring-(--color-border-subtle)"
      style={style}
      data-color-gamut={gamut}
    >
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-(--color-surface-default)/80 px-2.5 py-0.5 text-xs font-medium text-(--color-text-primary) backdrop-blur-sm">
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
      id="selected-color-card"
      data-slot="selected-color-card"
      className="grid grid-cols-2 gap-3"
      aria-label={`Selected color ${swatchName}`}
    >
      <div
        className="flex min-h-44 flex-col gap-3"
        data-slot="selected-color-swatches"
      >
        <Swatch label="P3" gamut="p3" background={display.p3Background} />
        <Swatch
          label="Fallback"
          gamut="srgb"
          background={display.fallbackBackground}
        />
      </div>

      <div
        className="flex min-h-44 flex-col gap-3"
        data-slot="selected-color-values"
      >
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
      </div>
    </section>
  )
}
