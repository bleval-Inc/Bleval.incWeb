import nodemailer from 'nodemailer'
import { env } from '../../config/env.js'

export const zohoTransport = nodemailer.createTransport({
  host: env.SMTP_HOST,

  /**
   * Use 587 for cloud hosting reliability
   */
  port: 587,

  /**
   * IMPORTANT:
   * secure MUST be false for port 587
   */
  secure: false,

  /**
   * Upgrade connection using STARTTLS
   */
  requireTLS: true,

  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },

  /**
   * Render + cloud SMTP stability
   */
  tls: {
    rejectUnauthorized: false,
  },

  /**
   * Increased timeouts for Render cold starts
   */
  connectionTimeout: 60000,
  greetingTimeout: 60000,
  socketTimeout: 60000,
})

/**
 * Verify transporter on startup
 * DOES NOT crash app
 */
zohoTransport.verify((error, success) => {
  if (error) {
    console.error('SMTP VERIFY ERROR:', error)
  } else {
    console.log('SMTP SERVER READY')
  }
})