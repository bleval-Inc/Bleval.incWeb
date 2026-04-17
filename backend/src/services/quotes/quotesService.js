import { db } from '../../db/index.js'
import { emailQueue } from '../../queue/index.js'
import PDFDocument from 'pdfkit'

function generateQuoteNumber() {
  const year = new Date().getFullYear()
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `QT-${year}-${rand}`
}

function calcTotals(lineItems, taxRate) {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.qty * item.unit_price), 0)
  const total    = subtotal * (1 + taxRate)
  return { subtotal: +subtotal.toFixed(2), total: +total.toFixed(2) }
}

export async function createQuote({ client, contactName, contactEmail, lineItems, taxRate = 0.15, validDays = 30, notes }) {
  const quoteNumber = generateQuoteNumber()
  const { subtotal, total } = calcTotals(lineItems, taxRate)
  const validUntil = new Date(Date.now() + validDays * 86400000).toISOString().split('T')[0]

  const { rows } = await db.query(
    `INSERT INTO quotes (client_id, quote_number, contact_name, contact_email, line_items, subtotal, tax_rate, total, valid_until, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [client.id, quoteNumber, contactName, contactEmail,
     JSON.stringify(lineItems), subtotal, taxRate, total, validUntil, notes || null]
  )
  return rows[0]
}

export async function sendQuote(quoteId, client) {
  const { rows } = await db.query('SELECT * FROM quotes WHERE id = $1 AND client_id = $2', [quoteId, client.id])
  const quote = rows[0]
  if (!quote) throw Object.assign(new Error('Quote not found'), { status: 404 })

  await db.query(`UPDATE quotes SET status = 'sent', updated_at = now() WHERE id = $1`, [quoteId])

  await emailQueue.add('quote-send', {
    to: quote.contact_email,
    from: client.email.from,
    quote,
    clientName: client.name,
  }, { attempts: 3 })

  return { sent: true }
}

export async function listQuotes(clientId, status) {
  const params = [clientId]
  const filter = status ? `AND status = $2` : ''
  if (status) params.push(status)
  const { rows } = await db.query(
    `SELECT id, quote_number, contact_name, contact_email, total, currency, status, created_at
     FROM quotes WHERE client_id = $1 ${filter} ORDER BY created_at DESC`,
    params
  )
  return rows
}