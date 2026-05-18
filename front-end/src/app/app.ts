import {
  Component,
  signal,
  AfterViewInit,
  ElementRef,
  Renderer2,
  HostListener,
  OnDestroy,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { SeoService } from './core/seo.service';
import { SEO_BASE_URL } from './core/seo.config';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './core/api.service';
import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';
import { ChatbotComponent } from './chatbot/chatbot';
import { ToastComponent } from './toast/toast.component';
import { AnalyticsService } from './core/analytics.service';
import { filter } from 'rxjs/internal/operators/filter';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, Navbar, Footer, ChatbotComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit, OnDestroy {

  protected readonly isScrolled = signal(false);
  bookingOpen = signal(false);
  bookingLoading = signal(false);
  bookingSuccess = signal(false);
  bookingError = signal(false);

  bookingName = '';
  bookingEmail = '';
  bookingPhone = '';
  bookingService = '';
  bookingDate = '';
  bookingTime = '';
  bookingNotes = '';

  private submitTimeoutId: number | null = null;


  readonly serviceOptions = [
    'Web Design',
    'Web Development',
    'E-Commerce Solutions',
    'Maintenance & Growth'
  ];
  private rafId: number | null = null;
  private isTouchDevice = false;
  private footerRafId: number | null = null;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private api: ApiService,
    private router: Router,
    private analytics: AnalyticsService,
    private seo: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: any) => {
      this.analytics.trackPageView(event.urlAfterRedirects);

      // SEO updates (route-driven). Must not break GA4 tracking.
      if (isPlatformBrowser(this.platformId)) {
        const url = event?.urlAfterRedirects ?? event?.url ?? this.router.url;
        const pathname = (() => {
          try {
            // Prefer extracting pathname from full URL.
            return new URL(url, SEO_BASE_URL).pathname;
          } catch {
            return (this.router.url || '/').split('?')[0].split('#')[0];
          }
        })();

        const routeKey = this.seo.routeKeyFromPath(pathname);
        this.seo.applyForRoute(routeKey, pathname);
      }
    }); }

  /* ═══════════════════════════════════════════════════════════════
     SCROLL HANDLER
     ═══════════════════════════════════════════════════════════════ */
  @HostListener('window:scroll', [])
  onScroll() {
    if (!isPlatformBrowser(this.platformId)) return;

    const scrollY = window.scrollY;
    this.isScrolled.set(scrollY > 120);

    // Debounce footer reveal via RAF
    if (this.footerRafId !== null) {
      cancelAnimationFrame(this.footerRafId);
    }
    this.footerRafId = requestAnimationFrame(() => this.updateFooterReveal());

    // Navbar scroll state
    const nav = this.el.nativeElement.querySelector('app-navbar .navbar') as HTMLElement;
    if (nav) {
      nav.classList.toggle('scrolled', scrollY > 50);
    }
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private bookingModalOpenedFired = false

  private getCurrentRouteForAnalytics(): string {
    try {
      return this.router.url || '/'
    } catch {
      return '/'
    }
  }

  toggleBookingPopup() {
    const willOpen = !this.bookingOpen()
    this.bookingOpen.update(() => !this.bookingOpen())

    if (willOpen) {
      if (!this.bookingModalOpenedFired) {
        this.bookingModalOpenedFired = true
        this.analytics.trackEvent('booking_modal_opened', {
          source: this.getCurrentRouteForAnalytics(),
        })
      }

      this.bookingSuccess.set(false);
    } else {
      this.bookingOpen.set(false)
      this.resetBookingForm();
      this.bookingModalOpenedFired = false
    }
  }


  closeBookingPopup() {
    this.bookingOpen.set(false);
    this.resetBookingForm();
  }

  submitBooking() {
    // Frontend validation (template also disables submit)
    if (
      !this.bookingName.trim() ||
      !this.bookingEmail.trim() ||
      !this.bookingPhone.trim() ||
      !this.bookingService ||
      !this.bookingDate ||
      !this.bookingTime
    ) {
      return;
    }

    // Prevent duplicate submits
    if (this.bookingLoading()) return;

    this.bookingError.set(false);
    this.bookingSuccess.set(false);
    this.bookingLoading.set(true);

    if (this.submitTimeoutId !== null) {
      window.clearTimeout(this.submitTimeoutId);
    }

    const timeoutPromise = new Promise<never>((_, reject) => {
      this.submitTimeoutId = window.setTimeout(() => {
        reject(new Error('Request timed out'));
      }, 20000);
    });

    const payload = {
      name: this.bookingName.trim(),
      email: this.bookingEmail.trim(),
      phone: this.bookingPhone.trim(),
      service: this.bookingService,
      date: this.bookingDate,
      time: this.bookingTime,
      notes: this.bookingNotes?.trim() || undefined,
      source: 'booking_modal' as const
    };


    Promise.race([
      new Promise((resolve, reject) => {
        this.api.createBooking(payload as any).subscribe({
          next: (r) => resolve(r),
          error: (e) => reject(e),
        })
      }),

      timeoutPromise
    ])
      .then(() => {

        if (this.submitTimeoutId !== null) {
          window.clearTimeout(this.submitTimeoutId);
          this.submitTimeoutId = null;
        }
        this.bookingLoading.set(false);
        this.bookingSuccess.set(true);
        this.bookingError.set(false);

        this.analytics.trackEvent('booking_request_submitted', {
          source: this.getCurrentRouteForAnalytics(),
        })

        this.resetBookingForm(true);
      })
      .catch((err) => {
        console.error('BOOKING MODAL SUBMIT ERROR:', err);
        if (this.submitTimeoutId !== null) {
          window.clearTimeout(this.submitTimeoutId);
          this.submitTimeoutId = null;
        }
        this.bookingLoading.set(false);
        this.bookingSuccess.set(false);
        this.bookingError.set(true);
      });
  }

  private resetBookingForm(keepSuccess = false) {
    this.bookingName = '';
    this.bookingEmail = '';
    this.bookingPhone = '';
    this.bookingService = '';
    this.bookingDate = '';
    this.bookingTime = '';
    this.bookingNotes = '';

    this.bookingLoading.set(false);
    if (!keepSuccess) {
      this.bookingSuccess.set(false);
      this.bookingError.set(false);
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     FOOTER REVEAL — TRUE LAYERED SYSTEM
     Main content slides UP, footer revealed BEHIND it
     ═══════════════════════════════════════════════════════════════ */
  private updateFooterReveal() {
    if (!isPlatformBrowser(this.platformId)) return;

    const mainContent = this.el.nativeElement.querySelector('#mainContent') as HTMLElement;
    const footer = this.el.nativeElement.querySelector('#footerLayer') as HTMLElement;
    if (!mainContent || !footer) return;

    const footerHeight = footer.offsetHeight;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollable = docHeight - winHeight;
    const scrollProgress = scrollTop / Math.max(scrollable, 1);

    // Start revealing when within 1.5x footer height of bottom; never translate before scroll begins
    const revealStart = Math.max(0, 1 - (footerHeight * 1.5 / Math.max(scrollable, 1)));
    const activeRange = Math.max(1 - revealStart, 0.0001);
    const clampedProgress = Math.max(0, Math.min(1, (scrollProgress - revealStart) / activeRange));

    // Apply translateY to main content (slides up to reveal footer beneath)
    const translateY = -clampedProgress * footerHeight;
    mainContent.style.transform = `translateY(${translateY}px)`;
    mainContent.style.transition = clampedProgress > 0 && clampedProgress < 1
      ? 'none'
      : `transform var(--duration-long) var(--ease-bounce)`;
  }

  /* ═══════════════════════════════════════════════════════════════
     CURSOR — Desktop only, disabled on touch
     ═══════════════════════════════════════════════════════════════ */
  private initCursor() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Detect touch device
    this.isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (this.isTouchDevice) return;

    const cursor = this.el.nativeElement.querySelector('#cursor') as HTMLElement;
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    this.renderer.listen('document', 'mousemove', (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      this.renderer.setStyle(cursor, 'opacity', '1');
    });

    this.renderer.listen('document', 'mouseleave', () => {
      this.renderer.setStyle(cursor, 'opacity', '0');
    });

    // Smooth cursor follow loop
    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      this.renderer.setStyle(cursor, 'left', `${cursorX}px`);
      this.renderer.setStyle(cursor, 'top', `${cursorY}px`);
      this.rafId = requestAnimationFrame(animate);
    };
    this.rafId = requestAnimationFrame(animate);

    // Hover effects for interactive elements
    const addHoverListeners = () => {
      const interactive = this.el.nativeElement.querySelectorAll('a, button, input, select, textarea, [role="button"]');
      interactive.forEach((el: Element) => {
        this.renderer.listen(el, 'mouseenter', () => this.renderer.addClass(cursor, 'hover'));
        this.renderer.listen(el, 'mouseleave', () => this.renderer.removeClass(cursor, 'hover'));
      });
    };

    // Delay to ensure DOM is ready after navigation
    setTimeout(addHoverListeners, 500);
  }

  /* ═══════════════════════════════════════════════════════════════
     LIFECYCLE
     ═══════════════════════════════════════════════════════════════ */
  private handleBookingQueryTrigger() {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const url = new URL(window.location.href);
      const shouldBook = url.searchParams.get('book') === '1';
      if (!shouldBook) return;

      const plan = (url.searchParams.get('plan') || '').toLowerCase();
      this.openBookingModalWithOnboardingPrefill(plan);

      // Remove trigger params so it won't re-open on refresh.
      url.searchParams.delete('book');
      url.searchParams.delete('plan');
      const remaining = Object.fromEntries(url.searchParams.entries());
      this.router.navigate([url.pathname], { replaceUrl: true, queryParams: remaining });
    } catch {
      // no-op
    }
  }

  private openBookingModalWithOnboardingPrefill(plan: string) {
    // Prefill from existing onboarding localStorage.
    // Keep resilient: never block booking modal open if parsing fails.
    let onboarding: any = null;
    try {
      const raw = localStorage.getItem('bleval.onboarding.v1');
      onboarding = raw ? JSON.parse(raw) : null;
    } catch {
      onboarding = null;
    }

    if (typeof onboarding?.name === 'string' && onboarding.name.trim()) this.bookingName = onboarding.name.trim();
    if (typeof onboarding?.email === 'string' && onboarding.email.trim()) this.bookingEmail = onboarding.email.trim();
    if (typeof onboarding?.phone === 'string' && onboarding.phone.trim()) this.bookingPhone = onboarding.phone.trim();

    // Service inference (best-effort). Modal requires bookingService, but will remain empty if we can't map.
    const inferredService =
      plan === 'enterprise'
        ? 'Full CRM/booking/payment stack'
        : plan === 'acceleration' || plan === 'growth'
          ? 'Maintenance & Growth'
          : plan === 'foundation' || plan === 'starter'
            ? 'Web Design'
            : '';

    if (inferredService) this.bookingService = inferredService;

    this.bookingSuccess.set(false);
    this.bookingError.set(false);
    this.bookingLoading.set(false);
    this.bookingOpen.set(true);
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initCursor();
      this.handleBookingQueryTrigger();
      // Initial footer reveal calc
      requestAnimationFrame(() => this.updateFooterReveal());
    }
  }


  ngOnDestroy() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.footerRafId !== null) {
      cancelAnimationFrame(this.footerRafId);
    }
  }
}

