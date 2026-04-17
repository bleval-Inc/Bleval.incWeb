import { Component, ElementRef, AfterViewInit, OnDestroy, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements AfterViewInit, OnDestroy {
  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  @ViewChild('statsGrid', { static: false }) statsGrid!: ElementRef<HTMLDivElement>;

  private observer!: IntersectionObserver;
  private revealObserver!: IntersectionObserver;
  private counters: { el: HTMLElement; target: number; current: number }[] = [];
  private counterSelectors = ['.stat-large .number:nth-child(1)', '.stat-large .number:nth-child(3)', '.stat-large .number:nth-child(5)'];

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => {
        this.setupCounters();
        this.initScrollReveal();
      });
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.revealObserver) {
      this.revealObserver.disconnect();
    }
  }

  private setupCounters() {
    this.counterSelectors.forEach((selector, index) => {
      const el = this.elementRef.nativeElement.querySelector(selector) as HTMLElement;
      if (el) {
        const targets = [20, 90, 4];
        this.counters.push({ el, target: targets[index], current: 0 });
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounters();
            this.observer.unobserve(entry.target as Element);
          }
        });
      }, { threshold: 0.15 });

      if (this.statsGrid?.nativeElement) {
        this.observer.observe(this.statsGrid.nativeElement);
      }
    }
  }

  private animateCounters() {
    const duration = 2000;
    const step = 50;
    const targets = [50, 98, 4];
    const suffixes = ['+', '%', 'wks'];

    this.counters.forEach((counter, index) => {
      const increment = counter.target / (duration / step);
      const timer = setInterval(() => {
        counter.current += increment;
        if (counter.current >= counter.target) {
          counter.current = counter.target;
          clearInterval(timer);
        }
        counter.el.textContent = Math.floor(counter.current) + suffixes[index];
      }, step);
    });
  }

  private isInViewport(el: Element): boolean {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
  }

  private initScrollReveal() {
    if (isPlatformBrowser(this.platformId)) {
      const reveals = this.elementRef.nativeElement.querySelectorAll('.scroll-reveal') as NodeListOf<Element>;
      this.revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const revealsList = Array.from(reveals);
            const index = revealsList.indexOf(entry.target as Element);
            setTimeout(() => {
              entry.target.classList.add('revealed');
            }, index * 80);
            this.revealObserver.unobserve(entry.target as Element);
          }
        });
      }, { 
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      });

      reveals.forEach((reveal: Element, index: number) => {
        this.revealObserver.observe(reveal);
        if (this.isInViewport(reveal)) {
          setTimeout(() => {
            reveal.classList.add('revealed');
          }, index * 80);
          this.revealObserver.unobserve(reveal);
        }
      });
    }
  }
}
