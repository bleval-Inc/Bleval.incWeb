import { db } from '../../db/index.js'

// Small isolated helper so pipeline stage code can enroll into the existing
// sequences system without importing leadsService (circular deps).
export async function enrollInSequence({ client, leadId, trigger }) {
  const { rows: sequences } = await db.query(
    `SELECT id FROM sequences WHERE client_id = $1 AND trigger = $2 AND active = true LIMIT 1`,
    [client.id, trigger]
  )
  if (!sequences.length) return { enrolled: false }

  const sequenceId = sequences[0].id

  const already = await db.query(
    `SELECT id FROM sequence_enrollments WHERE lead_id = $1 AND sequence_id = $2`,
    [leadId, sequenceId]
  )
  if (already.rows.length) return { enrolled: false }

  await db.query(
    `INSERT INTO sequence_enrollments (lead_id, sequence_id, current_step, status, next_send_at)
     VALUES ($1,$2,0,'active', now())`,
    [leadId, sequenceId]
  )

  return { enrolled: true, sequenceId }
}

