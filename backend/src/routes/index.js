import { Router } from 'express'
import { contactRouter } from '../services/contact/contactRouter.js'
import { chatRouter     } from '../services/chatbot/chatRouter.js'
import { blogRouter     } from '../services/blog/blogRouter.js'
import { quotesRouter   } from '../services/quotes/quotesRouter.js'
import { bookingsRouter } from '../services/bookings/bookingsRouter.js'
import { leadsRouter    } from '../services/leads/leadsRouter.js'
import { onboardingRouter } from '../services/onboarding/onboardingRouter.js'
import { sendEmail } from '../features/email/emailService.js'
// import { leadCaptureRouter } from '../services/chatbot/leadCaptureRouter.js'
// import { paymentsRouter } from '../services/payments/paymentsRouter.js' // TODO: Create when payments complete


export const router = Router()

// Each service mounts its own sub-router here
// We'll populate these as we build each phase

 router.use('/contact',  contactRouter)
 router.use('/blog',     blogRouter)
 router.use('/chat',     chatRouter)
 router.use('/quotes',   quotesRouter)
 router.use('/bookings', bookingsRouter)
 router.use('/leads',    leadsRouter) 
 router.use('/onboarding', onboardingRouter) 
//  router.use('/lead',     leadCaptureRouter) 
 //router.use('/payments', paymentsRouter) // TODO

router.get('/', (req, res) => {
  res.json({ client: req.client.id, features: req.client.features, status: 'running', version: '1.0.0' })
})

router.get('/test-email', async (req, res) => {
  try {
    await sendEmail({
      to: process.env.AGENCY_NOTIFY_EMAIL || process.env.ADMIN_EMAIL,
      subject: 'Bleval SMTP Test',
      templateKey: 'contact-admin',
      data: {
        name: 'Bleval SMTP Test',
        email: process.env.AGENCY_NOTIFY_EMAIL || process.env.ADMIN_EMAIL,
        message: 'This is a test message to verify SMTP connectivity.',
        submitted_at: new Date().toISOString(),
      },
    })

    res.json({ success: true })
  } catch (err) {
    console.error('[test-email] failed', err?.message)
    res.json({ success: false })
  }
})

