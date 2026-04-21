import { Router } from 'express'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { chat } from './chatservices.js'

export const chatRouter = Router()

const schema = z.object({
  message:     z.string().min(1).max(2000),
  session_key: z.string().optional(),
})

chatRouter.post('/', async (req, res, next) => {
  try {
    const { message, session_key } = schema.parse(req.body)
    const result = await chat({
      client:      req.client,
      sessionKey:  session_key || randomUUID(),
      userMessage: message,
    })
    res.json(result)
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.flatten() })
    next(err)
  }
})