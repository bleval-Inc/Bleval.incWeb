import { db } from '../../db/index.js'
import { env } from '../../config/env.js'

export async function getServices(clientId) {
  const { rows } = await db.query(
    `SELECT * FROM booking_services WHERE client_id = $1 ORDER BY name`,
    [clientId]
  )
  return rows
}

// Lead-only booking refactor: no scheduling, no availability, no start/end times.
export async function createBooking({
  client,
  name,
  email,
  phone,
  service,
  message,
  source = 'booking_form',
}) {
  const safe = (v) => (v === null || v === undefined ? '' : String(v))

  const clean = {
    name: safe(name),
    email: safe(email),
    phone: safe(phone),
    service: safe(service),
    message: safe(message),
    source: safe(source),
  }

  console.log('BOOKING REQUEST RECEIVED')
  console.log('BOOKING PAYLOAD (safe):', {
    client: client?.id ?? null,
    name: clean.name,
    email: clean.email,
    phone: clean.phone || null,
    service: clean.service,
    source: clean.source,
    messageLength: clean.message?.length ?? 0,
  })

  // Preferred DB logic for lead capture: store inquiry as a contact (lead).
  // No fake start/end times.
  console.log('STEP 2: starting booking insert (contacts)')
  try {
    await db.query(
      `INSERT INTO contacts (client_id, name, email, phone, message, source)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [client.id, clean.name, clean.email, clean.phone || null, clean.message, clean.source || 'booking_form']
    )
    console.log('STEP 3: booking insert complete (contacts)')
  } catch (err) {
    console.error('STEP 3b: booking insert failed (FULL ERROR):', err)
  }


  // EMAILS — direct send (no queues)
  // Must match Contact + Onboarding architecture: use sendEmail(), nodemailer transporter, Brevo SMTP, and templates.
  try {
    const { sendEmail } = await import('../../features/email/emailService.js')

    const adminTo = env?.AGENCY_NOTIFY_EMAIL || env?.ADMIN_EMAIL
    const submittedAt = new Date().toISOString()

    console.log('STEP 4: sending admin email (direct)')
    await sendEmail({
      to: adminTo,
      subject: `New Booking Request — ${clean.name}`,
      templateKey: 'booking-admin',
      data: {
        name: clean.name,
        email: clean.email,
        phone: clean.phone || null,
        service: clean.service,
        message: clean.message,
        source: clean.source,
        submittedAt,
      },
    })
    console.log('STEP 5: admin email sent')

    console.log('STEP 6: sending user email (direct)')
    await sendEmail({
      to: clean.email,
      subject: `Booking Request Received — ${clean.name}`,
      templateKey: 'booking-user',
      data: {
        name: clean.name,
        service: clean.service,
        message: clean.message,
      },
    })
    console.log('STEP 7: user email sent')

    console.log('STEP 8: booking flow complete (emails sent)')
  } catch (e) {
    console.error('[booking direct email error] FULL ERROR:', e)
  }

  return { success: true }
}

// Keep existing cancel endpoint (master key) unchanged; not part of lead qualification flow.
export async function cancelBooking(bookingId, clientId) {
  const { rows } = await db.query(
    `UPDATE bookings SET status = 'cancelled'
     WHERE id = $1 AND client_id = $2
     RETURNING *`,
    [bookingId, clientId]
  )

  return rows[0] || null
}


