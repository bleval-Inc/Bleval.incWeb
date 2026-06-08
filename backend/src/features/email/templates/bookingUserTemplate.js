export function template(data = {}) {
  const {
    name = '',
    service = '',
    message = '',
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
padding:30px;
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
font-size:24px;
font-weight:700;
color:#ffffff;
margin-bottom:6px;
"
>
Booking Request Received
</div>

<div
style="
font-size:14px;
color:rgba(255,255,255,.85);
"
>
Thank you for contacting Bleval.inc
</div>

</td>
</tr>

<!-- BODY -->
<tr>
<td style="padding:32px;">

<h2
style="
margin:0 0 18px;
font-size:24px;
color:#111827;
"
>
Hi ${name},
</h2>

<p
style="
margin:0 0 20px;
line-height:1.8;
color:#4b5563;
"
>
Thank you for reaching out to Bleval.inc.

We have successfully received your booking request and project information. Our team will review your requirements and determine the most effective approach to help achieve your goals.
</p>

<div
style="
font-size:18px;
font-weight:700;
margin-bottom:12px;
color:#111827;
"
>
Booking Summary
</div>

<div
style="
background:#f8fafc;
border:1px solid #e5e7eb;
padding:16px;
border-radius:10px;
margin-bottom:24px;
"
>
<strong>Service Requested:</strong>
${service}
</div>

<div
style="
font-size:18px;
font-weight:700;
margin-bottom:12px;
color:#111827;
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
line-height:1.7;
color:#374151;
white-space:pre-wrap;
"
>
${message}
</div>

<div
style="
margin-top:28px;
padding:20px;
background:#eef5ff;
border-radius:10px;
"
>

<div
style="
font-weight:700;
color:#1e3a8a;
margin-bottom:10px;
"
>
What Happens Next?
</div>

<div style="line-height:1.8;color:#374151;">
1. Our team will review your enquiry.<br>
2. A Bleval strategist will assess your requirements.<br>
3. We will contact you via email or phone to discuss your project.<br>
4. If appropriate, we'll prepare a tailored recommendation and next-step plan.
</div>

</div>

<p
style="
margin-top:24px;
line-height:1.8;
color:#4b5563;
"
>
Typical response time is 1–2 business days.

If your request is time-sensitive, please reply directly to this email and our team will prioritise accordingly.
</p>

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

<div style="margin-top:12px;">
<a
href="mailto:bleval.inc@gmail.com"
style="color:#60a5fa;text-decoration:none;"
>
bleval.inc@gmail.com
</a>
</div>

<div style="color:#94a3b8;font-size:12px;margin-top:12px;">
© Bleval.inc. All rights reserved.
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