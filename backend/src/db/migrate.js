import { readFileSync } from 'fs'
import { db } from './index.js'

const sql = readFileSync(
  new URL('./migrations/001_init.sql', import.meta.url),
  'utf8'
)

try {
  await db.query(sql)
  console.log('Migration complete')
} catch (err) {
  console.error('Migration failed:', err.message)
} finally {
  await db.end()
}