export function userConfirmationEmail({ name, message }) {
  return {
    subject: `We've received your message — Bleval Inc`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#1a1a1a">Hi ${name},</h2>
        <p>Thanks for reaching out! We've received your message and will get back to you within 1–2 business days.</p>
        <blockquote style="border-left:3px solid #e0e0e0;padding:12px 20px;margin:20px 0;color:#555">
          ${message}
        </blockquote>
        <p>In the meantime, feel free to explore our work at <a href="https://bleval.inc">bleval.inc</a>.</p>
        <p>— The Bleval Team</p>
      </div>
    `
  }
}

export function agencyNotificationEmail({ name, email, phone, message, source }) {
  return {
    subject: `New contact form submission — ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <h2>New submission from ${name}</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;font-weight:bold;width:100px">Name</td><td>${name}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
          ${phone ? `<tr><td style="padding:8px 0;font-weight:bold">Phone</td><td>${phone}</td></tr>` : ''}
          <tr><td style="padding:8px 0;font-weight:bold">Source</td><td>${source}</td></tr>
        </table>
        <h3>Message</h3>
        <p style="background:#f5f5f5;padding:16px;border-radius:6px">${message}</p>
      </div>
    `
  }
}