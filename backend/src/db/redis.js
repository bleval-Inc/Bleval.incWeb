import { createClient } from 'redis'
import { env } from '../config/env.js'

export const redisClient = createClient({
  url: env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false  // Upstash specific
  },
  maxRetriesPerRequest: 10,
  retryDelay: 200,  // base ms for exponential backoff
  retryStrategy: (times) => {
    const delay = Math.min(times * 200, 5000)
    console.log(`Redis retry ${times}, delay ${delay}ms`)
    return delay
  }
})

redisClient.on('error', (err) => {
  console.warn('Redis client error (non-fatal):', err.message)
})

redisClient.on('connect', () => {
  console.log('🔗 Redis connecting...')
})

redisClient.on('ready', () => {
  console.log('✅ Redis ready')
})

let isConnected = false

export const redis = {
  async connect() {
    if (!isConnected) {
      try {
        await Promise.race([
          redisClient.connect(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Connect timeout')), 10000))
        ])
        isConnected = true
      } catch (err) {
        console.warn('Redis connect failed:', err.message)
        isConnected = false
        // Do not throw - degrade gracefully
      }
    }
    return isConnected
  },

  async ping() {
    try {
      await this.connect()
      if (!isConnected) return false
      const result = await redisClient.ping()
      return result === 'PONG'
    } catch (err) {
      console.warn('Redis ping fail:', err.message)
      return false
    }
  },

  async disconnect() {
    if (isConnected) {
      try {
        await redisClient.disconnect()
      } catch (err) {
        console.warn('Redis disconnect fail:', err.message)
      }
      isConnected = false
    }
  },

  async get(key) {
    try {
      await this.connect()
      if (!isConnected) return null
      const value = await redisClient.get(key)
      return value || null
    } catch (err) {
      console.warn(`Redis get(${key}) fail:`, err.message)
      return null
    }
  },

  async set(key, value, exSeconds = null) {
    try {
      await this.connect()
      if (!isConnected) return false
      const options = exSeconds ? { EX: exSeconds } : {}
      const result = await redisClient.set(key, value, options)
      return result === 'OK'
    } catch (err) {
      console.warn(`Redis set(${key}) fail:`, err.message)
      return false
    }
  },

  async del(...keys) {
    try {
      await this.connect()
      if (!isConnected) return 0
      const result = await redisClient.del(keys)
      return result
    } catch (err) {
      console.warn(`Redis del fail:`, err.message)
      return 0
    }
  },

  get raw() {
    return redisClient
  }
}

