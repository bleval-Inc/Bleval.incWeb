import Anthropic from '@anthropic-ai/sdk'
import { db } from '../../db/index.js'
import { redis } from '../../db/redis.js'
import { env } from '../../config/env.js'

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

// Find relevant knowledge chunks via cosine similarity
async function retrieveContext(clientId, query, limit = 4) {
  // Generate embedding for the query using Anthropic's embedding model
  // For now we skip embedding retrieval and rely on the system prompt context
  // — add pgvector RAG here once you have knowledge chunks loaded
  const { rows } = await db.query(
    `SELECT content FROM knowledge_chunks
     WHERE client_id = $1
     ORDER BY embedding <=> (
       SELECT embedding FROM knowledge_chunks
       WHERE client_id = $1 LIMIT 1
     )
     LIMIT $2`,
    [clientId, limit]
  )
  return rows.map(r => r.content).join('\n\n')
}

export async function chat({ client, sessionKey, userMessage }) {
  // Load or create session
  const sessionCacheKey = `chat:${client.id}:${sessionKey}`
  let session = null

  const cached = await redis.get(sessionCacheKey)
  if (cached) {
    session = JSON.parse(cached)
  } else {
    session = { messages: [] }
  }

  // Retrieve relevant knowledge
  const context = await retrieveContext(client.id, userMessage)

  const systemPrompt = `${client.chatbot.system_prompt}
${context ? `\n\nRelevant information:\n${context}` : ''}`

  // Build messages array
  session.messages.push({ role: 'user', content: userMessage })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: session.messages.slice(-20), // keep last 20 turns
  })

  const assistantMessage = response.content[0].text
  session.messages.push({ role: 'assistant', content: assistantMessage })

  // Cache session for 2 hours
  await redis.setEx(sessionCacheKey, 7200, JSON.stringify(session))

  return { reply: assistantMessage, session_key: sessionKey }
}