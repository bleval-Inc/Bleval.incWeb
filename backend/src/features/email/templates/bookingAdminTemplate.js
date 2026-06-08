export function template(data = {}) {
  const {
    name = '',
    email = '',
    phone = '',
    service = '',
    message = '',
    source = '',
    submittedAt = '',
  } = data

  const logo =
    'https://blevalinc.netlify.app/assets/bleval_logos/icon_200x200_dark.png'

  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:30px 15px;">

<table width="700" cellpadding="0" cellspacing="0"
style="
background:#ffffff;
border-radius:14px;
overflow:hidden;
box-shadow:0 12px 30px rgba(15,23,42,.08);
">

<!-- HEADER -->
<tr>
<td
style="
background:#0b5cff;
padding:28px;
text-align:center;
"
>
<img
src="${logo}"
width="64"
alt="Bleval.inc"
style="display:block;margin:0 auto 12px auto;border-radius:12px;"
/>

<div
style="
color:#ffffff;
font-size:24px;
font-weight:700;
margin-bottom:6px;
"
>
New Booking Request
</div>

<div
style="
color:rgba(255,255,255,.85);
font-size:14px;
"
>
A new lead has submitted a booking enquiry.
</div>
</td>
</tr>

<!-- BODY -->
<tr>
<td style="padding:32px;">

<div
style="
font-size:18px;
font-weight:700;
color:#111827;
margin-bottom:20px;
"
>
Lead Information
</div>

<table width="100%" cellpadding="8" cellspacing="0">
<tr>
<td width="180"><strong>Name</strong></td>
<td>${name}</td>
</tr>

<tr>
<td><strong>Email</strong></td>
<td>${email}</td>
</tr>

<tr>
<td><strong>Phone</strong></td>
<td>${phone || '-'}</td>
</tr>

<tr>
<td><strong>Service Requested</strong></td>
<td>${service}</td>
</tr>

<tr>
<td><strong>Source</strong></td>
<td>${source || 'Website Booking Form'}</td>
</tr>

<tr>
<td><strong>Submitted</strong></td>
<td>${submittedAt}</td>
</tr>
</table>

<div
style="
margin-top:28px;
font-size:18px;
font-weight:700;
color:#111827;
margin-bottom:12px;
"
>
Project Details
</div>

<div
style="
background:#f8fafc;
border:1px solid #e5e7eb;
border-left:4px solid #0b5cff;
padding:18px;
border-radius:10px;
color:#374151;
line-height:1.7;
white-space:pre-wrap;
"
>
${message}
</div>

<div
style="
margin-top:24px;
padding:16px;
background:#eef5ff;
border-radius:10px;
font-size:14px;
color:#1e3a8a;
"
>
Next Action: Contact this lead to qualify requirements and schedule a consultation.
</div>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td
style="
background:#0f172a;
padding:24px;
text-align:center;
"
>

<div style="color:#ffffff;font-weight:600;margin-bottom:8px;">
Bleval.inc
</div>

<div style="color:#cbd5e1;font-size:13px;line-height:1.8;">
Web Development • AI Automation • Growth Systems
</div>

<div style="color:#94a3b8;font-size:12px;margin-top:12px;">
Internal Notification • Confidential Lead Information
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