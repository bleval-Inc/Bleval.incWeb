import { Injectable } from '@angular/core';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {

  trackPageView(url: string): void {
    if (!window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });

    console.log('[GA4] Page View:', url);
  }

  trackEvent(
    eventName: string,
    params: Record<string, any> = {}
  ): void {
    if (!window.gtag) return;

    window.gtag('event', eventName, params);

    console.log('[GA4] Event:', eventName, params);
  }
}