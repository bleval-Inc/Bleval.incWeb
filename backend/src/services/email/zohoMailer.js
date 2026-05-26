import nodemailer from 'nodemailer'
import { env } from '../../config/env.js'

/**
 * Zoho SMTP Transport
 *
 * Optimized for:
 * - Render deployments
 * - Cloud networking
 * - STARTTLS
 * - IPv4 enforcement
 * - Long SMTP handshake times
 */

export const zohoTransport = nodemailer.createTransport({
  /**
   * Zoho Global SMTP Host
   */
  host: 'smtp.zoho.com',

  /**
   * STARTTLS Port
   * More reliable on cloud hosts than 465
   */
  port: 587,

  /**
   * MUST remain false for port 587
   */
  secure: false,

  /**
   * Upgrade plain connection to TLS
   */
  requireTLS: true,

  /**
   * SMTP Authentication
   */
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },

  /**
   * Force IPv4
   * Helps avoid Render IPv6 SMTP issues
   */
  family: 4,

  /**
   * TLS Configuration
   */
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2',
  },

  /**
   * Cloud/Render SMTP stability
   */
  connectionTimeout: 60000,
  greetingTimeout: 60000,
  socketTimeout: 60000,

  /**
   * Debugging
   * Helpful while troubleshooting
   */
  logger: true,
  debug: true,
})

/**
 * Verify transporter on startup
 * Does NOT crash application
 */
zohoTransport.verify((error, success) => {
  if (error) {
    console.error('SMTP VERIFY ERROR:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack,
    })
  } else {
    console.log('SMTP SERVER READY')
  }
})