import { Component, ElementRef, AfterViewInit, OnDestroy, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ScrollRevealDirective } from '../scroll-reveal';
import { SeoService } from '../core/seo.service';
import { SEO_CONFIG } from '../core/seo.config';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, ScrollRevealDirective],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements AfterViewInit, OnDestroy {
  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private seo: SeoService
  ) {}

  @ViewChild('statsGrid', { static: false }) statsGrid!: ElementRef<HTMLDivElement>;

  private counterObserver!: IntersectionObserver;
  private counters: { el: HTMLElement; target: number; current: number; suffix: string }[] = [];

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => {
        this.setupCounters();
      });
    }
  }

  ngOnInit() {
    this.seo.applyForRoute('home', '/home');
  }


  ngOnDestroy() {
    this.counterObserver?.disconnect();
  }

  private setupCounters() {
    const statEls = this.elementRef.nativeElement.querySelectorAll('.stat-large .number') as NodeListOf<HTMLElement>;
    const targets = [50, 98, 4];
    const suffixes = ['+', '%', 'wks'];

    statEls.forEach((el, index) => {
      if (targets[index] !== undefined) {
        this.counters.push({ el, target: targets[index], current: 0, suffix: suffixes[index] });
      }
    });

    if (this.statsGrid?.nativeElement && this.counters.length > 0) {
      this.counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounters();
            this.counterObserver.unobserve(entry.target as Element);
          }
        });
      }, { threshold: 0.15 });

      this.counterObserver.observe(this.statsGrid.nativeElement);
    }
  }

  private animateCounters() {
    const duration = 2000;
    const step = 50;

    this.counters.forEach((counter) => {
      const increment = counter.target / (duration / step);
      const timer = setInterval(() => {
        counter.current += increment;
        if (counter.current >= counter.target) {
          counter.current = counter.target;
          clearInterval(timer);
        }
        counter.el.textContent = Math.floor(counter.current) + counter.suffix;
      }, step);
    });
  }
}

