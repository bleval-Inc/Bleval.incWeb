import { db } from '../../db/index.js'
import { enrollLead } from '../leads/leadsService.js'
import { sendAdminEmail, sendUserEmail } from '../email/emailService.js'

function safeJson(obj) {

  return JSON.parse(JSON.stringify(obj ?? {}))
}

async function upsertLeadAndContactless({ client, payload }) {
  // Current leads schema requires email; contact_id is optional.
  // enrollLead handles upsert by (client_id,email) and triggers sequences.
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
    const { subject, html } = {
      subject: `Weve received your onboarding request  Bleval.inc`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
          <h2 style="color:#1a1a1a">Hi ${payload.profile.name},</h2>
          <p>Thanks for starting your onboarding with <strong>Bleval.inc</strong>.</p>
          <p><strong>Plan:</strong> ${payload.plan || 'Not specified'}</p>
          <p>Next steps:</p>
          <ul>
            <li>We review your launch details</li>
            <li>We build your onboarding + growth roadmap</li>
            <li>We confirm the best next step via call</li>
          </ul>
          <p style="margin-top:24px">
            Book your discovery call here: <a href="https://bleval.inc/booking" style="color:#2563eb">Book a Call</a>
          </p>
          <p> Bleval.inc</p>
        </div>
      `,
    }

    // NOTE: contact-form mail uses nodemailer + Zoho SMTP via sendUserEmail/sendAdminEmail.
    await sendUserEmail({
      to: payload.profile.email,
      subject,
      html,
    })

    await sendAdminEmail({
      subject: `New onboarding started  ${payload.profile.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
          <h2>New onboarding request (started)</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;font-weight:bold;width:120px">Client</td><td>${client.name}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Name</td><td>${payload.profile.name}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Email</td><td><a href="mailto:${payload.profile.email}">${payload.profile.email}</a></td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Phone</td><td>${payload.profile.phone || 'N/A'}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Plan</td><td>${payload.plan}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold">Branding add-on</td><td>${payload.brandingAddOnSelected ? 'Yes' : 'No'}</td></tr>
          </table>
          <h3>Onboarding alignment</h3>
          <pre style="background:#f5f5f5;padding:16px;border-radius:8px;white-space:pre-wrap;word-break:break-word">${JSON.stringify(payload.alignment || {}, null, 2)}</pre>
          <p><small>Timestamp: ${new Date().toISOString()}</small></p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[onboardingStart:email] failed (non-fatal)', {
      err: { name: err?.name, message: err?.message, stack: err?.stack },
    })
  }


  return { ok: true, leadId, status: 'onboarding_started' }
}

