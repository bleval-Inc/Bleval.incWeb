import { env } from '../config/env.js'

export function requireMasterKey(req, res, next) {
  const key = req.headers['x-api-key']
  if (!key || key !== env.MASTER_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}