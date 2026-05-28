'use client'

import { useEffect, useMemo, useRef } from 'react'
import debounce from 'lodash/debounce'
import { useStore } from '@nanostores/react'
import type { Channel, spaceName, TColor } from '@/shared/types'
import { paletteStore } from '@/store/palette'
import { chartSettingsStore } from '@/store/chartSettings'

import {
  channelFuncs,
  ConcurrentSpreadRender,
  optimalPoolSize,
  RenderStrategyType,
  DrawPartialFn,
  ConcurrentSpreadStrategyParams,
} from './RenderStrategy'
import { drawImageOnCanvasSafe } from './drawImageOnCanvasSafe'

/** 100 is kind of optimal repaint ratio (1% per 'frame-column'). More areas cause more worker overhead */
export const OPTIMAL_SPREAD_AREAS_AMOUNT = 100
export const SUPERSAMPLING_RATIO = 1

const RENDER_STRATEGY_DEBOUNCE: { [K in RenderStrategyType]: number } = {
  basic: 200,
  concurrent: 50,
  spread: 0,
}
const RENDER_STRATEGY_SPREAD: { [K in RenderStrategyType]: number } = {
  basic: 1,
  concurrent: optimalPoolSize,
  spread: OPTIMAL_SPREAD_AREAS_AMOUNT,
}

export function Canvas(props: {
  width: number
  height: number
  channel: Channel
  colors: TColor[]
  renderStrategy?: RenderStrategyType
}) {
  const settings = useStore(chartSettingsStore)
  const { mode } = useStore(paletteStore)
  const {
    width,
    height,
    channel,
    colors,
    renderStrategy = 'concurrent',
  } = props
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const debouncedRepaint = useMemo(() => {
    const debounceRate = RENDER_STRATEGY_DEBOUNCE[renderStrategy]
    const renderSpread = RENDER_STRATEGY_SPREAD[renderStrategy]

    return debounce((paintColors: TColor[], paintMode: spaceName) => {
      console.log('🖼 Repaint canvas')
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx) return

      const drawPartialImage: DrawPartialFn = (image, from, to) => {
        ctx.clearRect(from, 0, to - from, height)
        drawImageOnCanvasSafe(ctx, image, from, to, height)
      }

      const renderParams: ConcurrentSpreadStrategyParams = {
        width,
        height,
        mode: paintMode,
        colors: paintColors,
        ...settings,
        spread: renderSpread,
        scale: SUPERSAMPLING_RATIO,
      }

      return ConcurrentSpreadRender(
        channelFuncs,
        channel,
        renderParams,
        drawPartialImage
      )
    }, debounceRate)
  }, [channel, height, settings, width, renderStrategy])

  useEffect(() => {
    debouncedRepaint(colors, mode)
    return () => {
      debouncedRepaint(colors, mode)?.abort()
      debouncedRepaint.cancel()
    }
  }, [colors, debouncedRepaint, mode])
  return (
    <div
      className="overflow-hidden rounded-b-lg"
      style={{
        backgroundColor: 'var(--color-canvas-2)',
        backgroundImage:
          'linear-gradient(45deg, var(--color-canvas-1) 25%, transparent 25%), linear-gradient(-45deg, var(--color-canvas-1) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--color-canvas-1) 75%), linear-gradient(-45deg, transparent 75%, var(--color-canvas-1) 75%)',
        backgroundSize: '0.375rem 0.375rem',
        backgroundPosition: '0 0, 0 0.1875rem, 0.1875rem -0.1875rem, -0.1875rem 0',
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="drop-shadow-[0_0_1px_var(--color-canvas-1)]"
        style={{
          filter: settings.showColors ? undefined : 'var(--color-canvas-filter)',
        }}
      />
    </div>
  )
}
