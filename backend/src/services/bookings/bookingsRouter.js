import { Router } from 'express'
import { z } from 'zod'
import { getServices, getAvailableSlots, createBooking, cancelBooking } from './bookingsService.js'
import { requireMasterKey } from '../../middleware/auth.js'


export const bookingsRouter = Router()

bookingsRouter.get('/services', async (req, res, next) => {
  try {
    const services = await getServices(req.client.id)
    res.json({ services })
  } catch (err) { next(err) }
})

bookingsRouter.get('/slots/:serviceId', async (req, res, next) => {
  try {
    const { date } = req.query
    if (!date) return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' })
    const slots = await getAvailableSlots(req.client, req.params.serviceId, date)
    res.json({ slots })
  } catch (err) { next(err) }
})

const bookingSchema = z.object({
  name:    z.string().min(1).max(200),
  email:   z.string().email(),
  phone:   z.string().min(1).max(50),
  service: z.string().min(1).max(200),
  date:    z.string().min(1), // YYYY-MM-DD
  time:    z.string().min(1), // HH:mm
  notes:   z.string().optional(),
  source:  z.string().optional(),
})


bookingsRouter.post('/', async (req, res, next) => {
  try {
    const data    = bookingSchema.parse(req.body)
    const booking = await createBooking({
      client: req.client,
      name: data.name,
      email: data.email,
      phone: data.phone,
      service: data.service,
      date: data.date,
      time: data.time,
      notes: data.notes,
      source: data.source || 'booking_modal',
    })

    res.status(201).json(booking)
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
  } catch (err) { next(err) }
})