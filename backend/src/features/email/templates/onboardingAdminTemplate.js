export function template(data = {}) {
  const {
    name = '',
    company = '',
    email = '',
    phone = '',
    industry = '',
    location = '',
    business_overview = '',
    target_audience = '',
    competitors = '',
    design_direction = '',
    assets = '',
    project_goals = '',
    content_readiness = '',
    special_requirements = '',
    brand_addon = '',

    plan = '',
    total_investment = '',
    monthly_subscription = '',
  } = data

  const logo = 'https://blevalinc.netlify.app/assets/bleval_logos/icon_200x200_dark.png'

  const safe = (v) => (v === null || v === undefined || v === '' ? '-' : v)

  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%">
<tr>
<td align="center" style="padding:25px">

<table width="700" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">

<!-- HEADER -->
<tr>
  <td style="background:#0b5cff;text-align:center;padding:25px;">
    <img src="${logo}" width="60" style="border-radius:10px;margin-bottom:10px;" />
    <div style="color:#fff;font-size:18px;font-weight:bold;">
      New Onboarding Submission
    </div>
  </td>
</tr>

<!-- BODY -->
<tr>
<td style="padding:25px;font-size:13px;color:#111827;line-height:1.6;">

<!-- CLIENT INFO -->
<div style="margin-bottom:15px;">
  <div><strong>Name:</strong> ${safe(name)}</div>
  <div><strong>Company:</strong> ${safe(company)}</div>
  <div><strong>Email:</strong> ${safe(email)}</div>
  <div><strong>Phone:</strong> ${safe(phone)}</div>
  <div><strong>Industry:</strong> ${safe(industry)}</div>
  <div><strong>Location:</strong> ${safe(location)}</div>
</div>

<!-- PLAN BLOCK (PURE INPUT) -->
<div style="background:#eef5ff;padding:15px;border-radius:10px;margin-bottom:15px;border-left:4px solid #0b5cff;">
  <div style="font-weight:bold;margin-bottom:5px;">Plan Overview</div>
  <div>Plan: <strong>${safe(plan)}</strong></div>
  <div>Total Investment: <strong>${safe(total_investment)}</strong></div>
  <div>Monthly Subscription: <strong>${safe(monthly_subscription)}</strong></div>
</div>

<!-- BUSINESS OVERVIEW -->
<div style="background:#f7f9fc;border-radius:10px;padding:15px;margin-bottom:15px;border-left:4px solid #111827;">
  <div style="font-weight:bold;margin-bottom:8px;">Business Overview</div>
  <div style="background:#ffffff;padding:10px;border-radius:8px;border:1px solid #e5e7eb;">
    ${safe(business_overview)}
  </div>
</div>

<!-- STRATEGIC FIELDS -->
<div style="margin-bottom:10px;"><strong>Target Audience:</strong><br/>${safe(target_audience)}</div>
<div style="margin-bottom:10px;"><strong>Competitors / Inspiration:</strong><br/>${safe(competitors)}</div>
<div style="margin-bottom:10px;"><strong>Design Direction:</strong><br/>${safe(design_direction)}</div>
<div style="margin-bottom:10px;"><strong>Current Assets:</strong><br/>${safe(assets)}</div>
<div style="margin-bottom:10px;"><strong>Project Goals:</strong><br/>${safe(project_goals)}</div>
<div style="margin-bottom:10px;"><strong>Content Readiness:</strong><br/>${safe(content_readiness)}</div>
<div style="margin-bottom:10px;"><strong>Special Requirements:</strong><br/>${safe(special_requirements)}</div>
<div style="margin-bottom:10px;"><strong>Brand Identity Add-on:</strong><br/>${safe(brand_addon)}</div>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="background:#0f172a;color:#cbd5e1;text-align:center;padding:18px;font-size:11px;">
Bleval.inc Internal System — Confidential Client Data
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