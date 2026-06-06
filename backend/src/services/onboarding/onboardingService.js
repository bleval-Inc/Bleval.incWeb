import { db } from '../../db/index.js'
import { enrollLead } from '../leads/leadsService.js'
import { env } from '../../config/env.js'
import { sendEmail } from '../../features/email/emailService.js'


function safeJson(obj) {
  return JSON.parse(JSON.stringify(obj ?? {}))
}

async function upsertLeadAndContactless({ client, payload }) {
  const leadId = await enrollLead({
    client,
    name: payload.profile.name,
    email: payload.profile.email,
    source: 'onboarding',
    contactId: null,
  })

  return leadId
}

async function persistOnboardingMeta({ clientId, leadId, payload, stage, extra = {} }) {
  const now = new Date().toISOString()

  const existingRes = await db.query(
    `SELECT metadata FROM leads WHERE id = $1 AND client_id = $2`,
    [leadId, clientId],
  )
  const existing = existingRes.rows[0]?.metadata ?? {}

  const meta = safeJson(existing)
  meta.onboarding = meta.onboarding ?? {}
  meta.onboarding.plan = payload.plan
  meta.onboarding.brandingAddOnSelected = !!payload.brandingAddOnSelected

  meta.onboarding.profile = {
    name: payload.profile.name,
    company: payload.profile.company ?? null,
    email: payload.profile.email,
    phone: payload.profile.phone ?? null,
    industry: payload.profile.industry ?? null,
    location: payload.profile.location ?? null,
  }

  meta.onboarding.alignment = payload.alignment ?? meta.onboarding.alignment ?? {}
  meta.onboarding.stage = stage
  meta.onboarding.updatedAt = now

  meta.onboarding.history = Array.isArray(meta.onboarding.history) ? meta.onboarding.history : []
  meta.onboarding.history.push({ stage, at: now, ...extra })

  await db.query(
    `UPDATE leads
     SET metadata = $1::jsonb, updated_at = now(), status = $2
     WHERE id = $3 AND client_id = $4`,
    [JSON.stringify(meta), stage, leadId, clientId],
  )
}

export async function onboardingStart({ client, payload }) {
  const leadId = await upsertLeadAndContactless({ client, payload })

  await persistOnboardingMeta({
    clientId: client.id,
    leadId,
    payload,
    stage: 'onboarding_started',
    extra: { requestedAt: payload.requestedAt ?? null },
  })

  // Premium pipeline stage update (also keeps leads.status aligned)
  const { advanceLeadStage } = await import('../leads/leadPipeline.js')
  await advanceLeadStage({
    client,
    leadId,
    stage: 'onboarding_started',
    extra: { requestedAt: payload.requestedAt ?? null, plan: payload.plan },
    trigger: 'onboarding_started',
  })

  // Non-blocking email: do not break onboarding start if email fails.
  try {
    const toEmail = payload?.profile?.email
    const subject = `Weve received your onboarding request  Bleval.inc`

    const profile = payload?.profile ?? {}
    const alignment = payload?.alignment ?? {}

    const adminTemplateParams = {
      email_type: 'onboarding_admin_started',

      // Profile
      profile_name: profile?.name ?? '',
      profile_company: profile?.company ?? '',
      profile_email: profile?.email ?? '',
      profile_phone: profile?.phone ?? '',
      profile_industry: profile?.industry ?? '',
      profile_location: profile?.location ?? '',

      // Business overview
      business_overview: alignment?.businessOverview ?? '',
      target_audience: alignment?.targetAudience ?? '',
      competitors: alignment?.competitors ?? '',
      design_direction: alignment?.designDirection ?? '',

      assets: alignment?.currentAssets ?? '',
      project_goals: alignment?.projectGoals ?? '',
      content_readiness: alignment?.contentReadiness ?? '',
      special_requirements: alignment?.specialRequirements ?? '',

      selected_plan: payload?.plan ?? '',
      branding_addon: payload?.brandingAddOnSelected ? 'Yes' : 'No',
      pricing: payload?.pricing ?? '',
      requested_at: payload?.requestedAt ?? '',

      // For template completeness (safe defaults)
      pricing_info: payload?.pricing ?? '',
      onboarding_status: 'started',
    }

    const userTemplateParams = {
      email_type: 'onboarding_user_confirmation_started',

      name: profile?.name ?? '',
      selected_plan: payload?.plan ?? '',
      business_summary: alignment?.businessOverview ?? '',
      next_steps: 'You are booked for the next phase. Our team will review your inputs and follow up with scheduling details.',
      onboarding_timeline: 'Typical kickoff occurs within 2–5 business days after submission.',
      strategy_call_expectation: 'You will receive an email with scheduling options for your strategy call.',
    }

    // Admin email (full submission details)
    await sendEmail({
      to: env.ADMIN_EMAIL,
      subject: `New onboarding started ǀ ${payload?.profile?.name ?? ''}`,
      templateKey: 'onboarding-admin',
      data: {
        profile_name: profile?.name ?? '',
        profile_email: profile?.email ?? '',
        selected_plan: payload?.plan ?? '',
        business_overview: alignment?.businessOverview ?? '',
        // include remaining adminTemplateParams for completeness
        ...adminTemplateParams,
      },
    })

    // User confirmation email
    await sendEmail({
      to: toEmail,
      subject,
      templateKey: 'onboarding-user',
      data: {
        name: profile?.name ?? '',
        selected_plan: payload?.plan ?? '',
        next_steps: 'You are booked for the next phase. Our team will review your inputs and follow up with scheduling details.',
        onboarding_timeline: 'Typical kickoff occurs within 2–5 business days after submission.',
        ...userTemplateParams,
      },
    })


  } catch (err) {
    console.error('[onboardingStart:email] failed (non-fatal)', {
      err: { name: err?.name, message: err?.message, stack: err?.stack },
    })
  }

  return { ok: true, leadId, status: 'onboarding_started' }
}

