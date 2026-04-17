import { db } from '../../db/index.js'
import { emailQueue } from '../../queue/index.js'

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

export async function createBooking({ client, serviceId, contactName, contactEmail, contactPhone, startTime, notes }) {
  const { rows: [service] } = await db.query(
    `SELECT * FROM booking_services WHERE id = $1 AND client_id = $2`,
    [serviceId, client.id]
  )
  if (!service) throw Object.assign(new Error('Service not found'), { status: 404 })

  const start = new Date(startTime)
  const end   = new Date(start.getTime() + service.duration_min * 60000)

  const { rows } = await db.query(
    `INSERT INTO bookings (client_id, service_id, contact_name, contact_email, contact_phone, start_time, end_time, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [client.id, serviceId, contactName, contactEmail,
     contactPhone || null, start.toISOString(), end.toISOString(), notes || null]
  )
  const booking = rows[0]

  await emailQueue.add('booking-confirmation', {
    to:         contactEmail,
    from:       client.config.email?.from || 'hello@bleval.inc',
    booking,
    service,
    clientName: client.name,
  }, { attempts: 3 })

  await emailQueue.add('agency-notification', {
    to:         client.config.email?.agency_notify || 'team@bleval.inc',
    from:       client.config.email?.from || 'hello@bleval.inc',
    name:       contactName,
    email:      contactEmail,
    message:    `New booking: ${service.name} on ${start.toLocaleString()}`,
    clientName: client.name,
  }, { attempts: 3 })

  return booking
}

export async function cancelBooking(bookingId, clientId) {
  const { rows } = await db.query(
    `UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND client_id = $2 RETURNING *`,
    [bookingId, clientId]
  )
  return rows[0] || null
}