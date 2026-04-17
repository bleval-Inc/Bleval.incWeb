import { Router } from 'express'
import { contactRouter } from '../services/contact/contactRouter.js'
import { chatRouter     } from '../services/chatbot/chatRouter.js'
import { blogRouter     } from '../services/blog/blogRouter.js'
import { quotesRouter   } from '../services/quotes/quotesRouter.js'
import { bookingsRouter } from '../services/bookings/bookingsRouter.js'
// import { paymentsRouter } from '../services/payments/paymentsRouter.js' // TODO: Create when payments complete

export const router = Router()

// Each service mounts its own sub-router here
// We'll populate these as we build each phase

 router.use('/contact',  contactRouter)
 router.use('/blog',     blogRouter)
 router.use('/chat',     chatRouter)
 router.use('/quotes',   quotesRouter)
 router.use('/bookings', bookingsRouter)
 //router.use('/leads',    leadsRouter) // TODO: Create leadsRouter
 //router.use('/payments', paymentsRouter) // TODO

router.get('/', (req, res) => {
  res.json({ client: req.client.id, features: req.client.features })
})

