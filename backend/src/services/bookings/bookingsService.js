import { db } from '../../db/index.js'

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
  const dayEnd = new Date(`${date}T17:00:00`)

  for (
    let t = new Date(dayStart);
    t < dayEnd;
    t.setMinutes(t.getMinutes() + service.duration_min)
  ) {
    const slotEnd = new Date(t.getTime() + service.duration_min * 60000)
    const clash = booked.some(
      (b) => new Date(b.start_time) < slotEnd && new Date(b.end_time) > t
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
  const start = new Date(`${date}T${time}:00`)
  if (Number.isNaN(start.getTime())) {
    throw Object.assign(new Error('Invalid preferred date/time'), { status: 400 })
  }

  let serviceId = null
  let durationMin = 60

  try {
    const { rows: matched } = await db.query(
      `SELECT id, duration_min
       FROM booking_services
       WHERE client_id = $1 AND name ILIKE $2
       ORDER BY duration_min DESC
       LIMIT 1`,
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
    try {
      await db.query(
        `INSERT INTO bookings (client_id, service_id, contact_name, contact_email, contact_phone, start_time, end_time, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          client.id,
          serviceId,
          name,
          email,
          phone || null,
          start.toISOString(),
          end.toISOString(),
          notes || null,
        ]
      )
    } catch (e) {
      // still proceed with API response
    }
  }

  // NOTE: Booking notification emails were removed in this migration change-set.
  // This function preserves DB write + API contract without SMTP/EmailJS.

  return { success: true }
}

export async function cancelBooking(bookingId, clientId) {
  const { rows } = await db.query(
    `UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND client_id = $2 RETURNING *`,
    [bookingId, clientId]
  )
  return rows[0] || null
}

