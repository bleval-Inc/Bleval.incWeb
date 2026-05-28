import { env } from '../../config/env.js'

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send'

function safeString(value) {
  if (value === null || value === undefined) return ''
  return typeof value === 'string' ? value : String(value)
}

function sanitizeTemplateParams(templateParams) {
  // Avoid crashes from undefined; preserve keys.
  // Do NOT mutate caller object.
  const out = {}
  for (const [k, v] of Object.entries(templateParams ?? {})) {
    out[k] = v === undefined ? '' : v
  }
  return out
}

function logTemplateParams(templateParams) {
  // Safe logging: show keys + truncated values; never log secrets.
  const keys = Object.keys(templateParams ?? {})
  const preview = {}
  for (const k of keys.slice(0, 25)) {
    const v = templateParams[k]
    const s = typeof v === 'string' ? v : v === null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)
    preview[k] = s.length > 200 ? `${s.slice(0, 200)}…(truncated)` : s
  }
  return { keysCount: keys.length, keysSample: keys.slice(0, 25), preview }
}

/**
 * Generic reusable EmailJS sender.
 *
 * @param {Object} args
 * @param {string} args.templateId - EmailJS template id
 * @param {string} args.to - Recipient email address
 * @param {string} args.subject - Subject to embed in template params
 * @param {Object} args.templateParams - Dynamic template params
 */
export async function sendEmail({ templateId, to, subject, templateParams }) {
  const payload = {
    service_id: env.EMAILJS_SERVICE_ID,
    template_id: templateId,

    // EmailJS public key is sent as `user_id`
    user_id: env.EMAILJS_PUBLIC_KEY,

    // Required by your spec: accessToken (EmailJS private key)
    accessToken: env.EMAILJS_PRIVATE_KEY,

    template_params: sanitizeTemplateParams({
      subject: safeString(subject),
      to_email: safeString(to),
      email_type: '',
      ...(templateParams ?? {}),
    }),
  }


  // Required by your spec: template_params MUST include email_type.
  // If the caller forgets it, we still send an empty string instead of crashing.
  payload.template_params.email_type = safeString(payload.template_params.email_type)


  console.log('[emailService:sendEmail] sending EmailJS:', {
    service_id: payload.service_id,
    template_id: payload.template_id,
    to_email: payload.template_params.to_email,
    email_type: payload.template_params.email_type,
    template_params_log: logTemplateParams(payload.template_params),
  })

  try {
    const res = await fetch(EMAILJS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const responseText = await res.text().catch(() => '')

    if (!res.ok) {
      console.error('[emailService:emailjs] error:', {
        status: res.status,
        responseText,
      })

      const err = new Error(
        `EmailJS request failed with status ${res.status}: ${responseText}`
      )
      err.status = res.status
      err.responseText = responseText
      throw err
    }

    console.log('[emailService:emailjs] success')
    return responseText
  } catch (error) {
    console.error('[emailService:emailjs] fatal:', {
      message: error?.message,
      status: error?.status,
    })
    throw error
  }
}

