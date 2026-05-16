# Bleval.inc SEO Prerender (Phases 5–7)

This document describes the Angular SSR/prerender setup added to complete the production SEO system.

## What changed
- Added Angular Universal SSR/prerender entrypoints
- Added a prerender target to build static HTML for the main SEO routes

## Prerender routes (minimum)
- `/`
- `/services`
- `/pricing`
- `/contact`

(Optionally also included when present in `seo.config.ts` / router.)

## Build commands
From `front-end/`:

```bash
npm run build
npm run build:server

```

## Validate
- Confirm prerendered route HTML is emitted
- Confirm `<title>`, `<meta name="description">`, `<link rel="canonical">`, and JSON-LD exist in prerender output
- Run Lighthouse against production build

