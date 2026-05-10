export function errorHandler(err, req, res, next) {
  try {
    console.error('🔥 Server Error:', err)

    const isDev = process.env.NODE_ENV !== 'production'
    const status = err?.status || 500
    const message = isDev ? err?.message : 'Internal Server Error'

    res.status(status).json({
      error: message,
    })
  } catch (handlerErr) {
    // NEVER throw from error handler
    try {
      res.status(500).json({ error: 'Internal Server Error' })
    } catch {
      // swallow
    }
  }
}
