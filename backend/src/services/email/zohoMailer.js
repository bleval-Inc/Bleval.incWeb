import nodemailer from 'nodemailer'
import { env } from '../../config/env.js'

export const zohoTransport = nodemailer.createTransport({
  host: 'smtp.gmail.com',

  port: 587,

  secure: false,

  requireTLS: true,

  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },

  family: 4,

  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2',
  },

  connectionTimeout: 60000,
  greetingTimeout: 60000,
  socketTimeout: 60000,

  logger: true,
  debug: true,
})

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