import { db } from '../db/index.js'

let clientCache = null
let cacheTime = 0
const CACHE_TTL = 60000

export async function getClient(identifier) {
  const now = Date.now()
  if (!clientCache || now - cacheTime > CACHE_TTL) {
    const { rows } = await db.query('SELECT * FROM clients WHERE active = true')
    clientCache = rows
    cacheTime = now
  }
  return clientCache.find(c => c.domain === identifier || c.id === identifier) ?? null
}