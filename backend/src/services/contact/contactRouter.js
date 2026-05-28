import { Router } from 'express'
import { z } from 'zod'
import { submitContact } from './contactService.js'

export const contactRouter = Router()

const schema = z.object({
  name: z.string().min(1).max(200),

  email: z.string().email(),

  phone: z.string().optional(),

  company: z.string().optional(),

  service: z.string().optional(),

  pricingPlan: z.string().optional(),

  message: z.string().min(1).max(5000),

  source: z.string().optional(),
})


contactRouter.post('/', async (req, res) => {
  try {
    const data = schema.parse(req.body)

    const payload = {
      client: req.client,
      ...data,
    }

    /**
     * Return success immediately
     */
    res.status(200).json({
      success: true,
      message: 'Contact form submitted successfully.',
    })

    /**
     * Process email in background
     */
    submitContact(payload)
      .then(() => {
        console.log('CONTACT EMAIL FLOW COMPLETED')
      })
      .catch((error) => {
        console.error('BACKGROUND CONTACT ERROR:', error)
      })

  } catch (err) {
    console.error('CONTACT FORM ERROR:', err)

    if (err?.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Something went wrong.',
    })
  }
})