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
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';
import { ChatbotComponent } from './chatbot/chatbot';
import { ToastComponent } from './toast/toast.component';

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

  bookingName = '';
  bookingService = '';
  bookingDate = '';

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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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

  toggleBookingPopup() {
    this.bookingOpen.update(value => !value);
    if (!this.bookingOpen()) {
      this.resetBookingForm();
    } else {
      this.bookingSuccess.set(false);
    }
  }

  closeBookingPopup() {
    this.bookingOpen.set(false);
    this.resetBookingForm();
  }

  submitBooking() {
    if (!this.bookingName.trim() || !this.bookingService || !this.bookingDate) {
      return;
    }

    this.bookingLoading.set(true);
    setTimeout(() => {
      this.bookingLoading.set(false);
      this.bookingSuccess.set(true);
    }, 900);
  }

  private resetBookingForm() {
    this.bookingName = '';
    this.bookingService = '';
    this.bookingDate = '';
    this.bookingLoading.set(false);
    this.bookingSuccess.set(false);
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
  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initCursor();
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

