import RouteInfoCard from './map/RouteInfoCard'

/**
 * Single-route summary. The alternatives picker (RouteOptions/routeScore) is
 * intentionally not rendered while the app uses one fastest OSRM route; that
 * UI is kept for a later feature.
 */
export default function RouteSummary({
  info,
  fromLabel,
  toLabel,
  onStart,
  canStart,
  onRetry,
  googleMapsUrl,
}) {
  return (
    <RouteInfoCard
      info={info}
      fromLabel={fromLabel}
      toLabel={toLabel}
      onStart={onStart}
      canStart={canStart}
      onRetry={onRetry}
      googleMapsUrl={googleMapsUrl}
    />
  )
}
