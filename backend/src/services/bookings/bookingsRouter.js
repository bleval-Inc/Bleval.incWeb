import { Router } from 'express'
import { z } from 'zod'
import { getAvailableSlots, createBooking } from './bookingsService.js'

export const bookingsRouter = Router()

// Query schema for available slots
const slotsQuerySchema = z.object({
  serviceId: z.string(),
  date:      z.string().pipe(z.coerce.date()),
})

// Body schema for creating booking (matches service params)
const createBookingSchema = z.object({
  serviceId:     z.string(),
  contactName:   z.string().min(1).max(200),
  contactEmail:  z.string().email(),
  contactPhone:  z.string().optional(),
  startTime:     z.string(),  // ISO datetime string
//   notes:         z.string().optional().max(1000),
})

// GET /?serviceId=...&date=... → list available time slots
bookingsRouter.get('/', async (req, res, next) => {
  try {
    const { serviceId, date } = slotsQuerySchema.parse(req.query)
    const slots = await getAvailableSlots(req.client, serviceId, date)
    res.json({ slots })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.flatten() })
    }
    next(err)
  }
})

// POST / → create a booking
bookingsRouter.post('/', async (req, res, next) => {
  try {
    const data = createBookingSchema.parse(req.body)
    const booking = await createBooking({ 
      client: req.client, 
      ...data 
    })
    res.status(201).json({ success: true, booking })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.flatten() })
    }
    next(err)
  }
})

