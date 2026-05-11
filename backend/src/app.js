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

  const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:5173',
    'http://127.0.0.1:4200',
    'https://blevalincweb.netlify.app'
  ]

  const corsOptions = {
    origin(origin, callback) {
      // Allow server-to-server requests / Postman / same-origin requests
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-ID', 'X-API-Key'],
    credentials: true,
    optionsSuccessStatus: 200
  }

  app.use(cors(corsOptions))
  app.options('*', cors(corsOptions))


  app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))
  app.use(express.json({ limit: '2mb' }))

  app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }))

  app.use(tenantMiddleware)

  app.use('/api', router)

  app.use(errorHandler)


  return app
}