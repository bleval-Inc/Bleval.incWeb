# Bleval.inc SEO System (Angular SPA)

This repository now includes a production-oriented SEO system for the Angular SPA.

## What was added/updated
- **Dynamic per-route meta updates** via `SeoService`.
- **Central SEO map** in `src/app/core/seo.config.ts`.
- **Organization + WebSite + LocalBusiness JSON-LD** injected in `src/index.html`.
- **robots.txt** and **sitemap.xml** added in `front-end/public/`.

## Key files
- `front-end/src/app/core/seo.service.ts`
- `front-end/src/app/core/seo.config.ts`
- `front-end/src/app/app.ts` (hooks SEO into `NavigationEnd`, preserving GA4)
- `front-end/src/index.html` (JSON-LD + canonical)
- `front-end/public/sitemap.xml`
- `front-end/public/robots.txt`

## How it works (route SEO)
On every `NavigationEnd`, `App` calls:
- `seo.routeKeyFromPath(pathname)`
- `seo.applyForRoute(routeKey, pathname)`

This updates:
- `<title>`
- meta `description`
- meta `keywords` (when configured)
- `<link rel="canonical">`

Duplicate meta tags are prevented by using a deterministic marker (`data-bleval-seo-id`).

## Build / deploy
### Front-end build
From `front-end/`:
```bash
npm run build
```

Sitemap + robots are served from the built output (from `public/`).

## Prerendering note (important)
This codebase is currently an Angular client-only build (SPA). For true Googlebot HTML prerendering, the site must be built with SSR/Universal or a static prerender pipeline.

This PR implements the SEO *system* and generates sitemap/robots, but does not convert the project to SSR/SSG (because that requires Angular SSR tooling + server changes).

If you want me to add SSR/SSG next, the required next step is to confirm your preferred target (Angular SSR with `@angular/ssr` or a static prerender tool), and your hosting constraints.

