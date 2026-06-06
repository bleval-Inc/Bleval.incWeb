import nodemailer from 'nodemailer'
import { env } from '../../config/env.js'

/**
 * =========================
 * FAIL FAST SAFETY CHECKS
 * =========================
 */

if (env.EMAIL_PROVIDER !== 'brevo') {
  console.warn('[EMAIL] Provider is not Brevo:', env.EMAIL_PROVIDER)
}

if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
  throw new Error('[EMAIL CONFIG] Missing SMTP credentials')
}

/**
 * =========================
 * TRANSPORTER
 * =========================
 */

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),

  secure: env.SMTP_SECURE === 'true',

  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },

  // Important for Render stability
  tls: {
    rejectUnauthorized: false,
  },
})

/**
 * =========================
 * VERIFY CONNECTION
 * =========================
 */

export async function verifyTransporter() {
  try {
    await transporter.verify()

    console.log(`
==================================
✓ BLEVAL EMAIL SYSTEM READY
Provider: ${env.EMAIL_PROVIDER}
SMTP Host: ${env.SMTP_HOST}
SMTP Port: ${env.SMTP_PORT}
==================================
    `)

    return { ok: true }
  } catch (err) {
    console.error(`
==================================
✗ EMAIL SYSTEM FAILED
Check SMTP credentials / network
==================================
    `)

    console.error(err)

    return { ok: false, error: err }
  }
}

export default transporter