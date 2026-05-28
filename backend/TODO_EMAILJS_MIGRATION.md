# TODO EmailJS migration (production-grade 2-template architecture)

## Step 1: Update EmailJS env schema
- [ ] Update `backend/src/config/env.js`
  - [x] Add `EMAILJS_ADMIN_TEMPLATE_ID`
  - [x] Add `EMAILJS_USER_TEMPLATE_ID`
  - [x] Ensure runtime logging includes presence flags
  - [x] Keep legacy `EMAILJS_TEMPLATE_ID` optional for backward compatibility

## Step 2: Refactor email service to generic sender
- [x] Replace `backend/src/services/email/emailService.js`
  - [x] Implement `sendEmail({ templateId, to, subject, templateParams })`

  - [x] Ensure payload shape:
    - [x] `{ service_id, template_id, user_id, template_params }`
    - [x] `user_id` uses `EMAILJS_PUBLIC_KEY`
- [x] No hardcoded field mappings inside sender
- [x] Safe logging of final template params (no secrets)
- [x] Proper error handling


- [ ] Update `backend/src/services/email/index.js` exports

## Step 3: Refactor contact service to template-params architecture

- [x] Update `backend/src/services/contact/contactService.js`

  - [ ] Fix zod validation expectations (ensure router payload mapping includes required fields)
  - [ ] Build admin template params with full lead details:
    - [ ] name/email/phone/company/service/pricing_plan/message
  - [ ] Build user confirmation template params with confirmation + project summary + next steps
  - [ ] Send both emails via EmailJS admin + user templates

## Step 4: Refactor onboarding service to flattened template params

- [ ] Update `backend/src/services/onboarding/onboardingService.js`
  - [ ] Remove html-based EmailJS calls
  - [ ] Build flattened template params mapping exactly to standardized names
  - [ ] Send admin + user confirmation using the two templates

## Step 5: Verification
- [ ] Ensure no undefined-field crashes (template_params defaulting)
- [ ] Ensure admin emails include full submission details
- [ ] Ensure user emails go to user-provided email
- [ ] Confirm logs show final template params
- [ ] Run backend locally / build / start to ensure no regression

