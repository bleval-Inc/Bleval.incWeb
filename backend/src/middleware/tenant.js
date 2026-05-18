import { getClient } from '../config/clients.js'
import { env } from '../config/env.js'

const PUBLIC_BYPASS_ROUTES = [
  '/api/healthz',
  '/api/health',
]

export async function tenantMiddleware(req, res, next) {
  try {
    const path = String(req.path || '')

    /**
     * ---------------------------------------------------------
     * Bypass tenant resolution for public infrastructure routes
     * ---------------------------------------------------------
     */
    if (PUBLIC_BYPASS_ROUTES.includes(path)) {
      return next()
    }

    /**
     * ---------------------------------------------------------
     * Normalize incoming headers
     * ---------------------------------------------------------
     */
    const clientId =
      req.headers['x-client-id']?.toString().trim() || null

    const origin =
      req.headers['origin'] ||
      req.headers['referer'] ||
      ''

    let client = null
    let resolvedVia = null
    let resolvedDomain = null

    /**
     * ---------------------------------------------------------
     * 1. Resolve via explicit client header (preferred)
     * ---------------------------------------------------------
     */
    if (clientId) {
      client = await getClient(clientId)

      if (client) {
        resolvedVia = 'header'
      }
    }

    /**
     * ---------------------------------------------------------
     * 2. Resolve via frontend origin hostname
     * ---------------------------------------------------------
     */
    if (!client && origin) {
      try {
        const domain = new URL(origin)
          .hostname
          .replace(/^www\./, '')
          .trim()

        resolvedDomain = domain

        client = await getClient(domain)

        if (client) {
          resolvedVia = 'origin'
        }
      } catch (error) {
        console.warn(
          '[tenantMiddleware] Failed to parse origin:',
          origin
        )
      }
    }

    /**
     * ---------------------------------------------------------
     * 3. Safe fallback for primary agency deployment
     * ---------------------------------------------------------
     * Useful for:
     * - Render diagnostics
     * - internal server calls
     * - production fallback safety
     * ---------------------------------------------------------
     */
    if (!client && env.AGENCY_DOMAIN) {
      client = await getClient(env.AGENCY_DOMAIN)

      if (client) {
        resolvedVia =
          env.NODE_ENV === 'development'
            ? 'development-fallback'
            : 'agency-fallback'
      }
    }

    /**
     * ---------------------------------------------------------
     * Targeted onboarding diagnostics
     * ---------------------------------------------------------
     */
    if (path.includes('onboarding')) {
      console.log('[tenantMiddleware:onboarding]', {
        path,
        xClientId: clientId,
        origin: origin || null,
        resolvedVia,
        resolvedDomain,
        resolvedClientId: client?.id ?? null,
        resolvedClientDomain: client?.domain ?? null,
      })
    }

    /**
     * ---------------------------------------------------------
     * Reject unresolved tenants
     * ---------------------------------------------------------
     */
    if (!client) {
      console.warn('[tenantMiddleware] Unknown client rejected', {
        path,
        origin: origin || null,
        xClientId: clientId,
      })

      return res.status(403).json({
        ok: false,
        error: 'Unknown client',
      })
    }

    /**
     * ---------------------------------------------------------
     * Attach resolved client to request
     * ---------------------------------------------------------
     */
    req.client = client

    next()
  } catch (err) {
    console.error('[tenantMiddleware] Fatal middleware error', err)

    next(err)
  }
}