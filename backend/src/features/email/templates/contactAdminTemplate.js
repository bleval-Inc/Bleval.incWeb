export function template(data = {}) {
  const {
    name = '',
    email = '',
    phone = '',
    company = '',
    service = '',
    pricingPlan = '',
    message = '',
    source = '',
    submitted_at = '',
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
    }
  </style>
</head>

<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%">
  <tr>
    <td align="center" style="padding:25px;">

      <table class="container" width="650" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 25px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:#111827;text-align:center;padding:25px;">
            <img src="${logo}" width="60" style="margin-bottom:8px;border-radius:10px;" />
            <div style="color:#ffffff;font-size:18px;font-weight:bold;">
              New Contact Submission
            </div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:25px;font-size:13px;color:#111827;">

            <div style="margin-bottom:15px;">
              <strong>Name:</strong> ${name}
            </div>

            <div style="margin-bottom:15px;">
              <strong>Email:</strong> ${email}
            </div>

            <div style="margin-bottom:15px;">
              <strong>Phone:</strong> ${phone || '-'}
            </div>

            <div style="margin-bottom:15px;">
              <strong>Company:</strong> ${company || '-'}
            </div>

            <div style="margin-bottom:15px;">
              <strong>Service:</strong> ${service} — ${pricingPlan || '-'}
            </div>

            <div style="margin-bottom:15px;">
              <strong>Source:</strong> ${source || '-'}
            </div>

            <div style="margin-bottom:20px;">
              <strong>Submitted At:</strong> ${submitted_at}
            </div>

            <!-- MESSAGE BOX -->
            <div style="border-left:4px solid #111827;background:#f9fafb;padding:15px;border-radius:10px;">
              <div style="font-weight:bold;margin-bottom:8px;">Summary</div>
              <div style="line-height:1.6;color:#374151;">
                ${message}
              </div>
            </div>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0f172a;color:#cbd5e1;padding:15px;text-align:center;font-size:11px;">
            Internal Bleval.inc Notification System
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