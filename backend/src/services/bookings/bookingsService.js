import { db } from '../../db/index.js'
import { sendAdminEmail, sendUserEmail } from '../email/emailService.js'


export async function getServices(clientId) {

  const { rows } = await db.query(
    `SELECT * FROM booking_services WHERE client_id = $1 ORDER BY name`,
    [clientId]
  )
  return rows
}

export async function getAvailableSlots(client, serviceId, date) {
  const { rows: booked } = await db.query(
    `SELECT start_time, end_time FROM bookings
     WHERE client_id = $1 AND service_id = $2
       AND start_time::date = $3::date
       AND status NOT IN ('cancelled')`,
    [client.id, serviceId, date]
  )

  const { rows: [service] } = await db.query(
    `SELECT * FROM booking_services WHERE id = $1 AND client_id = $2`,
    [serviceId, client.id]
  )
  if (!service) return []

  const slots = []
  const dayStart = new Date(`${date}T09:00:00`)
  const dayEnd   = new Date(`${date}T17:00:00`)

  for (let t = new Date(dayStart); t < dayEnd; t.setMinutes(t.getMinutes() + service.duration_min)) {
    const slotEnd = new Date(t.getTime() + service.duration_min * 60000)
    const clash   = booked.some(b =>
      new Date(b.start_time) < slotEnd && new Date(b.end_time) > t
    )
    if (!clash) slots.push(new Date(t).toISOString())
  }

  return slots
}

export async function createBooking({
  client,
  name,
  email,
  phone,
  service,
  date,
  time,
  notes,
  source = 'booking_modal',
}) {
  // Compose a datetime for DB storage (best-effort). Backend booking modal is now the source of truth.
  const start = new Date(`${date}T${time}:00`)
  if (Number.isNaN(start.getTime())) {
    throw Object.assign(new Error('Invalid preferred date/time'), { status: 400 })
  }

  // For DB we need a booking_services row; try to match by service name.
  // If no match exists, we still send emails but we fail gracefully for DB.
  let serviceId = null
  let durationMin = 60

  try {
    const { rows: matched } = await db.query(
      `SELECT id, duration_min FROM booking_services WHERE client_id = $1 AND name ILIKE $2 ORDER BY duration_min DESC LIMIT 1`,
      [client.id, service]
    )
    if (matched && matched[0]) {
      serviceId = matched[0].id
      durationMin = matched[0].duration_min ?? durationMin
    }
  } catch (e) {
    // ignore DB lookup failures for email stability
  }

  const end = new Date(start.getTime() + durationMin * 60000)

  if (serviceId) {
    // Insert booking record
    try {
      await db.query(
        `INSERT INTO bookings (client_id, service_id, contact_name, contact_email, contact_phone, start_time, end_time, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [client.id, serviceId, name, email, phone || null, start.toISOString(), end.toISOString(), notes || null]
      )
    } catch (e) {
      // still proceed with emails
    }
  }

  // 1) ADMIN booking notification
  await sendAdminEmail({
    subject: 'New Booking Request — Bleval Inc',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
        <h2 style="margin:0 0 12px">New Booking Request</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;font-weight:bold;width:120px">Name</td><td>${name}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 0;font-weight:bold">Phone</td><td>${phone || 'N/A'}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold">Service</td><td>${service}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold">Date</td><td>${date}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold">Time</td><td>${time}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold">Source</td><td>${source}</td></tr>
        </table>
        ${notes ? `<h3 style="margin-top:18px">Notes</h3><div style="background:#f5f5f5;padding:16px;border-radius:8px">${notes}</div>` : ''}
      </div>
    `,
  })

  // 2) USER confirmation
  await sendUserEmail({
    to: email,
    subject: 'Booking Request Received — Bleval Inc',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
        <h2 style="color:#1a1a1a;margin-top:0">Hi ${name},</h2>

        <p style="margin:0 0 12px">
          Thanks for booking with <strong>Bleval Inc</strong> — we’ve received your request and our team will be in touch shortly.
        </p>

        <h3 style="margin:18px 0 8px">Your Request</h3>
        <div style="background:#f5f5f5;padding:16px;border-radius:10px">
          <p style="margin:0 0 8px"><strong>Service:</strong> ${service}</p>
          <p style="margin:0 0 8px"><strong>Date:</strong> ${date}</p>
          <p style="margin:0 0 8px"><strong>Time:</strong> ${time}</p>
          ${notes ? `<p style="margin:0"><strong>Notes:</strong> ${notes}</p>` : ''}
        </div>

        <h3 style="margin:18px 0 8px">Next Steps</h3>
        <ul style="padding-left:20px;margin-top:0;color:#333">
          <li>We will review your request.</li>
          <li>We’ll confirm availability by email and/or phone.</li>
          <li>If anything needs clarification, we’ll reach out.</li>
        </ul>

        <p style="margin-top:18px">Thank you again — we look forward to working with you.</p>
        <p style="margin-top:8px">— The Bleval Team</p>
      </div>
    `,
  })

  return { success: true }
}


export async function cancelBooking(bookingId, clientId) {
  const { rows } = await db.query(
    `UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND client_id = $2 RETURNING *`,
    [bookingId, clientId]
  )
  return rows[0] || null
}