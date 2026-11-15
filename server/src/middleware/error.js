// FRESH:FILE  src/middleware/error.js
// FRESH:AREA  API

// FRESH:API  Function: notFound.
export function notFound(_req, res) {
  res.status(404).json({ error: 'Not found' })
}

// FRESH:API  Function: errorHandler.
export function errorHandler(error, _req, res, _next) {
  console.error('[server]', error.message)
  res.status(error.statusCode || 500).json({ error: error.publicMessage || 'Internal server error' })
}
