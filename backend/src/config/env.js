import { z } from 'zod'
import 'dotenv/config'

const schema = z.object({
  NODE_ENV:              z.enum(['development', 'production', 'test']).default('development'),
  PORT:                  z.string().default('3001'),
  DATABASE_URL:          z.string(),
  REDIS_URL:             z.string(),
  RESEND_API_KEY:        z.string(),
  PAYPAL_CLIENT_ID:      z.string(),
  PAYPAL_CLIENT_SECRET:  z.string(),
  PAYPAL_MODE:           z.enum(['sandbox', 'live']).default('sandbox'),
  MASTER_API_KEY:        z.string(),
  AGENCY_NAME:           z.string(),
  AGENCY_FROM_EMAIL:     z.string(),
  AGENCY_NOTIFY_EMAIL:   z.string(),
  AGENCY_DOMAIN:         z.string(),
  ADMIN_EMAIL:           z.string().email(),
  RESEND_FROM_EMAIL:     z.string().email(),
  FRONTEND_URL:          z.string().default('http://localhost:4200'),

  // Zoho SMTP (email provider)
  SMTP_HOST:            z.string(),
  SMTP_PORT:            z.string(),
  SMTP_USER:            z.string(),
  SMTP_PASS:            z.string(),
  FROM_EMAIL:           z.string().email(),

  // Kept for future toggling/disable switches
  EMAIL_PROVIDER:       z.string().optional(),
})


const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('Missing environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data