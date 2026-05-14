import { getClient } from '../config/clients.js'
import { env } from '../config/env.js'

export async function tenantMiddleware(req, res, next) {
  try {
    const clientId = req.headers['x-client-id']
    const origin   = req.headers['origin'] || req.headers['referer'] || ''

    let client = null
    let resolvedVia = null
    let resolvedDomain = null

    if (clientId) {
      client = await getClient(clientId)
      resolvedVia = 'header'
    }

    if (!client && origin) {
      try {
        const domain = new URL(origin).hostname.replace(/^www\./, '')
        resolvedDomain = domain
        client = await getClient(domain)
        resolvedVia = 'origin'
      } catch {}
    }

    if (!client && env.NODE_ENV === 'development') {
      resolvedVia = 'development-fallback'
      client = await getClient(env.AGENCY_DOMAIN)
    }

    // Recon-grade logging for onboarding tenant resolution issues.
    // (kept lightweight and safe; no secrets)
    if (String(req.path || '').includes('onboarding')) {
      console.log('[tenantMiddleware:onboarding]', {
        path: req.path,
        xClientId: clientId ?? null,
        origin: origin || null,
        resolvedVia,
        resolvedDomain: resolvedDomain ?? null,
        resolvedClientId: client?.id ?? null,
        resolvedClientDomain: client?.domain ?? null,
      })
    }

    if (!client) {
      if (String(req.path || '').includes('onboarding')) {
        console.log('[tenantMiddleware:onboarding] REJECT Unknown client')
      }
      return res.status(403).json({ error: 'Unknown client' })
    }

    req.client = client
    next()
  } catch (err) {
    next(err)
  }
}
