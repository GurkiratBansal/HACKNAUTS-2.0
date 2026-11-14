import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'

/**
 * Image surface with a preserved silhouette: shimmer while loading, a graceful
 * fallback when the remote photo is unavailable, then a soft fade-in.
 */
export default function SmartImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  fallback,
  loading = 'lazy',
}) {
  const [state, setState] = useState(src ? 'loading' : 'error')

  useEffect(() => {
    setState(src ? 'loading' : 'error')
  }, [src])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {src && state !== 'error' && (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            state === 'loaded' ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
        />
      )}

      {state === 'loading' && (
        <span className="skeleton absolute inset-0" aria-hidden="true" />
      )}

      {state === 'error' &&
        (fallback || (
          <span className="flex h-full w-full items-center justify-center text-ink-muted">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
          </span>
        ))}
    </div>
  )
}
