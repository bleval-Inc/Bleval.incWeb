import { db } from '../../db/index.js'
import { enrollInSequence } from './sequenceEnroll.js'

// Canonical onboarding pipeline stages
export const PIPELINE_STAGES = Object.freeze({
  new: 'new',
  onboarding_started: 'onboarding_started',
  qualified: 'qualified',
  onboarding_completed: 'onboarding_completed',
  consultation_booked: 'consultation_booked',
  proposal_sent: 'proposal_sent',
  deposit_pending: 'deposit_pending',
  deposit_paid: 'deposit_paid',
  active_client: 'active_client',
})

function safeJson(obj) {
  return JSON.parse(JSON.stringify(obj ?? {}))
}

function stageToLeadStatus(stage) {
  // Keep existing `leads.status` compatible with older admin filters.
  // Map pipeline stages into the broader lead lifecycle states.
  switch (stage) {
    case PIPELINE_STAGES.onboarding_started:
    case PIPELINE_STAGES.qualified:
    case PIPELINE_STAGES.onboarding_completed:
      return 'nurturing'
    case PIPELINE_STAGES.consultation_booked:
    case PIPELINE_STAGES.proposal_sent:
    case PIPELINE_STAGES.deposit_pending:
    case PIPELINE_STAGES.deposit_paid:
    case PIPELINE_STAGES.active_client:
      return 'converted'
    default:
      return 'new'
  }
}

async function getLeadByEmail({ clientId, email }) {
  const { rows } = await db.query(
    `SELECT * FROM leads WHERE client_id = $1 AND email = $2 ORDER BY created_at DESC LIMIT 1`,
    [clientId, email]
  )
  return rows[0] || null
}

export async function advanceLeadStageByLeadId({ client, leadId, stage, extra = {}, trigger }) {
  const validStages = new Set(Object.values(PIPELINE_STAGES))
  const nextStage = stage && validStages.has(stage) ? stage : null
  if (!nextStage) throw new Error(`Invalid stage: ${stage}`)

  const metaRes = await db.query(`SELECT metadata FROM leads WHERE id = $1 AND client_id = $2`, [leadId, client.id])
  const existingMeta = safeJson(metaRes.rows[0]?.metadata ?? {})

  const now = new Date().toISOString()

  const onboarding = existingMeta.onboarding ?? {}
  onboarding.stage = nextStage

  onboarding.history = Array.isArray(onboarding.history) ? onboarding.history : []
  onboarding.history.push({ stage: nextStage, at: now, ...extra })

  onboarding.updatedAt = now

  // analytics snapshot - minimal until we add separate table
  onboarding.analytics = onboarding.analytics ?? {}
  onboarding.analytics.lastStage = nextStage
  onboarding.analytics.lastStageAt = now

  const leadStatus = stageToLeadStatus(nextStage)

  await db.query(
    `UPDATE leads
     SET metadata = $1::jsonb,
         status = $2,
         updated_at = now()
     WHERE id = $3 AND client_id = $4`,
    [JSON.stringify(existingMeta), leadStatus, leadId, client.id]
  )

  // Enroll stage-based sequences (optional)
  if (trigger) {
    await enrollInSequence({ client, leadId, trigger })
  }

  return { ok: true, leadId, stage: nextStage }
}

export async function advanceLeadStage({ client, leadId = null, email = null, stage, extra = {}, trigger }) {
  let resolvedLeadId = leadId
  if (!resolvedLeadId && email) {
    const lead = await getLeadByEmail({ clientId: client.id, email })
    resolvedLeadId = lead?.id
  }
  if (!resolvedLeadId) throw new Error('Missing leadId/email for stage advancement')
  return advanceLeadStageByLeadId({ client, leadId: resolvedLeadId, stage, extra, trigger })
}

