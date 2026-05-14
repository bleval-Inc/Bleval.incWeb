import { Router } from 'express'
import { z } from 'zod'
import { onboardingStart, onboardingComplete } from './onboardingService.js'
import { requireMasterKey } from '../../middleware/auth.js'

export const onboardingRouter = Router()

const startSchema = z.object({
  plan: z.string().min(1),
  profile: z.object({
    name: z.string().min(1).max(200),
    company: z.string().optional(),
    email: z.string().email(),
    phone: z.string().optional(),
    industry: z.string().optional(),
    location: z.string().optional(),
  }),
  alignment: z.record(z.any()).optional(),
  brandingAddOnSelected: z.boolean().optional(),
  requestedAt: z.string().datetime().optional(),
})

const completeSchema = z.object({
  plan: z.string().min(1),
  profile: z.object({
    name: z.string().min(1).max(200),
    company: z.string().optional(),
    email: z.string().email(),
    phone: z.string().optional(),
    industry: z.string().optional(),
    location: z.string().optional(),
  }),
  alignment: z.record(z.any()).optional(),
  brandingAddOnSelected: z.boolean().optional(),
  requestedAt: z.string().datetime().optional(),
  completionNote: z.string().optional(),
})

onboardingRouter.post('/start', async (req, res, next) => {
  try {
    const data = startSchema.parse(req.body)
    const result = await onboardingStart({ client: req.client, payload: data })
    res.status(201).json(result)
  } catch (err) {
    if (err?.name === 'ZodError') return res.status(400).json({ error: err.flatten() })
    next(err)
  }
})

onboardingRouter.post('/complete', async (req, res, next) => {
  try {
    const data = completeSchema.parse(req.body)
    const result = await onboardingComplete({ client: req.client, payload: data })
    res.status(201).json(result)
  } catch (err) {
    if (err?.name === 'ZodError') return res.status(400).json({ error: err.flatten() })
    next(err)
  }
})

// Admin/master-key utility: update onboarding step (future extension)
// onboardingRouter.patch('/step/:leadId', requireMasterKey, async (req, res, next) => {
//   ...
// })

