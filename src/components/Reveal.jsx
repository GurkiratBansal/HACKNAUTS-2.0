import { useInView } from '../hooks/useInView'

/** Reveal content once as it enters the viewport. */
export default function Reveal({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.14 })

  return (
    <div
      ref={ref}
      className={`fresh-reveal ${inView ? 'fresh-reveal--visible' : ''} ${className}`}
      style={{ '--fresh-reveal-delay': `${delay}ms` }}
    >
      {children}
    </div>
  )
}
