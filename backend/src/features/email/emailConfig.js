import nodemailer from 'nodemailer'
import net from 'net'
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
  port: Number(env.SMTP_PORT) || 587,

  secure: env.SMTP_SECURE === 'true',

  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },

  // Enable Nodemailer debugging and logger to capture SMTP traffic
  logger: true,
  debug: true,

  // Explicit timeouts (ms) to avoid long hangs
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,

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
    // Basic info (avoid logging sensitive info like passwords)
    console.log('[EMAIL] Verifying transporter...')
    console.log('[EMAIL] SMTP host:', env.SMTP_HOST)
    console.log('[EMAIL] SMTP port:', env.SMTP_PORT)
    console.log('[EMAIL] SMTP user:', env.SMTP_USER)

    await transporter.verify()

    console.log(`
==================================
✓ BLEVAL EMAIL SYSTEM READY
Provider: ${env.EMAIL_PROVIDER}
SMTP Host: ${env.SMTP_HOST}
SMTP Port: ${env.SMTP_PORT}
SMTP User: ${env.SMTP_USER}
==================================
    `)

    // Temporary: quick TCP connectivity test to Brevo relay
    try {
      const brevoTest = await testBrevoRelay('smtp-relay.brevo.com', Number(env.SMTP_PORT) || 587)
      if (brevoTest.ok) {
        console.log('[EMAIL] Brevo relay tcp/connectivity: OK (smtp-relay.brevo.com)')
      } else {
        console.error('[EMAIL] Brevo relay tcp/connectivity: FAILED (smtp-relay.brevo.com)')
        console.error(brevoTest.error)
      }
    } catch (err) {
      console.error('[EMAIL] Brevo relay tcp/connectivity: ERROR', err)
    }

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

/**
 * Temporary TCP connectivity test to Brevo SMTP relay
 * Resolves { ok: true } on successful TCP connect, otherwise { ok: false, error }
 */
function testBrevoRelay(host = 'smtp-relay.brevo.com', port = 587) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port }, () => {
      socket.end()
      resolve({ ok: true })
    })

    socket.setTimeout(30000)

    socket.on('error', (err) => {
      resolve({ ok: false, error: err })
    })

    socket.on('timeout', () => {
      socket.destroy()
      resolve({ ok: false, error: new Error('TCP connection timed out') })
    })
  })
}

export default transporter