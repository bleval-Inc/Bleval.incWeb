import pg from 'pg'
import { env } from '../config/env.js'

const { Pool } = pg

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 60000,     // 60s
  connectionTimeoutMillis: 20000, // 20s
  allowExitOnIdle: false,
  ssl: { rejectUnauthorized: false },
})

db.on('error', (err) => {
  console.warn('Postgres pool error (non-fatal):', err.message)
})

db.on('connect', () => {
  console.log('🔗 Postgres pool connecting...')
})

db.on('acquire', () => {
  console.log('📥 Postgres pool acquire connection')
})