export async function onboardingComplete({ client, payload }) {
  const toEmail = payload?.profile?.email

  const runId = `onb_complete_${Date.now()}_${Math.random().toString(16).slice(2)}`
  const clientId = client?.id ?? null
  const email = payload?.profile?.email ?? null
  const leadSnapshot = {
    runId,
    clientId,
    clientDomain: client?.domain ?? null,
    leadEmail: email,
    plan: payload?.plan,
    requestedAt: payload?.requestedAt ?? null,
    hasCompletionNote: typeof payload?.completionNote === 'string',
  }

  console.log('[onboardingComplete:enter]', leadSnapshot)

  try {
    // 1) lead upsert
    let leadId
    console.log('[onboardingComplete:step1] lead upsert started', { runId })
    leadId = await upsertLeadAndContactless({ client, payload })
    console.log('[onboardingComplete:step1] lead upsert completed', { runId, leadId })

    // 2) persist metadata
    console.log('[onboardingComplete:step2] metadata persistence started', { runId, leadId })
    await persistOnboardingMeta({
      clientId,
      leadId,
      payload,
      stage: 'qualified',
      extra: {
        requestedAt: payload.requestedAt ?? null,
        completionNote: payload.completionNote ?? null,
      },
    })
    console.log('[onboardingComplete:step2] metadata persistence completed', { runId, leadId })


    // 3) pipeline stage advancement
    console.log('[onboardingComplete:step3] pipeline advancement started', { runId, leadId })
    try {
      const { advanceLeadStage } = await import('../leads/leadPipeline.js')
      await advanceLeadStage({
        client,
        leadId,
        stage: 'qualified',
        extra: {
          requestedAt: payload.requestedAt ?? null,
          completionNote: payload.completionNote ?? null,
          plan: payload.plan,
        },
        trigger: 'qualified',
      })
      console.log('[onboardingComplete:step3] pipeline advancement completed', { runId, leadId })
    } catch (err) {
      console.error('[onboardingComplete:step3] pipeline advancement failed (non-fatal)', {
        runId,
        leadId,
        err: { name: err?.name, message: err?.message, stack: err?.stack },
      })
    }

    // 4) direct onboarding emails (must not crash request)
    // EmailJS now uses 2 templates + template_params; no inline html.
    console.log('[onboardingComplete:step4] direct email send started', { runId, leadId })
    try {
      const toUser = payload?.profile?.email
      const clientName = payload?.profile?.name ?? ''

      const profile = payload?.profile ?? {}
      const alignment = payload?.alignment ?? {}

      const adminTemplateParamsCompleted = {
        email_type: 'onboarding_admin_completed',

        // Profile
        profile_name: profile?.name ?? '',
        profile_company: profile?.company ?? '',
        profile_email: profile?.email ?? '',
        profile_phone: profile?.phone ?? '',
        profile_industry: profile?.industry ?? '',
        profile_location: profile?.location ?? '',

        // Business overview / target
        business_overview: alignment?.businessOverview ?? '',
        target_audience: alignment?.targetAudience ?? '',
        competitors: alignment?.competitors ?? '',
        design_direction: alignment?.designDirection ?? '',

        // Assets / goals / readiness
        assets: alignment?.currentAssets ?? '',
        project_goals: alignment?.projectGoals ?? '',
        content_readiness: alignment?.contentReadiness ?? '',
        special_requirements: alignment?.specialRequirements ?? '',

        // Plan / pricing / branding
        selected_plan: payload?.plan ?? '',
        branding_addon: payload?.brandingAddOnSelected ? 'Yes' : 'No',
        pricing: payload?.pricing ?? '',
        requested_at: payload?.requestedAt ?? '',

        // Safety defaults
        pricing_info: payload?.pricing ?? '',
        onboarding_status: 'completed',
      }

      const userTemplateParamsCompleted = {
        email_type: 'onboarding_user_confirmation_completed',
        name: profile?.name ?? '',
        selected_plan: payload?.plan ?? '',
        business_summary: alignment?.businessOverview ?? '',
        next_steps: 'Next steps: a Bleval strategist will review your inputs and schedule your strategy call. You’ll receive confirmation and timing by email.',
        onboarding_timeline: 'Expect scheduling within 2–5 business days after your submission (timing may vary by volume).',
        strategy_call_expectation: 'You will receive an email with available times for your strategy call. Reply to confirm your preferred slot.',
      }

      await sendEmail({
        to: env.ADMIN_EMAIL,
        subject: `Onboarding completed — ${clientName}`,
        templateKey: 'onboarding-admin',
        data: {
          ...adminTemplateParamsCompleted,
        },
      })

      await sendEmail({
        to: toUser,
        subject: 'Your Bleval.inc onboarding request is received — next steps inside',
        templateKey: 'onboarding-user',
        data: {
          ...userTemplateParamsCompleted,
        },
      })


      console.log('[onboardingComplete:step4] direct email send completed', { runId, leadId })
    } catch (err) {
      console.error('[onboardingComplete:step4] direct email send failed (non-fatal)', {
        runId,
        leadId,
        err: { name: err?.name, message: err?.message, stack: err?.stack },
      })
    }


    console.log('[onboardingComplete:success]', {
      runId,
      leadId,
      clientId,
      leadEmail: leadSnapshot.leadEmail,
      plan: leadSnapshot.plan,
      clientName: payload?.profile?.name ?? null,
      timestamps: { completedAt: new Date().toISOString() },
    })

    console.log('[onboardingComplete:responseReturned]', {
      runId,
      leadId,
      clientId,
      leadEmail: leadSnapshot.leadEmail,
      plan: leadSnapshot.plan,
      timestamps: { responseReturnedAt: new Date().toISOString() },
    })

    return {
      ok: true,
      onboardingCompleted: true,
      emailsSent: true,
      leadId,
      status: 'qualified',
      message: 'Onboarding completed successfully',
    }
  } catch (err) {
    console.error('[onboardingComplete:fatal] onboardingComplete crashed', {
      runId,
      clientId,
      leadSnapshot,
      err: { name: err?.name, message: err?.message, stack: err?.stack },
    })

    return {
      ok: false,
      error: err?.message || 'Onboarding completion failed',
      stage: 'qualified',
      leadId: null,
    }
  }
}

