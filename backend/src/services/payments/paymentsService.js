import Stripe from 'stripe'
import { db } from '../../db/index.js'
import { env } from '../../config/env.js'

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export async function createPaymentLink({ client, quoteId, description, amountZAR }) {
  const amountCents = Math.round(amountZAR * 100)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'zar',
        unit_amount: amountCents,
        product_data: { name: description },
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `https://${client.domain}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `https://${client.domain}/payment-cancelled`,
    metadata: { client_id: client.id, quote_id: quoteId || '' },
  })

  // Log payment intent
  await db.query(
    `INSERT INTO payments (client_id, stripe_payment_id, related_type, related_id, amount, currency)
     VALUES ($1,$2,$3,$4,$5,'ZAR')`,
    [client.id, session.payment_intent, quoteId ? 'quote' : null, quoteId || null, amountZAR]
  )

  return { url: session.url, session_id: session.id }
}

export async function handleStripeWebhook(rawBody, signature) {
  const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { client_id, quote_id } = session.metadata

    await db.query(
      `UPDATE payments SET status = 'paid', paid_at = now()
       WHERE stripe_payment_id = $1`,
      [session.payment_intent]
    )

    if (quote_id) {
      await db.query(
        `UPDATE quotes SET status = 'invoiced', updated_at = now() WHERE id = $1`,
        [quote_id]
      )
    }
  }

  return { received: true }
}