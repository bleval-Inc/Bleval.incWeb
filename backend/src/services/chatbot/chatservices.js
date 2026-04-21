import { intents, fallbackResponse } from './response.js'
import { redis } from '../../db/redis.js'

function matchIntent(message) {
  const lower = message.toLowerCase().trim()
  for (const intent of intents) {
    if (intent.patterns.some(p => lower.includes(p))) {
      return intent.response
    }
  }
  return null
}

export async function chat({ client, sessionKey, userMessage }) {
  const cacheKey = `chat:${client.id}:${sessionKey}`

  let session = { messages: [] }
  try {
    const cached = await redis.get(cacheKey)
    if (cached) session = JSON.parse(cached)
  } catch {}

  session.messages.push({ role: 'user', content: userMessage, ts: Date.now() })

  const reply = matchIntent(userMessage) || fallbackResponse

  session.messages.push({ role: 'assistant', content: reply, ts: Date.now() })

  try {
    await redis.setEx(cacheKey, 7200, JSON.stringify(session))
  } catch {}

  return { reply, session_key: sessionKey }
}