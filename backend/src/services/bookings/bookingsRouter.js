import { Router } from 'express'
import { z } from 'zod'
import { getServices, createBooking, cancelBooking } from './bookingsService.js'
import { requireMasterKey } from '../../middleware/auth.js'

export const bookingsRouter = Router()

bookingsRouter.get('/services', async (req, res, next) => {
  try {
    const services = await getServices(req.client.id)
    res.json({ services })
  } catch (err) {
    next(err)
  }
})

const bookingSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().min(1).max(50),
  service: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  source: z.string().optional(),
})

bookingsRouter.post('/', async (req, res, next) => {
  console.log('STEP 1: booking payload received')
  try {
    const data = bookingSchema.parse(req.body)


    const payload = {
      client: req.client,
      name: data.name,
      email: data.email,
      phone: data.phone,
      service: data.service,
      message: data.message,
      source: data.source || 'booking_form',
    }

    // Return success immediately, process emails in background (matches contact flow)
    res.status(200).json({ success: true })

    createBooking(payload).catch((err) => {
      console.error('[BOOKING BACKGROUND ERROR]:', err)
    })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.flatten() })
    next(err)
  }
})

bookingsRouter.delete('/:id', requireMasterKey, async (req, res, next) => {
  try {
    const booking = await cancelBooking(req.params.id, req.client.id)
    if (!booking) return res.status(404).json({ error: 'Booking not found' })
    res.json({ cancelled: true })
  } catch (err) {
    next(err)
  }
})

