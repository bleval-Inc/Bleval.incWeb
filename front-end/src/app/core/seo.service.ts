import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Meta } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

import { SEO_BASE_URL, SEO_CONFIG, type SeoRouteKey } from './seo.config';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  [x: string]: any;
  private readonly META_ID_PREFIX = 'bleval.seo:';

  // Track last applied values to avoid redundant DOM churn.
  private last = {
    title: '',
    description: '',
    keywords: [] as string[],
    canonical: '',
  };

  constructor(
    private titleService: Title,
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  setTitle(title: string) {
    if (!title) return;
    if (this.last.title === title) return;
    this.last.title = title;
    this.titleService.setTitle(title);
  }

  setDescription(description: string) {
    if (description == null) return;
    const value = String(description);
    if (this.last.description === value) return;
    this.last.description = value;

    this.upsertMeta({
      key: 'description',
      name: 'description',
      content: value,
    });
  }

  setKeywords(keywords: string[]) {
    const list = (keywords ?? []).filter(Boolean).map((k) => String(k));
    if (this.arraysEqual(this.last.keywords, list)) return;
    this.last.keywords = list;

    if (list.length === 0) {
      // Remove keywords tag if present.
      this.removeMetaById(this.tagId('keywords'));
      return;
    }

    this.upsertMeta({
      key: 'keywords',
      name: 'keywords',
      content: list.join(', '),
    });
  }

  setCanonical(url: string) {
    if (!url) return;
    if (this.last.canonical === url) return;
    this.last.canonical = url;

    // Use Angular Meta service (safe) but also ensure no duplicates by using a deterministic selector.
    // Meta service supports tags by name/property, but canonical is a link tag.
    if (!isPlatformBrowser(this.platformId)) return;

    const doc = document;
    const head = doc.head;

    const existing = head.querySelector(`link[rel="canonical"]`) as HTMLLinkElement | null;
    if (existing) {
      existing.href = url;
      return;
    }

    const link = doc.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.href = url;
    head.appendChild(link);
  }

  /**
   * Apply the SEO definition for a known route key.
   */
  applyForRoute(routeKey: SeoRouteKey, canonicalPath: string) {
    const entry = SEO_CONFIG[routeKey] ?? SEO_CONFIG.home;
    const canonicalUrl = this.toCanonicalUrl(canonicalPath);

    this.setTitle(entry.title);
    this.setDescription(entry.description);
    this.setKeywords(entry.keywords);

    this.upsertOpenGraph({
      url: canonicalUrl,
      title: entry.title,
      description: entry.description,
    });

    this.upsertTwitter({
      title: entry.title,
      description: entry.description,
    });

    this.setCanonical(canonicalUrl);
  }

  /**
   * Convenience: map current path to our central config.
   */
  routeKeyFromPath(pathname: string): SeoRouteKey {
    const p = (pathname || '').split('?')[0].split('#')[0];

    if (p === '/' || p === '' || p === '/home') return 'home';
    if (p === '/services') return 'services';
    if (p === '/pricing') return 'pricing';
    if (p === '/contact') return 'contact';
    if (p === '/onboarding') return 'onboarding';
    if (p === '/onboarding/success') return 'onboardingSuccess';
    if (p === '/about') return 'about';
    if (p === '/work') return 'work';
    if (p === '/blog') return 'blog';

    // Default to home to keep consistent canonical + branding.
    return 'home';
  }

  private toCanonicalUrl(canonicalPath: string) {
    const path = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    return `${SEO_BASE_URL}${path}`;
  }

  private tagId(key: string) {
    return `${this.META_ID_PREFIX}${key}`;
  }

  private upsertOpenGraph(opts: { url: string; title: string; description: string }) {
    this.upsertMeta({ key: 'og:title', name: 'og:title', content: opts.title });
    this.upsertMeta({ key: 'og:description', name: 'og:description', content: opts.description });
    this.upsertMeta({ key: 'og:url', name: 'og:url', content: opts.url });
  }

  private upsertTwitter(opts: { title: string; description: string }) {
    this.upsertMeta({ key: 'twitter:title', name: 'twitter:title', content: opts.title });
    this.upsertMeta({ key: 'twitter:description', name: 'twitter:description', content: opts.description });
    this.upsertMeta({ key: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' });
  }

  private upsertMeta(opts: { key: string; name: string; content: string }) {
    if (!isPlatformBrowser(this.platformId)) {

      // Still allow Title updates server-side; Meta is ok too but canonical/link is browser-only.
    }

    const id = this.tagId(opts.key);

    // Use name selector + deterministic id attribute to avoid duplicates.
    const selector = `meta[name="${opts.name}"][data-bleval-seo-id="${id}"]`;

    // Defensive: selector syntax issues must never break navigation/runtime.
    let existing: any = null;
    try {
      existing = this.meta.getTag(selector);
    } catch {
      existing = null;
    }


    if (existing) {
      this.meta.updateTag({
        name: opts.name,
        content: opts.content,
      });

      // Ensure data-bleval-seo-id is present (Meta.updateTag might not preserve it).
      if (isPlatformBrowser(this.platformId)) {
        const el = document.head.querySelector(selector) as HTMLMetaElement | null;
        if (el) el.setAttribute('data-bleval-seo-id', id);
      }

      return;
    }

    // First, remove any plain meta[name] duplicates without our id.
    if (isPlatformBrowser(this.platformId)) {
      const selectorNoId = `meta[name="${opts.name}"]`;
      document.head.querySelectorAll(selectorNoId).forEach((m) => {
        const me = m as HTMLMetaElement;
        if (!me.getAttribute('data-bleval-seo-id')) me.remove();
      });
    }

    // Insert tag with a deterministic data attribute.
    if (isPlatformBrowser(this.platformId)) {
      const metaEl = document.createElement('meta');
      metaEl.setAttribute('name', opts.name);
      metaEl.setAttribute('content', opts.content);
      metaEl.setAttribute('data-bleval-seo-id', id);
      document.head.appendChild(metaEl);
    } else {
      // Fallback for non-browser.
      this.meta.addTag({
        name: opts.name,
        content: opts.content,
      });
    }
  }

  private removeMetaById(id: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    const selector = `meta[data-bleval-seo-id="${id}"]`;
    document.head.querySelectorAll(selector).forEach((el) => el.remove());
  }

  private arraysEqual(a: string[], b: string[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}

