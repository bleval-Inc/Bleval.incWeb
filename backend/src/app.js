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

  app.use(cors({
    origin: [
      env.FRONTEND_URL,
      `https://${env.AGENCY_DOMAIN}`,
      `https://www.${env.AGENCY_DOMAIN}`,
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Client-ID', 'X-API-Key'],
    credentials: true,
  }))

  app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))
  app.use(express.json({ limit: '2mb' }))

  app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }))

  app.use(tenantMiddleware)
  app.use('/api', router)
  app.use(errorHandler)

  return app
}