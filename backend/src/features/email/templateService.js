import { template as contactAdmin } from './templates/contactAdminTemplate.js'
import { template as contactUser } from './templates/contactUserTemplate.js'
import { template as bookingAdmin } from './templates/bookingAdminTemplate.js'
import { template as bookingUser } from './templates/bookingUserTemplate.js'
import { template as onboardingAdmin } from './templates/onboardingAdminTemplate.js'
import { template as onboardingUser } from './templates/onboardingUserTemplate.js'

const templates = {
  'contact-admin': contactAdmin,
  'contact-user': contactUser,
  'booking-admin': bookingAdmin,
  'booking-user': bookingUser,
  'onboarding-admin': onboardingAdmin,
  'onboarding-user': onboardingUser,
}

export function getTemplate(templateKey, data = {}) {
  const fn = templates[templateKey]
  if (!fn) throw new Error(`Unknown email template key: ${templateKey}`)
  return fn(data)
}
