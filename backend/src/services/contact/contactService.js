import { db } from '../../db/index.js'
import { emailQueue } from '../../queue/index.js'

export async function submitContact({ client, name, email, phone, message, source = 'contact_form' }) {
  // 1. Save to DB
  const { rows } = await db.query(
    `INSERT INTO contacts (client_id, name, email, phone, message, source)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [client.id, name, email, phone || null, message, source]
  )
  const contactId = rows[0].id

  // 2. Also upsert as a lead
  await db.query(
    `INSERT INTO leads (client_id, contact_id, email, name, source, status)
     VALUES ($1, $2, $3, $4, $5, 'new')
     ON CONFLICT (email) DO UPDATE SET updated_at = now()
     RETURNING id`,
    [client.id, contactId, email, name, source]
  ).catch(() => {}) // non-blocking, leads table may not have unique email yet

  // 3. Queue emails (async — don't block the response)
  await emailQueue.add('user-confirmation', {
    to: email,
    from: client.email.from,
    name,
    message,
  }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } })

  await emailQueue.add('agency-notification', {
    to: client.email.agency_notify,
    from: client.email.from,
    name, email, phone, message, source,
  }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } })

  return { id: contactId }
}