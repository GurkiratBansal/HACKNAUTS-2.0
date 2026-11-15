// FRESH:FILE  Reveal-on-scroll helper; fires once when an element enters the viewport.
// FRESH:AREA  Layout

import { useEffect, useRef, useState } from 'react'

/**
 * Fires once when an element scrolls into view. Falls back to visible when
 * IntersectionObserver is unavailable.
 */
export function useInView({ threshold = 0.3 } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView]
}
