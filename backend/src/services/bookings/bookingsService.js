import { db } from '../../db/index.js'
import { emailQueue } from '../../queue/index.js'

export async function getAvailableSlots(client, serviceId, date) {
  // Get booked slots for that day
  const { rows: booked } = await db.query(
    `SELECT start_time, end_time FROM bookings
     WHERE client_id = $1 AND service_id = $2
       AND start_time::date = $3::date
       AND status NOT IN ('cancelled')`,
    [client.id, serviceId, date]
  )

  // Get service duration
  const { rows: [service] } = await db.query(
    `SELECT duration_min FROM booking_services WHERE id = $1 AND client_id = $2`,
    [serviceId, client.id]
  )
  if (!service) return []

  // Generate 9am–5pm slots and filter out booked ones
  const slots = []
  const start = new Date(`${date}T09:00:00`)
  const end   = new Date(`${date}T17:00:00`)

  for (let t = new Date(start); t < end; t.setMinutes(t.getMinutes() + service.duration_min)) {
    const slotEnd = new Date(t.getTime() + service.duration_min * 60000)
    const clash = booked.some(b =>
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
    [client.id, serviceId, contactName, contactEmail, contactPhone || null, start.toISOString(), end.toISOString(), notes || null]
  )
  const booking = rows[0]

  // Queue confirmation email
  await emailQueue.add('booking-confirmation', {
    to: contactEmail,
    from: client.email.from,
    booking, service,
    clientName: client.name,
  }, { attempts: 3 })

  // Also notify agency
  await emailQueue.add('booking-agency-notify', {
    to: client.email.agency_notify,
    from: client.email.from,
    booking, service, contactName, contactEmail,
  }, { attempts: 3 })

  return booking
}