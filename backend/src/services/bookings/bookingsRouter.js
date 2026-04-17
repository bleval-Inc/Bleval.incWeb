import { Router } from 'express'
import { z } from 'zod'
import { getServices, getAvailableSlots, createBooking, cancelBooking } from './bookingService.js'
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
  service_id:     z.string().uuid(),
  contact_name:   z.string().min(1),
  contact_email:  z.string().email(),
  contact_phone:  z.string().optional(),
  start_time:     z.string(),
  notes:          z.string().optional(),
})

bookingsRouter.post('/', async (req, res, next) => {
  try {
    const data    = bookingSchema.parse(req.body)
    const booking = await createBooking({
      client:        req.client,
      serviceId:     data.service_id,
      contactName:   data.contact_name,
      contactEmail:  data.contact_email,
      contactPhone:  data.contact_phone,
      startTime:     data.start_time,
      notes:         data.notes,
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