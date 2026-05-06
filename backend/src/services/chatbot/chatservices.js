import { buildReply, intents } from './response.js'
import { redis } from '../../db/redis.js'

/**
 * ✅ SAFE PATTERN MATCHING (CRITICAL FIX)
 * Prevents partial word collisions like:
 * "pro" matching "problem"
 */
function containsPattern(message, pattern) {
  const escaped = String(pattern)
    .toLowerCase()
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const regex = new RegExp(`\\b${escaped}\\b`, 'i')
  return regex.test(message)
}

/**
 * ✅ INTENT MATCHING WITH PRIORITY SCORING
 */
export function matchIntent(message) {
  const lower = String(message || '').toLowerCase().trim()

  let bestMatch = null
  let bestScore = 0

  for (const intent of intents) {
    let score = 0

    for (const pattern of intent.patterns || []) {
      if (containsPattern(lower, pattern)) {
        score += 1
      }
    }

    if (score > 0) {
      const weightedScore = score * (intent.priority || 1)

      if (weightedScore > bestScore) {
        bestScore = weightedScore
        bestMatch = intent
      }
    }
  }

  return bestMatch
}

/**
 * ✅ EXTRACT CLEAN INTENT NAME (USED BY buildReply)
 */
export function extractIntentName(message, intent) {
  const lower = String(message || '').toLowerCase()

  for (const pattern of intent.patterns || []) {
    if (containsPattern(lower, pattern)) {
      return pattern
    }
  }

  return null
}

/**
 * ✅ MAIN CHAT FUNCTION
 */
export async function chat({ client, sessionKey, userMessage }) {
  const cacheKey = `chat:${client?.id || 'anon'}:${sessionKey}`

  let session = {
    messages: [],
    context: { stage: 'exploring' },
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

  // ✅ Save user message
  session.messages.push({
    role: 'user',
    content: userMessage,
    ts: Date.now(),
  })

  // ✅ Intent detection
  const matchedIntent = matchIntent(userMessage)
  const intentName = matchedIntent
    ? extractIntentName(userMessage, matchedIntent)
    : null

  console.log('🧠 Matched intent:', intentName)

  // ✅ Generate response (fallback handled inside buildReply)
  const response = buildReply(intentName, session.context.stage)

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