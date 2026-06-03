import { buildReply } from './response.js'
import { redis } from '../../db/redis.js'

/**
 * ✅ MAIN CHAT FUNCTION
 */
export async function chat({ client, sessionKey, userMessage }) {
  const cacheKey = `chat:${client?.id || 'anon'}:${sessionKey}`

  let session = {
    messages: [],
    context: {
      stage: 'exploring',
      previousIntent: '',
      currentTopic: '',
      interest: '',
      highIntent: false,
      lastCtaShown: null,
    },
  }

  // ✅ Load session safely
  try {
    const cached = await redis.get(cacheKey)
    if (cached) session = JSON.parse(cached)
  } catch (err) {
    console.error('Redis read error:', err)
  }

  // ✅ Defensive structure guards
  session.messages = Array.isArray(session.messages) ? session.messages : []
  session.context = session.context || { stage: 'exploring' }
  session.context.stage = session.context.stage || 'exploring'
  session.context.previousIntent = session.context.previousIntent || ''
  session.context.currentTopic = session.context.currentTopic || ''
  session.context.interest = session.context.interest || ''
  session.context.highIntent = Boolean(session.context.highIntent)
  session.context.lastCtaShown = session.context.lastCtaShown || null

  // ✅ Save user message
  session.messages.push({
    role: 'user',
    content: userMessage,
    ts: Date.now(),
  })

  // ✅ Generate response (response.js handles matching + state-aware CTA)
  const response = await buildReply({
    userMessage,
    context: session.context,
  })

  // ✅ Save bot response
  session.messages.push({
    role: 'assistant',
    content: response.reply,
    ts: Date.now(),
  })

  // ✅ Persist session
  try {
    await redis.setEx(cacheKey, 7200, JSON.stringify(session))
  } catch (err) {
    console.error('Redis write error:', err)
  }

  // ✅ Strict API response contract
  return {
    reply: response?.reply || 'Something went wrong. Please contact us.',
    cta: response?.cta || null,
    session_key: sessionKey,
  }
}

