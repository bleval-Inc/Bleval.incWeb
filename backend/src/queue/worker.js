import { Worker } from 'bullmq'
import { Resend } from 'resend'
import { env } from '../config/env.js'

const resend = new Resend(env.RESEND_API_KEY)

const emailWorker = new Worker('email', async (job) => {
  console.log('WORKER PROCESSING JOB', job?.name, job?.id)
  const { name, data } = job

  if (name === 'user-confirmation') {
    console.log('RESEND SEND START: user-confirmation')
    const result = await resend.emails.send({
      from: data.from,
      to:   data.to,
      subject: `We’ve received your request — Bleval.inc`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          <h2 style="color:#1a1a1a">Hi ${data.name},</h2>
          <p>We’ve received your request and will respond within 24 hours.</p>
          <p>Here’s what happens next:</p>
          <ul>
            <li>We review your requirements</li>
            <li>We prepare a tailored response or quote</li>
            <li>We guide you to the best next step</li>
          </ul>
          <p>If urgent, you can book a call here:</p>
          <p><a href="https://bleval.inc/booking" style="color:#2563eb">Book a Call</a></p>
          <p>— Bleval.inc</p>
        </div>
      `
    })  
    console.log('RESEND RESPONSE:', result)
  }

  if (name === 'agency-notification') {
    console.log('RESEND SEND START: agency-notification')
    const result = await resend.emails.send({
      from: data.from,
      to:   data.to,
      // This job is used for both contact + booking.
      // Detect booking by presence of date/time fields.
      subject: data.date ? `New Booking Scheduled` : `New Contact Form Submission`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          ${data.date ? `
            <h2 style="color:#1a1a1a">New booking request</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.time || ''}</p>
            <p><strong>Notes:</strong></p>
            <p style="background:#f5f5f5;padding:16px;border-radius:6px">${data.notes || ''}</p>
          ` : `
            <h2 style="color:#1a1a1a">New inquiry received</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            ${data.service ? `<p><strong>Service:</strong> ${data.service}</p>` : ''}
            <p><strong>Message:</strong></p>
            <p style="background:#f5f5f5;padding:16px;border-radius:6px">${data.message}</p>
          `}
        </div>
      `
    })
    console.log('RESEND RESPONSE:', result)
  }

  if (name === 'quote-send') {
    console.log('RESEND SEND START: quote-send')
    const result = await resend.emails.send({
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
    console.log('RESEND RESPONSE:', result)
  }

  if (name === 'booking-confirmation') {
    console.log('RESEND SEND START: booking-confirmation')
    const result = await resend.emails.send({
      from: data.from,
      to:   data.to,
      subject: `Your call request is received — Bleval.inc`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          <h2 style="color:#1a1a1a">Hi ${data.booking.contact_name},</h2>
          <p>Your booking request has been received.</p>
          <p><strong>Requested slot:</strong></p>
          <p>
            ${data.date || new Date(data.booking.start_time).toISOString().slice(0,10)} at 
            ${data.time || new Date(data.booking.start_time).toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'})}
          </p>
          <p>We’ll confirm shortly via email.</p>
          <p>If anything changes, reply to this email.</p>
          <p>— Bleval.inc</p>
        </div>
      `
    })
    console.log('RESEND RESPONSE:', result)
  }

}, {
  connection: {
  url: env.REDIS_URL,
  maxRetriesPerRequest: null,
} })

emailWorker.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err.message)
})

console.log('Worker running and waiting for jobs...')