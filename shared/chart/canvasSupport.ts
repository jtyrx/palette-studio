/** Whether the browser can use a Display P3 2D canvas (oklch-picker parity). */
export function supportsDisplayP3(): boolean {
  if (typeof document === 'undefined') return false
  const canvas = document.createElement('canvas')
  return (
    canvas.getContext('2d', { colorSpace: 'display-p3' } as CanvasRenderingContext2DSettings) !==
    null
  )
}

export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1
  return Math.ceil(window.devicePixelRatio || 1)
}

export type ChartBorderColors = {
  borderP3: { r: number; g: number; b: number; alpha: number }
  borderRec2020: { r: number; g: number; b: number; alpha: number }
}

/** Read gamut border colors from CSS custom properties (0–1 channels). */
export function readChartBorderColors(): ChartBorderColors {
  if (typeof document === 'undefined') {
    return {
      borderP3: { r: 130 / 255, g: 130 / 255, b: 130 / 255, alpha: 1 },
      borderRec2020: { r: 100 / 255, g: 100 / 255, b: 100 / 255, alpha: 1 },
    }
  }

  const style = getComputedStyle(document.documentElement)

  const parse = (prop: string, fallback: string) => {
    const raw = style.getPropertyValue(prop).trim() || fallback
    const el = document.createElement('span')
    el.style.color = raw
    document.body.appendChild(el)
    const rgb = getComputedStyle(el).color
    document.body.removeChild(el)
    const m = rgb.match(/[\d.]+/g)
    if (!m || m.length < 3) return { r: 0.5, g: 0.5, b: 0.5, alpha: 1 }
    return {
      r: Number(m[0]) / 255,
      g: Number(m[1]) / 255,
      b: Number(m[2]) / 255,
      alpha: m[3] ? Number(m[3]) : 1,
    }
  }

  return {
    borderP3: parse('--chart-border-p3', 'oklch(0.55 0 0)'),
    borderRec2020: parse('--chart-border-rec2020', 'oklch(0.42 0 0)'),
  }
}
