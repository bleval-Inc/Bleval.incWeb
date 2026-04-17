import { db } from '../../db/index.js'
import { redis } from '../../db/redis.js'

// Generic adapter — swap fetch URL per client CMS config
async function fetchFromCMS(client) {
  const cmsUrl = client.config?.cms_url
  if (!cmsUrl) return []

  const res = await fetch(cmsUrl)
  const data = await res.json()

  // Normalize to our schema (adjust per CMS response shape)
  return data.posts?.map(p => ({
    external_id: String(p.id),
    slug:         p.slug,
    title:        p.title,
    excerpt:      p.excerpt || p.description || '',
    content:      p.html || p.content || '',
    author:       p.author?.name || '',
    cover_image:  p.feature_image || p.cover || '',
    tags:         (p.tags || []).map(t => t.name || t),
    published_at: p.published_at || p.date,
  })) ?? []
}

export async function refreshBlog(client) {
  const posts = await fetchFromCMS(client)
  if (!posts.length) return { synced: 0 }

  for (const post of posts) {
    await db.query(
      `INSERT INTO blog_posts (client_id, external_id, slug, title, excerpt, content, author, cover_image, tags, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (client_id, slug) DO UPDATE SET
         title = EXCLUDED.title, excerpt = EXCLUDED.excerpt,
         content = EXCLUDED.content, cover_image = EXCLUDED.cover_image,
         tags = EXCLUDED.tags, fetched_at = now()`,
      [client.id, post.external_id, post.slug, post.title, post.excerpt,
       post.content, post.author, post.cover_image, post.tags, post.published_at]
    )
  }

  // Invalidate cache
  await redis.del(`blog:${client.id}:list`)
  return { synced: posts.length }
}

export async function getBlogPosts(client, { limit = 10, offset = 0, tag } = {}) {
  const cacheKey = `blog:${client.id}:list:${limit}:${offset}:${tag || ''}`
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const tagFilter = tag ? `AND $4 = ANY(tags)` : ''
  const params = [client.id, limit, offset, ...(tag ? [tag] : [])]

  const { rows } = await db.query(
    `SELECT id, slug, title, excerpt, author, cover_image, tags, published_at
     FROM blog_posts
     WHERE client_id = $1 ${tagFilter}
     ORDER BY published_at DESC
     LIMIT $2 OFFSET $3`,
    params
  )

  await redis.setEx(cacheKey, 300, JSON.stringify(rows)) // 5 min cache
  return rows
}

export async function getBlogPost(client, slug) {
  const { rows } = await db.query(
    `SELECT * FROM blog_posts WHERE client_id = $1 AND slug = $2`,
    [client.id, slug]
  )
  return rows[0] || null
}