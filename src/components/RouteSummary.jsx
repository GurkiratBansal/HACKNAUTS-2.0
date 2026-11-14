import RouteInfoCard from './map/RouteInfoCard'
import RouteOptions from './RouteOptions'

export default function RouteSummary({
  info,
  fromLabel,
  toLabel,
  routes,
  selectedRouteId,
  onSelectRoute,
  onStart,
  canStart,
}) {
  return (
    <div className="space-y-2">
      <RouteInfoCard
        info={info}
        fromLabel={fromLabel}
        toLabel={toLabel}
        onStart={onStart}
        canStart={canStart}
      />
      <div className="pointer-events-auto">
        <RouteOptions
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelect={onSelectRoute}
          className="rounded-2xl border border-line bg-surface/95 p-3 shadow-soft backdrop-blur-md"
        />
      </div>
    </div>
  )
}
