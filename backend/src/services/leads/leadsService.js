// leads generating code 
import { db } from '../../db/index.js'

export async function enrollLead({ client, name, email, source, contactId }) {
  const existing = await db.query(
    `SELECT id FROM leads WHERE client_id = $1 AND email = $2`,
    [client.id, email]
  )

  let leadId

  if (existing.rows.length > 0) {
    leadId = existing.rows[0].id
    await db.query(
      `UPDATE leads SET updated_at = now(), status = CASE WHEN status = 'lost' THEN 'new' ELSE status END WHERE id = $1`,
      [leadId]
    )
  } else {
    const { rows } = await db.query(
      `INSERT INTO leads (client_id, contact_id, email, name, source, status)
       VALUES ($1,$2,$3,$4,$5,'new') RETURNING id`,
      [client.id, contactId || null, email, name, source]
    )
    leadId = rows[0].id
  }

  await enrollInSequence({ client, leadId, trigger: source || 'contact_form' })
  return leadId
}

async function enrollInSequence({ client, leadId, trigger }) {
  const { rows: sequences } = await db.query(
    `SELECT id FROM sequences WHERE client_id = $1 AND trigger = $2 AND active = true LIMIT 1`,
    [client.id, trigger]
  )
  if (!sequences.length) return

  const sequenceId = sequences[0].id

  const already = await db.query(
    `SELECT id FROM sequence_enrollments WHERE lead_id = $1 AND sequence_id = $2`,
    [leadId, sequenceId]
  )
  if (already.rows.length) return

  await db.query(
    `INSERT INTO sequence_enrollments (lead_id, sequence_id, current_step, status, next_send_at)
     VALUES ($1,$2,0,'active', now())`,
    [leadId, sequenceId]
  )
}

export async function getLeads(clientId, status) {
  const params = [clientId]
  const filter = status ? `AND status = $2` : ''
  if (status) params.push(status)
  const { rows } = await db.query(
    `SELECT l.id, l.email, l.name, l.source, l.status, l.created_at,
            c.message as last_message
     FROM leads l
     LEFT JOIN contacts c ON c.id = l.contact_id
     WHERE l.client_id = $1 ${filter}
     ORDER BY l.created_at DESC`,
    params
  )
  return rows
}

export async function updateLeadStatus(leadId, clientId, status) {
  const { rows } = await db.query(
    `UPDATE leads SET status = $1, updated_at = now()
     WHERE id = $2 AND client_id = $3 RETURNING *`,
    [status, leadId, clientId]
  )
  return rows[0]
}
