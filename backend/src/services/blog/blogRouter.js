import { Router } from 'express'
import { getBlogPosts, getBlogPost, refreshBlog } from './blogService.js'
import { requireMasterKey } from '../../middleware/auth.js'

export const blogRouter = Router()

blogRouter.get('/', async (req, res, next) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit  || '10'), 50)
    const offset = parseInt(req.query.offset || '0')
    const tag    = req.query.tag || null
    const posts  = await getBlogPosts(req.client, { limit, offset, tag })
    res.json({ posts })
  } catch (err) { next(err) }
})

blogRouter.get('/:slug', async (req, res, next) => {
  try {
    const post = await getBlogPost(req.client, req.params.slug)
    if (!post) return res.status(404).json({ error: 'Not found' })
    res.json(post)
  } catch (err) { next(err) }
})

// Admin: manually trigger a blog refresh
blogRouter.post('/refresh', requireMasterKey, async (req, res, next) => {
  try {
    const result = await refreshBlog(req.client)
    res.json(result)
  } catch (err) { next(err) }
})