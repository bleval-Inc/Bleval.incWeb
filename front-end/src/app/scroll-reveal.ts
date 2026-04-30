import { Directive, ElementRef, AfterViewInit, Renderer2, Input, OnDestroy } from '@angular/core';

/**
 * Unified scroll reveal directive — single source of truth for cinematic
 * vertical page-turn animations across the entire application.
 *
 * Usage:
 *   <div appScrollReveal>                    — basic fade-up
 *   <div appScrollReveal="stagger-3">        — with stagger delay class
 *   <div appScrollReveal revealDelay="300">  — inline delay in ms
 *   <div appScrollReveal class="stagger-children"> — auto-stagger children
 */
@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements AfterViewInit, OnDestroy {
  @Input() appScrollReveal: string = '';
  @Input() revealDelay: string = '';

  private static observer: IntersectionObserver | null = null;
  private static observedElements = new WeakSet<HTMLElement>();

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    const el = this.el.nativeElement as HTMLElement;

    if (this.appScrollReveal) {
      this.renderer.addClass(el, this.appScrollReveal);
    }

    this.renderer.addClass(el, 'scroll-reveal');

    const delay = this.parseDelay();
    if (delay > 0) {
      el.style.transitionDelay = `${delay}ms`;
    }

    if (el.classList.contains('stagger-children')) {
      this.addStaggerChildren(el);
    }

    this.initObserver();
    this.observeRevealElements();
  }

  private initObserver() {
    if (ScrollRevealDirective.observer || typeof IntersectionObserver === 'undefined') {
      return;
    }

    ScrollRevealDirective.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.reveal(entry.target as HTMLElement);
            ScrollRevealDirective.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
  }

  private observeRevealElements() {
    if (typeof document === 'undefined') {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll<HTMLElement>('.scroll-reveal').forEach((element) => {
        this.reveal(element);
      });
      return;
    }

    const elements = Array.from(document.querySelectorAll<HTMLElement>('.scroll-reveal'));
    elements.forEach((element) => {
      if (!ScrollRevealDirective.observedElements.has(element)) {
        ScrollRevealDirective.observedElements.add(element);
        ScrollRevealDirective.observer?.observe(element);
      }
    });
  }

  private addStaggerChildren(parent: HTMLElement) {
    Array.from(parent.children).forEach((child, index) => {
      const target = child as HTMLElement;
      this.renderer.addClass(target, 'scroll-reveal');
      target.style.transitionDelay = `${index * 80}ms`;
    });
  }

  private reveal(el: HTMLElement) {
    this.renderer.addClass(el, 'revealed');
  }

  private parseDelay(): number {
    if (!this.revealDelay) return 0;
    const val = parseFloat(this.revealDelay);
    if (isNaN(val)) return 0;
    return val < 50 ? val * 1000 : val;
  }

  ngOnDestroy() {
    // Keep the shared observer active for other reveal elements.
  }
}

