import { getClient } from '../config/clients.js'
import { env } from '../config/env.js'

export async function tenantMiddleware(req, res, next) {
  try {
    const clientId = req.headers['x-client-id']
    const origin   = req.headers['origin'] || req.headers['referer'] || ''

    let client = null

    if (clientId) {
      client = await getClient(clientId)
    }

    if (!client && origin) {
      try {
        const domain = new URL(origin).hostname.replace(/^www\./, '')
        client = await getClient(domain)
      } catch {}
    }

    if (!client && env.NODE_ENV === 'development') {
      client = await getClient(env.AGENCY_DOMAIN)
    }

    if (!client) {
      return res.status(403).json({ error: 'Unknown client' })
    }

    req.client = client
    next()
  } catch (err) {
    next(err)
  }
}