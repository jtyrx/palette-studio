'use client'

import { useEffect, useRef, useState } from 'react'

type ElementSize = {
  width: number
  height: number
}

export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const update = () => {
      const { width, height } = element.getBoundingClientRect()
      const nextWidth = Math.round(width)
      const nextHeight = Math.round(height)
      setSize(prev =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight }
      )
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, size }
}
