import { Worker } from 'bullmq'
import { env } from '../config/env.js'
import { sendEmail } from '../features/email/emailService.js'

const emailWorker = new Worker(
  'email',
  async (job) => {
    console.log('WORKER PROCESSING JOB', job?.name, job?.id)
    const { name, data } = job

    // Booking lead qualification: must behave like contact form emails.
    if (name === 'user-confirmation') {
      console.log('STEP 6: EMAIL SEND START: user-confirmation')
      console.log('user-confirmation job data:', data)
      await sendEmail({
        to: data.to,
        subject: `We’ve received your request — Bleval.inc`,
        templateKey: 'booking-user',
        data: {
          name: data.name,
          service: data.service,
          message: data.message,
        },
      })
      console.log('STEP 7: user email sent')
      return
    }


    if (name === 'agency-notification') {
      console.log('STEP 4: EMAIL SEND START: agency-notification')
      console.log('agency-notification job data:', data)
      await sendEmail({
        to: data.to,
        subject: `New Booking Lead — Bleval.inc`,
        templateKey: 'booking-admin',
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          service: data.service,
          message: data.message,
          source: data.source,
          submittedAt: data.submittedAt,
        },
      })
      console.log('STEP 5: admin email sent')
      return
    }


    if (name === 'quote-send') {
      console.log('EMAIL SEND START: quote-send')
      await sendEmail({
        to: data.to,
        subject: `Your quote from ${data.clientName} — ${data.quote.quote_number}`,
        templateKey: 'contact-admin',
        data: {
          quote: data.quote,
          clientName: data.clientName,
        },
      })
      return
    }

    if (name === 'booking-confirmation') {
      // deprecated (kept to avoid breaking older queued jobs)
      console.log('EMAIL SEND START: booking-confirmation (deprecated)')
      await sendEmail({
        to: data.to,
        subject: `Your booking request is confirmed — Bleval.inc`,
        templateKey: 'booking-user',
        data: {
          name: data?.name || data?.booking?.contact_name || '',
          service: data?.service,
          message: data?.booking?.message || data?.confirmation_message || '',
        },
      })
      return
    }

    if (name === 'onboarding-started') {
      console.log('EMAIL SEND START: onboarding-started')
      await sendEmail({
        to: data.to,
        subject: `We’ve received your onboarding request — Bleval.inc`,
        templateKey: 'onboarding-user',
        data: {
          name: data.name,
          selected_plan: data.plan,
        },
      })
      return
    }

    if (name === 'onboarding-completed') {
      console.log('EMAIL SEND START: onboarding-completed')
      await sendEmail({
        to: data.to,
        subject: `Onboarding request received — Bleval.inc`,
        templateKey: 'onboarding-user',
        data: {
          name: data.name,
          selected_plan: data.plan,
        },
      })
      return
    }

    console.log('Unknown email job name (ignored):', name)
  },

  {
    connection: {
      url: env.REDIS_URL,
      maxRetriesPerRequest: null,
    },
  },
)

emailWorker.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err.message)
})

console.log('Worker running and waiting for jobs...')


