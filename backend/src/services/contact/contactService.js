import { sendAdminEmail, sendUserEmail } from '../email/emailService.js'
import { env } from '../../config/env.js'

export async function submitContact({
  client,
  name,
  email,
  phone,
  service,
  message,
  source = 'contact_form',
}) {
  console.log('CONTACT REQUEST RECEIVED')

  // Safe-ish debug logs (avoid dumping full message)
  console.log('CONTACT PAYLOAD (safe):', {
    name,
    email,
    phone: phone || null,
    service: service || null,
    source,
    messageLength: message?.length,
  })

  if (!email) {
    throw new Error('User email missing')
  }

  // ADMIN EMAIL
  console.log('Sending admin email...')
  console.log('ADMIN EMAIL:', env.ADMIN_EMAIL)

  try {
    await sendAdminEmail({
      subject: 'New Contact Form Submission',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
          <h2>New Contact Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Service:</strong> ${service || 'General Inquiry'}</p>
          <p><strong>Source:</strong> ${source}</p>
          <h3>Message</h3>
          <div style="padding:16px;background:#f5f5f5;border-radius:8px">
            ${message}
          </div>
        </div>
      `,
    })
    console.log('Admin email sent')
  } catch (err) {
    console.error('Admin email failed:', err)
    throw err
  }

  // USER EMAIL
  console.log('Sending user confirmation...')
  console.log('USER EMAIL:', email)

  try {
    await sendUserEmail({
      to: email,
      subject: 'We’ve received your request — Bleval.inc',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
          <h2>Hi ${name},</h2>
          <p>We’ve received your request successfully.</p>
          <p>Our team will review your message and get back to you within 24 hours.</p>
          <h3>Your Submission</h3>
          <p><strong>Service:</strong> ${service || 'General Inquiry'}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Message:</strong></p>
          <div style="padding:16px;background:#f5f5f5;border-radius:8px">
            ${message}
          </div>

          <p style="margin-top:24px">
            Next steps: Our team will review your request and get back to you shortly.
          </p>
          <p>— Bleval.inc</p>

        </div>
      `,
    })
    console.log('User email sent')
  } catch (err) {
    console.error('User email failed:', err)
    throw err
  }

  console.log('CONTACT FORM SUCCESS')
  return { success: true }
}