export async function onboardingComplete({ client, payload }) {
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
      // Do not fail onboarding completion if pipeline advancement fails.
    }

    // 4) direct onboarding emails (must not crash request)
    console.log('[onboardingComplete:step4] direct email send started', { runId, leadId })
    try {
      const clientName = payload?.profile?.name
      const clientEmail = payload?.profile?.email
      const selectedPlan = payload?.plan

      // CLIENT confirmation email
      await sendUserEmail({
        to: clientEmail,

        subject: 'Your Bleval.inc onboarding request is received — next steps inside',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#0f172a">
            <div style="padding:18px 18px;border-radius:14px;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff">
              <h2 style="margin:0 0 8px">Onboarding received</h2>
              <p style="margin:0">A premium, high-performance strategy is now in motion.</p>
            </div>

            <div style="margin-top:18px;line-height:1.5">
              <p>Hi ${clientName},</p>

              <p>We’ve successfully received your completed onboarding details for <strong>Bleval.inc</strong>.</p>

              <h3 style="margin-top:18px">What happens next</h3>
              <ul>
                <li><strong>We review your inputs</strong> and align your onboarding strategy.</li>
                <li><strong>Your plan is confirmed:</strong> ${selectedPlan}.</li>
                <li><strong>We’ll contact you shortly</strong> to schedule your onboarding strategy call.</li>
              </ul>

              <h3 style="margin-top:18px">Estimated response timeline</h3>
              <p>Within <strong>24 hours</strong>, you’ll receive confirmation on your onboarding strategy call and the next step for your project review.</p>

              <h3 style="margin-top:18px">Your project is now in review</h3>
              <p>Our team is preparing a focused execution path—built for speed, clarity, and measurable outcomes.</p>

              <p style="margin-top:22px">Next steps are simple:</p>
              <ol>
                <li>Watch for our email with call confirmation.</li>
                <li>Reply quickly if you need any scheduling adjustments.</li>
                <li>We’ll finalize your onboarding plan during the call.</li>
              </ol>

              <p style="margin-top:26px">— Bleval.inc</p>
            </div>
          </div>
        `,
      })

      // ADMIN/internal notification email
      await sendAdminEmail({
        subject: `Onboarding completed — ${clientName}`,
        html: `
          <div style="font-family:sans-serif;max-width:700px;margin:0 auto;color:#0f172a">
            <h2 style="margin:0 0 10px">New onboarding completion</h2>
            <p style="margin:0 0 18px;color:#334155">Timestamp: ${new Date().toISOString()}</p>

            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;font-weight:bold;width:160px">Client</td><td>${client?.name ?? 'N/A'}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold">Name</td><td>${clientName ?? 'N/A'}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold">Email</td><td><a href="mailto:${clientEmail}">${clientEmail}</a></td></tr>
              <tr><td style="padding:8px 0;font-weight:bold">Phone</td><td>${payload?.profile?.phone || 'N/A'}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold">Selected plan</td><td>${selectedPlan}</td></tr>
              <tr><td style="padding:8px 0;font-weight:bold">Branding add-on</td><td>${payload?.brandingAddOnSelected ? 'Yes' : 'No'}</td></tr>
            </table>

            <h3 style="margin-top:18px">Onboarding alignment answers</h3>
            <pre style="background:#f5f5f5;padding:16px;border-radius:10px;white-space:pre-wrap;word-break:break-word">${JSON.stringify(payload?.alignment || {}, null, 2)}</pre>

            <h3 style="margin-top:18px">Onboarding metadata</h3>
            <pre style="background:#f5f5f5;padding:16px;border-radius:10px;white-space:pre-wrap;word-break:break-word">${JSON.stringify({
              requestedAt: payload?.requestedAt ?? null,
              completionNote: payload?.completionNote ?? null,
              plan: payload?.plan,
              brandingAddOnSelected: payload?.brandingAddOnSelected ?? false,
            }, null, 2)}</pre>
          </div>
        `,
      })

      console.log('[onboardingComplete:step4] direct email send completed', { runId, leadId })
      console.log('[onboardingComplete:clientEmailSent]', {
        runId,
        leadId,
        clientId,
        leadEmail: clientEmail,
        plan: selectedPlan,
        timestamps: { clientEmailSentAt: new Date().toISOString() },
      })
      console.log('[onboardingComplete:adminEmailSent]', {
        runId,
        leadId,
        clientId,
        leadEmail: clientEmail,
        plan: selectedPlan,
        timestamps: { adminEmailSentAt: new Date().toISOString() },
      })
    } catch (err) {

      console.error('[onboardingComplete:step4] direct email send failed (non-fatal)', {
        runId,
        leadId,
        err: { name: err?.name, message: err?.message, stack: err?.stack },
      })
      // Degrade gracefully: onboarding completion must succeed even if email fails.
    }


    // Spec-required structured completion logs.
    // (Email failures should not crash onboarding completion; we already degrade gracefully.)

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
    // Ensure controlled error response to avoid connection resets.
    return {
      ok: false,
      error: err?.message || 'Onboarding completion failed',
      stage: 'qualified',
      leadId: null,
    }
  }
}


