export function template(data = {}) {
  const {
    name = '',
    company = '',
    selected_plan = '',
    business_overview = '',
  } = data

  const logo = 'https://blevalinc.netlify.app/assets/bleval_logos/icon_200x200_dark.png'

  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%">
<tr>
<td align="center" style="padding:30px 10px">

<table width="600" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

<!-- HEADER -->
<tr>
  <td style="background:#0b5cff;text-align:center;padding:25px;">
    <img src="${logo}" width="60" style="border-radius:10px;margin-bottom:10px;" />
    <div style="color:#fff;font-size:18px;font-weight:bold;">
      Onboarding Started Successfully
    </div>
    <div style="color:#dbe6ff;font-size:12px;margin-top:5px;">
      Bleval.inc Client Experience
    </div>
  </td>
</tr>

<!-- BODY -->
<tr>
<td style="padding:25px;color:#111827;">

<div style="font-size:16px;font-weight:bold;margin-bottom:10px;">
  Thanks for starting onboarding, ${name} 👋
</div>

<div style="font-size:13px;color:#4b5563;margin-bottom:15px;">
  We’ve successfully received your onboarding details and our team is now preparing your strategy.
</div>

<!-- SUMMARY -->
<div style="background:#f7f9fc;border-left:4px solid #0b5cff;padding:15px;border-radius:10px;margin-bottom:15px;">
  <div><strong>Company:</strong> ${company}</div>
  <div><strong>Plan:</strong> ${selected_plan}</div>
</div>

<!-- BUSINESS OVERVIEW -->
<div style="background:#ffffff;border:1px solid #e5e7eb;padding:12px;border-radius:10px;margin-bottom:15px;">
  <strong>Overview</strong>
  <div style="margin-top:8px;color:#374151;">
    ${business_overview || 'No overview provided'}
  </div>
</div>

<!-- NEXT STEPS -->
<div style="background:#eef5ff;padding:15px;border-radius:10px;margin-bottom:15px;">

  <div style="font-weight:bold;color:#0b5cff;margin-bottom:10px;">
    Next Steps
  </div>

  <div style="font-size:13px;color:#1f2937;line-height:1.7;">

    <div>1️⃣ A Bleval strategist will review your submission</div>
    <div>2️⃣ We will prepare your custom growth roadmap</div>
    <div>3️⃣ You will receive a strategy call invite via email</div>
    <div>4️⃣ We align on execution & onboarding kickoff</div>

  </div>

</div>

<!-- TIMING -->
<div style="font-size:13px;color:#374151;">
  <strong>Expected Timeline:</strong><br/>
  2–5 business days depending on project load and complexity.
</div>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="background:#0f172a;color:#cbd5e1;text-align:center;padding:18px;font-size:11px;">

<div style="font-weight:bold;color:#fff;margin-bottom:5px;">Bleval.inc</div>

<div>Digital Systems & Automation Agency</div>

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