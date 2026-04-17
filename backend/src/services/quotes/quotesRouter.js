import { Router } from 'express'
import { z } from 'zod'
import { createQuote, sendQuote, listQuotes, getQuote } from './quoteService.js'
import { requireMasterKey } from '../../middleware/auth.js'

export const quotesRouter = Router()

const lineItemSchema = z.object({
  description: z.string(),
  qty:         z.number().positive(),
  unit_price:  z.number().nonnegative(),
})

const createSchema = z.object({
  contact_name:  z.string().min(1),
  contact_email: z.string().email(),
  line_items:    z.array(lineItemSchema).min(1),
  tax_rate:      z.number().min(0).max(1).optional(),
  valid_days:    z.number().int().positive().optional(),
  notes:         z.string().optional(),
})

quotesRouter.get('/', requireMasterKey, async (req, res, next) => {
  try {
    const quotes = await listQuotes(req.client.id, req.query.status)
    res.json({ quotes })
  } catch (err) { next(err) }
})

quotesRouter.get('/:id', requireMasterKey, async (req, res, next) => {
  try {
    const quote = await getQuote(req.params.id, req.client.id)
    if (!quote) return res.status(404).json({ error: 'Not found' })
    res.json(quote)
  } catch (err) { next(err) }
})

quotesRouter.post('/', requireMasterKey, async (req, res, next) => {
  try {
    const data  = createSchema.parse(req.body)
    const quote = await createQuote({
      client:       req.client,
      contactName:  data.contact_name,
      contactEmail: data.contact_email,
      lineItems:    data.line_items,
      taxRate:      data.tax_rate,
      validDays:    data.valid_days,
      notes:        data.notes,
    })
    res.status(201).json(quote)
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.flatten() })
    next(err)
  }
})

quotesRouter.post('/:id/send', requireMasterKey, async (req, res, next) => {
  try {
    const result = await sendQuote(req.params.id, req.client)
    res.json(result)
  } catch (err) { next(err) }
})

// Public endpoint — client accepts quote via link
quotesRouter.patch('/:id/accept', async (req, res, next) => {
  try {
    await db.query(
      `UPDATE quotes SET status = 'accepted', updated_at = now() WHERE id = $1 AND client_id = $2`,
      [req.params.id, req.client.id]
    )
    res.json({ accepted: true })
  } catch (err) { next(err) }
})