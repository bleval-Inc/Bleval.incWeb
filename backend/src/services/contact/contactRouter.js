import { Router } from 'express'
import { z } from 'zod'
import { submitContact } from './contactService.js'

export const contactRouter = Router()

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(1).max(5000),
  source: z.string().optional(),
})

contactRouter.post('/', async (req, res) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out. Please try again.')), 20000),
  )

  try {
    const data = schema.parse(req.body)
    const payload = { client: req.client, ...data }

    await Promise.race([submitContact(payload), timeout])

    return res.status(200).json({
      success: true,
      message: 'Contact form submitted successfully.',
    })
  } catch (err) {
    console.error('CONTACT FORM ERROR:', err)

    if (err?.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Validation failed' })
    }

    return res.status(500).json({
      success: false,
      message: 'Something went wrong.',
    })
  }
})



