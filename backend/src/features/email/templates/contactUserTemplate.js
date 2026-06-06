export function template(data = {}) {
  const {
    name = '',
    service = '',
    pricingPlan = '',
    message_summary = '',
    next_steps = '',
    response_time = '',
    support_email = '',
  } = data

  const logo = 'https://blevalinc.netlify.app/assets/bleval_logos/icon_200x200_dark.png'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .padding { padding: 15px !important; }
      .title { font-size: 18px !important; }
    }
  </style>
</head>

<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:30px 10px;">

      <table class="container" width="600" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:#0b5cff;text-align:center;padding:25px;">
            <img src="${logo}" width="60" style="margin-bottom:10px;border-radius:10px;" />
            <div style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:0.5px;">
              Bleval.inc
            </div>
            <div style="color:#dbe6ff;font-size:12px;margin-top:5px;">
              Digital Systems & Automation
            </div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td class="padding" style="padding:25px;">

            <div class="title" style="font-size:20px;font-weight:bold;color:#111827;margin-bottom:10px;">
              Thanks for reaching out${name ? `, ${name}` : ''} 👋
            </div>

            <div style="font-size:14px;color:#4b5563;line-height:1.6;margin-bottom:20px;">
              We have received your request and our team is currently reviewing it.
            </div>

            <!-- SUMMARY BOX -->
            <div style="background:#f7f9fc;border-left:5px solid #0b5cff;border-radius:10px;padding:15px;margin-bottom:20px;">

              <div style="font-weight:bold;margin-bottom:8px;color:#111827;">
                Contact Summary
              </div>

              <div style="font-size:13px;color:#374151;line-height:1.8;">
                <div><strong>Project Focus:</strong> ${service || '-'}</div>
                <div><strong>Pricing Plan:</strong> ${pricingPlan || '-'}</div>
              </div>

              <div style="margin-top:10px;">
                <div style="font-weight:bold;font-size:13px;margin-bottom:5px;">Project Details</div>
                <div style="font-size:13px;color:#374151;background:#ffffff;padding:10px;border-radius:8px;border:1px solid #e5e7eb;">
                  ${message_summary || 'No details provided'}
                </div>
              </div>

            </div>

            <!-- NEXT STEPS -->
            <div style="background:#eef5ff;padding:15px;border-radius:10px;margin-bottom:20px;">
              <div style="font-weight:bold;color:#0b5cff;margin-bottom:5px;">Next Steps</div>
              <div style="font-size:13px;color:#1f2937;line-height:1.6;">
                ${next_steps || 'We will review your request and respond shortly.'}
              </div>
            </div>

            <div style="font-size:13px;color:#374151;margin-bottom:5px;">
              <strong>Typical response time:</strong> ${response_time || '1–2 business days'}
            </div>

            <div style="font-size:13px;color:#374151;">
              Need urgent help? Contact:
              <a href="mailto:${support_email}" style="color:#0b5cff;text-decoration:none;">
                ${support_email}
              </a>
            </div>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0f172a;color:#cbd5e1;padding:20px;text-align:center;font-size:12px;">

            <div style="margin-bottom:8px;font-weight:bold;color:#ffffff;">
              Bleval.inc
            </div>

            <div style="margin-bottom:10px;">
              <a href="mailto:${support_email}" style="color:#93c5fd;text-decoration:none;margin-right:10px;">
                Contact
              </a>
              <a href="https://blevalinc.netlify.app" style="color:#93c5fd;text-decoration:none;">
                Website
              </a>
            </div>

            <div style="font-size:11px;color:#94a3b8;">
              © ${new Date().getFullYear()} Bleval.inc — All rights reserved
            </div>

          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
`
}