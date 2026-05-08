import { Queue } from 'bullmq'
import { env } from '../config/env.js'

const connection = {
  url: env.REDIS_URL,
  maxRetriesPerRequest: null,
}

export const emailQueue = new Queue('email', {
  connection,
})

export const blogQueue = new Queue('blog', {
  connection,
})

export const sequenceQueue = new Queue('sequence', {
  connection,
})