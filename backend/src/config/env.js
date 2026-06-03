import { z } from 'zod'
import 'dotenv/config'

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.string().default('3001'),

  DATABASE_URL: z.string(),

  REDIS_URL: z.string(),

  RESEND_API_KEY: z.string(),

  PAYPAL_CLIENT_ID: z.string(),

  PAYPAL_CLIENT_SECRET: z.string(),

  PAYPAL_MODE: z
    .enum(['sandbox', 'live'])
    .default('sandbox'),

  MASTER_API_KEY: z.string(),

  AGENCY_NAME: z.string(),

  AGENCY_FROM_EMAIL: z.string(),

  AGENCY_NOTIFY_EMAIL: z.string(),

  AGENCY_DOMAIN: z.string(),

  ADMIN_EMAIL: z.string().email(),

  RESEND_FROM_EMAIL: z.string().email(),

  FRONTEND_URL: z
    .string()
    .default('http://localhost:4200'),

  /**
   * EmailJS
   */
  EMAILJS_SERVICE_ID: z.string().optional(),

  // Kept for backward compatibility with older env setups
  EMAILJS_TEMPLATE_ID: z.string().optional(),

  EMAILJS_ADMIN_TEMPLATE_ID: z.string().optional(),

  EMAILJS_USER_TEMPLATE_ID: z.string().optional(),

  EMAILJS_PUBLIC_KEY: z.string().optional(),

  // Required by EmailJS HTTP API as `accessToken`
  EMAILJS_PRIVATE_KEY: z.string().optional(),

  /**
   * Optional provider toggle
   */
  EMAIL_PROVIDER: z.string().optional(),
})


const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors

  console.error('❌ Environment validation failed')
  console.error(errors)

  process.exit(1)
}

export const env = parsed.data

/**
 * Runtime EmailJS validation
 * Non-fatal for local development safety
 */
const missingEmailJS = [
  !env.EMAILJS_SERVICE_ID && 'EMAILJS_SERVICE_ID',
  !env.EMAILJS_ADMIN_TEMPLATE_ID && 'EMAILJS_ADMIN_TEMPLATE_ID',
  !env.EMAILJS_USER_TEMPLATE_ID && 'EMAILJS_USER_TEMPLATE_ID',
  !env.EMAILJS_PUBLIC_KEY && 'EMAILJS_PUBLIC_KEY',
  !env.EMAILJS_PRIVATE_KEY && 'EMAILJS_PRIVATE_KEY',
].filter(Boolean)


if (missingEmailJS.length > 0) {
  console.warn('⚠ Missing EmailJS environment variables:')
  console.warn(missingEmailJS)

} else {
  console.log('✅ EmailJS environment variables loaded successfully')

  /**
   * Safe debug visibility
   */
  console.log('EMAILJS CONFIG:', {
    serviceId: env.EMAILJS_SERVICE_ID,
    templateIdLegacy: env.EMAILJS_TEMPLATE_ID,
    adminTemplateIdLoaded: Boolean(env.EMAILJS_ADMIN_TEMPLATE_ID),
    userTemplateIdLoaded: Boolean(env.EMAILJS_USER_TEMPLATE_ID),
    publicKeyLoaded: Boolean(env.EMAILJS_PUBLIC_KEY),
    privateKeyLoaded: Boolean(env.EMAILJS_PRIVATE_KEY),
  })

}

