import { createApp } from './app.js'
import { env } from './config/env.js'
import { db } from './db/index.js'
import { redis } from './db/redis.js'

const app = createApp()

/**
 * Safe dependency checks - non-blocking
 */
async function checkDependencies() {
  const checks = await Promise.allSettled([
    (async () => {
      await db.query('SELECT 1')
      return 'ok'
    })(),
    (async () => {
      const pong = await redis.ping()
      return pong ? 'ok' : 'fail'
    })()
  ])

  return {
    db: checks[0].status === 'fulfilled' ? 'ok' : 'fail',
    redis: checks[1].status === 'fulfilled' ? 'ok' : 'fail'
  }
}

/**
 * Health endpoint
 */
app.get('/api/healthz', async (req, res) => {
  try {
    const deps = await checkDependencies()
    const allOk = deps.db === 'ok' && deps.redis === 'ok'

    res.status(allOk ? 200 : 503).json({
      status: allOk ? 'ok' : 'degraded',
      service: 'bleval-backend',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      dependencies: deps
    })
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Bleval API running',
    health: '/api/healthz'
  })
})

/**
 * Global error safety
 */
process.on('unhandledRejection', (reason) => {
  console.error('🚨 Unhandled Rejection:', reason)
})

process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err)
})

/**
 * START SERVER (RAILWAY FIX APPLIED HERE)
 */
const PORT = env.PORT || process.env.PORT || 3000

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Bleval backend running → http://0.0.0.0:${PORT}`)
  console.log(`🌍 Environment: ${env.NODE_ENV}`)
  console.log(`🏥 Health check: /api/healthz\n`)
})

/**
 * Graceful shutdown
 */
const shutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`)

  server.close(async (err) => {
    if (err) {
      console.error('Server close error:', err)
      process.exit(1)
    }

    try {
      await Promise.allSettled([
        db?.end?.(),
        redis?.disconnect?.()
      ])

      console.log('✅ Cleanup complete. Exiting.')
      process.exit(0)
    } catch (err) {
      console.error('❌ Shutdown error:', err)
      process.exit(1)
    }
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))