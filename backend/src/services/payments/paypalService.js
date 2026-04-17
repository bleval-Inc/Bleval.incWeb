import { env } from '../../config/env.js'

const BASE_URL = env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

async function getAccessToken() {
  const credentials = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method:  'POST',
    headers: {
      Authorization:  `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()
  return data.access_token
}

export async function createPayPalOrder({ amount, currency = 'USD', description, quoteId }) {
  const token = await getAccessToken()

  const res = await fetch(`${BASE_URL}/v2/checkout/orders`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value:         String(amount),
        },
        description,
        custom_id: quoteId || '',
      }],
      application_context: {
        brand_name:          env.AGENCY_NAME,
        landing_page:        'BILLING',
        user_action:         'PAY_NOW',
        return_url: `https://${env.AGENCY_DOMAIN}/payment-success`,
        cancel_url:  `https://${env.AGENCY_DOMAIN}/payment-cancelled`,
      },
    }),
  })

  const order = await res.json()
  const approveUrl = order.links?.find(l => l.rel === 'approve')?.href

  return { orderId: order.id, approveUrl }
}

export async function capturePayPalOrder(orderId) {
  const token = await getAccessToken()

  const res = await fetch(`${BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  return res.json()
}