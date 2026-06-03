import { env } from '../../config/env.js'
import { sendEmail } from '../email/emailService.js'

function safe(v) {
  return v === null || v === undefined ? '' : v
}

function flattenContactAdminParams({ name, email, phone, company, service, pricingPlan, message, source, submittedAt }) {
  return {
    email_type: 'contact_admin',
    submission_type: safe(source),
    name: safe(name),
    email: safe(email),
    phone: safe(phone),
    company: safe(company),
    service: safe(service),
    pricing_plan: safe(pricingPlan),
    message: safe(message),
    source: safe(source),
    submitted_at: safe(submittedAt),
  }
}

function flattenContactUserParams({ name, service, pricingPlan, message, nextSteps, responseTime, supportEmail }) {
  const messageSummary = typeof message === 'string' ? message.slice(0, 800) : ''

  return {
    email_type: 'contact_user_confirmation',
    name: safe(name),
    selected_service: safe(service),
    pricing_plan: safe(pricingPlan),
    message_summary: messageSummary,
    next_steps: safe(nextSteps),
    response_time: safe(responseTime),
    support_email: safe(supportEmail),
  }
}

export async function submitContact({
  client,
  name,
  email,
  phone,
  company,
  service,
  pricingPlan,
  message,
  source = 'contact_form',
}) {
  console.log('CONTACT REQUEST RECEIVED')


  console.log('CONTACT PAYLOAD (safe):', {
    name,
    email,
    phone: phone || null,
    company: company || null,
    service: service || null,
    pricingPlan: pricingPlan || null,
    source,
    messageLength: message?.length,
  })

  if (!email) throw new Error('User email missing')

  const adminSubject = `New contact inquiry — ${name || 'Client'}`
  const userSubject = `Thanks for reaching out, ${name || 'there'} — next steps inside`

  // ADMIN EMAIL (non-blocking)

  try {
    await sendEmail({
      templateId: env.EMAILJS_ADMIN_TEMPLATE_ID,
      to: env.AGENCY_NOTIFY_EMAIL || env.ADMIN_EMAIL,
      subject: adminSubject,
      templateParams: {
        ...flattenContactAdminParams({
          name,
          email,
          phone,
          company,
          service,
          pricingPlan,
          message,
          source,
          submittedAt: new Date().toISOString(),
        }),
        // EmailJS template param used by some template variants
        to_email: email,
      },
    })

    console.log('CONTACT ADMIN EMAIL SENT')
  } catch (err) {
    console.error('[contactService] Admin email failed:', {
      status: err?.status,
      responseText: err?.responseText,
      message: err?.message,
    })
  }

  // USER CONFIRMATION EMAIL (non-blocking)
  try {
    await sendEmail({
      templateId: env.EMAILJS_USER_TEMPLATE_ID,
      to: email,
      subject: userSubject,
      templateParams: {
        ...flattenContactUserParams({
          name,
          service,
          pricingPlan,
          message,
          nextSteps: 'We will review your inquiry and respond by email. If we need clarification, we will reach out.',
          responseTime: '1–2 business days',
          supportEmail: env.AGENCY_NOTIFY_EMAIL || env.ADMIN_EMAIL || '',
        }),
      },

    })
    console.log('CONTACT USER EMAIL SENT')
  } catch (err) {
    console.error('[contactService] User email failed:', {
      status: err?.status,
      responseText: err?.responseText,
      message: err?.message,
    })
  }

  return {
    success: true,
    message: 'Contact form submitted successfully',
  }
}

