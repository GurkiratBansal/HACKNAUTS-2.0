export function notFound(_req, res) {
  res.status(404).json({ error: 'Not found' })
}

export function errorHandler(error, _req, res, _next) {
  console.error('[server]', error.message)
  res.status(error.statusCode || 500).json({ error: error.publicMessage || 'Internal server error' })
}
