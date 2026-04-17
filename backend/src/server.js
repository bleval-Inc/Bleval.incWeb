// import { createApp } from './app.js'
// import { env } from './config/env.js'

// const app = createApp()

// app.listen(env.PORT, () => {
  //   console.log(`Bleval backend running → http://localhost:${env.PORT}`)
  //   console.log(`Environment: ${env.NODE_ENV}`)
  // })

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

  const results = {
    db: checks[0].status === 'fulfilled' ? checks[0].value : 'fail',
    redis: checks[1].status === 'fulfilled' ? checks[1].value : 'fail'
  }

  return results
}

/**
 * Health endpoint (system + dependencies) - never crashes
 */
app.get('/api/healthz', async (req, res) => {
  try {
    const deps = await checkDependencies()
    const allOk = deps.db === 'ok' && deps.redis === 'ok'
    const status = allOk ? 'ok' : 'degraded'

    res.status(allOk ? 200 : 503).json({
      status,
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
 * Enhanced global error safety nets - log only, no immediate crash
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason)
  // No process.exit - degrade
})

process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err)
  // No process.exit - log and continue if possible
})

/**
 * Start server
 */
const server = app.listen(env.PORT, () => {
  console.log(`\n🚀 Bleval backend running → http://localhost:${env.PORT}`)
  console.log(`🌍 Environment: ${env.NODE_ENV}`)
  console.log(`🏥 Health check: http://localhost:${env.PORT}/api/healthz\n`)
})

/**
 * Graceful shutdown - fixed for redis wrapper
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
        redis.disconnect()
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

