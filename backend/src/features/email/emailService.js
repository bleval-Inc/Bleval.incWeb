import { transporter } from './emailConfig.js'
import { getTemplate } from './templateService.js'
import { env } from '../../config/env.js'

export async function sendEmail({ to, subject, templateKey, data = {} }) {
  const from = env.FROM_EMAIL || env.AGENCY_FROM_EMAIL || `noreply@${env.AGENCY_DOMAIN || 'bleval.inc'}`

  const html = getTemplate(templateKey, data)

  const mailOptions = {
    from,
    to,
    subject: subject || 'Message from Bleval.inc',
    html,
  }

  console.log('[emailService] sending email', { to, subject, templateKey })

  try {
    const res = await transporter.sendMail(mailOptions)
    console.log('[emailService] sent', { messageId: res.messageId })
    return res
  } catch (err) {
    console.error('[emailService] send failed', { to, subject, templateKey, message: err?.message })
    throw err
  }
}

export default sendEmail
