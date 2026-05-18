import express from 'express'
import helmet from 'helmet'
import cors from 'cors'

import { env } from './config/env.js'
import { tenantMiddleware } from './middleware/tenant.js'
import { errorHandler } from './middleware/errorHandler.js'
import { router } from './routes/index.js'

export function createApp() {
  const app = express()

  app.use(helmet())

  /**
   * Production-safe allowed origins
   * Supports:
   * - Local development
   * - Netlify frontend
   * - Future custom domains via env
   */
  const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:5173',
    'http://127.0.0.1:4200',

    // Netlify frontend
    'https://blevalincweb.netlify.app',

    // Optional future production frontend domain
    env.FRONTEND_URL
  ].filter(Boolean)

  const corsOptions = {
    origin(origin, callback) {
      /**
       * Allow:
       * - server-to-server requests
       * - Postman
       * - curl
       * - Render health checks
       */
      if (!origin) {
        return callback(null, true)
      }

      /**
       * Exact allowed origins
       */
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      /**
       * Allow Netlify preview deploy URLs
       * Example:
       * https://deploy-preview-12--blevalincweb.netlify.app
       */
      if (
        origin.includes('.netlify.app') &&
        origin.startsWith('https://')
      ) {
        return callback(null, true)
      }

      console.warn('[CORS BLOCKED]', origin)

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      )
    },

    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Client-ID',
      'X-API-Key'
    ],

    credentials: true,

    optionsSuccessStatus: 200
  }

  app.use(cors(corsOptions))
  app.options('*', cors(corsOptions))

  /**
   * Stripe/payment webhook raw body
   * MUST remain before express.json()
   */
  app.use(
    '/api/payments/webhook',
    express.raw({ type: 'application/json' })
  )

  app.use(express.json({ limit: '2mb' }))

  /**
   * Health checks
   */
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      environment: env.NODE_ENV,
      ts: Date.now()
    })
  })

  app.get('/api/healthz', (req, res) => {
    res.json({
      ok: true,
      service: 'bleval-backend',
      environment: env.NODE_ENV,
      ts: Date.now()
    })
  })

  /**
   * Multi-tenant resolver
   */
  app.use(tenantMiddleware)

  /**
   * API routes
   */
  app.use('/api', router)

  /**
   * Global error handler
   */
  app.use(errorHandler)

  return app
}