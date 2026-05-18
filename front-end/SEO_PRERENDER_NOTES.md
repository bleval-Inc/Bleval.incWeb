# SEO prerender notes (Bleval.inc)

This project currently uses Angular SSR (`@angular/ssr`) with an Express server that renders Angular routes.

Observed scripts in `front-end/package.json`:
- `npm run build` (client/browser + server output)
- `npm run serve:ssr:bleval-inc` (serves the SSR server from `dist/bleval-inc/server/server.mjs`)

There is **no** `npm run prerender` script currently present.

## How to prerender (what to verify)
Because `app.routes.server.ts` sets `renderMode: RenderMode.Prerender` for `**`, Angular’s SSR build output may already generate prerendered HTML for matching routes.

Validation to run after build:
1. Run `npm run build`.
2. Start SSR server (or host it): `npm run serve:ssr:bleval-inc`.
3. Fetch HTML for these routes and confirm title/meta/canonical/JSON-LD are present in raw HTML (not injected after JS):
   - https://bleval.inc/
   - https://bleval.inc/services
   - https://bleval.inc/pricing
   - https://bleval.inc/contact

## Required checks for production
- Confirm sitemap and robots reachable.
- Confirm Search Console sees pages as HTML-crawled.
- Confirm structured data is valid via Rich Results Test.

