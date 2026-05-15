# TODO - GA4 remaining instrumentation & verification

## Plan (approved approach)
- [ ] Finalize onboarding event instrumentation in `front-end/src/app/onboarding/onboarding/onboarding.ts`:
  - [ ] onboarding_started once per onboarding request lifecycle
  - [ ] onboarding_step_completed after successful progression
  - [ ] onboarding_submitted immediately before onboarding API request
  - [ ] onboarding_completed ONLY when `res.ok === true && res.onboardingCompleted === true`, fired BEFORE redirect
  - [ ] onboarding_failed with allowed error_stage values and no duplicates
- [ ] Implement chatbot events in `front-end/src/app/chatbot/chatbot.ts`:
  - [ ] Inject AnalyticsService
  - [ ] chatbot_opened only on closed→open
  - [ ] chatbot_message_sent after send flow begins successfully; log message_length only; no message content
- [ ] Booking modal events in `front-end/src/app/app.ts` (+ template only if needed):
  - [ ] Ensure booking_modal_opened triggers only on closed→open transitions
  - [ ] Ensure booking_request_submitted only after successful booking API response; no open/click/form validation logging
- [ ] Global CTA tracking:
  - [ ] Add `cta_clicked` tracking for Hero CTA, Navbar CTA, Footer CTA, Services CTA, Contact CTA, Work CTA, Pricing CTA without breaking routing
- [ ] Production build verification:
  - [ ] Run production build and fix any TS/template/injection errors
- [ ] GA4 event flow validation checklist:
  - [ ] Use console + GA4 DebugView + Network tab to verify correct firing order/no duplicates
  - [ ] Verify page_view once per navigation
  - [ ] Verify no PII in any event payload

## Status
- [ ] Work in progress (implementation phase not yet started in this session)


