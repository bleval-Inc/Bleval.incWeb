import { zohoTransport } from './zohoMailer.js'

export async function sendAdminEmail({ subject, html }) {
  const { env } = await import('../../config/env.js')

  return zohoTransport.sendMail({
    from: `Bleval Inc <${env.FROM_EMAIL}>`,
    to: env.ADMIN_EMAIL,
    subject,
    html,
  })
}

export async function sendUserEmail({ to, subject, html }) {
  const { env } = await import('../../config/env.js')

  return zohoTransport.sendMail({
    from: `Bleval Inc <${env.FROM_EMAIL}>`,
    to,
    subject,
    html,
  })
}

