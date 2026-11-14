import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number from its previous value to the new one.
 * Respects reduced motion and only starts when `start` is true.
 */
export function useCountUp(value, { duration = 1100, start = true } = {}) {
  const target = Number(value) || 0
  const [display, setDisplay] = useState(start ? target : 0)
  const fromRef = useRef(start ? target : 0)

  useEffect(() => {
    if (!start) return undefined

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced) {
      setDisplay(target)
      fromRef.current = target
      return undefined
    }

    const from = fromRef.current
    const startedAt = performance.now()
    let frame

    const tick = (time) => {
      const progress = Math.min(1, (time - startedAt) / duration)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(from + (target - from) * eased)
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, start])

  return display
}
