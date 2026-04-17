import { Worker } from 'bullmq'
import { Resend } from 'resend'
import { env } from '../config/env.js'

const resend = new Resend(env.RESEND_API_KEY)

const emailWorker = new Worker('email', async (job) => {
  const { name, data } = job

  if (name === 'user-confirmation') {
    await resend.emails.send({
      from: data.from,
      to:   data.to,
      subject: `We've received your message — ${data.clientName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2>Hi ${data.name},</h2>
          <p>Thanks for reaching out. We'll get back to you within 1–2 business days.</p>
          <blockquote style="border-left:3px solid #ddd;padding:12px 20px;color:#555">
            ${data.message}
          </blockquote>
          <p>— The ${data.clientName} Team</p>
        </div>
      `
    })
  }

  if (name === 'agency-notification') {
    await resend.emails.send({
      from: data.from,
      to:   data.to,
      subject: `New message from ${data.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2>New contact form submission</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p style="background:#f5f5f5;padding:16px;border-radius:6px">${data.message}</p>
        </div>
      `
    })
  }

  if (name === 'quote-send') {
    await resend.emails.send({
      from: data.from,
      to:   data.to,
      subject: `Your quote from ${data.clientName} — ${data.quote.quote_number}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2>Hi ${data.quote.contact_name},</h2>
          <p>Please find your quote <strong>${data.quote.quote_number}</strong> below.</p>
          <p><strong>Total: ${data.quote.currency} ${data.quote.total}</strong></p>
          <p>Valid until: ${data.quote.valid_until}</p>
          ${data.quote.notes ? `<p>${data.quote.notes}</p>` : ''}
          <p>Reply to this email to accept or ask any questions.</p>
          <p>— The ${data.clientName} Team</p>
        </div>
      `
    })
  }

  if (name === 'booking-confirmation') {
    await resend.emails.send({
      from: data.from,
      to:   data.to,
      subject: `Booking confirmed — ${data.service.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2>Hi ${data.booking.contact_name},</h2>
          <p>Your booking is confirmed.</p>
          <p><strong>Service:</strong> ${data.service.name}</p>
          <p><strong>Date & Time:</strong> ${new Date(data.booking.start_time).toLocaleString()}</p>
          <p>— The ${data.clientName} Team</p>
        </div>
      `
    })
  }

}, {
  connection: { url: env.REDIS_URL },
  concurrency: 5,
})

emailWorker.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err.message)
})

console.log('Worker running and waiting for jobs...')