import { Router } from 'express'
import { z } from 'zod'
import { submitContact } from './contactService.js'

export const contactRouter = Router()

const schema = z.object({
  name:    z.string().min(1).max(200),
  email:   z.string().email(),
  phone:   z.string().optional(),
  message: z.string().min(1).max(5000),
  source:  z.string().optional(),
})

contactRouter.post('/', async (req, res, next) => {
  try {
    const data = schema.parse(req.body)
    const result = await submitContact({ client: req.client, ...data })
    res.status(201).json({ success: true, id: result.id })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.flatten() })
    }
    next(err)
  }
})