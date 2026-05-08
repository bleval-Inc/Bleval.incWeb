import nodemailer from 'nodemailer'
import { env } from '../../config/env.js'

export const zohoTransport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: true, // true for 465
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
})

