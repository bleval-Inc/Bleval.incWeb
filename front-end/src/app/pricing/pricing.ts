import { Component, AfterViewInit, ElementRef, Inject, PLATFORM_ID, ViewChild, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../scroll-reveal';
import { AnalyticsService } from '../core/analytics.service';


@Component({
  selector: 'app-pricing',
  imports: [CommonModule, RouterLink, ScrollRevealDirective],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss',
})
export class Pricing implements AfterViewInit, OnDestroy {
  @ViewChildren('faqItem') faqItems!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren('faqQuestion') faqQuestions!: QueryList<ElementRef<HTMLButtonElement>>;

  private readonly pricingClickListener = this.handlePricingClick.bind(this);
  private pricingHostElement: HTMLElement | null = null;
  private trackFired = new Set<string>()

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private elementRef: ElementRef,
    private analytics: AnalyticsService
  ) {}

  trackPricingPlanSelected(plan: 'foundation' | 'growth' | 'enterprise') {
    const key = `pricing_plan_selected:${plan}`

    if (this.trackFired.has(key)) return
    this.trackFired.add(key)

    const map: Record<typeof plan, { monthly: number; setup_fee: number; displayPlan: string }> = {
      foundation: { monthly: 1299, setup_fee: 6000, displayPlan: 'Foundation' },
      growth: { monthly: 2999, setup_fee: 14000, displayPlan: 'Growth' },
      enterprise: { monthly: 5999, setup_fee: 25000, displayPlan: 'Enterprise' },
    }

    const v = map[plan]
    this.analytics.trackEvent('pricing_plan_selected', {
      plan: v.displayPlan,
      monthly: v.monthly,
      setup_fee: v.setup_fee,
    })
  }


  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const host = this.elementRef?.nativeElement as HTMLElement | null;
    this.pricingHostElement = host instanceof HTMLElement
      ? host
      : document.querySelector('app-pricing') ?? document.body;

    this.pricingHostElement.addEventListener('click', this.pricingClickListener);
  }

  ngOnDestroy() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.pricingHostElement) {
      this.pricingHostElement.removeEventListener('click', this.pricingClickListener);
    }
  }

  private handlePricingClick(event: Event) {
    const target = event.target as HTMLElement;
    const button = target.closest('.accordion-button, .accelerator-toggle, .faq-question') as HTMLButtonElement | null;
    if (!button) return;

    event.preventDefault();

    if (button.classList.contains('faq-question')) {
      const faqIndex = this.faqQuestions.toArray().findIndex((question) => question.nativeElement === button);
      if (faqIndex >= 0) {
        this.toggleFaq(faqIndex);
      }
      return;
    }

    this.toggleAccordion(button);
  }

  private toggleAccordion(button: HTMLButtonElement) {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', (!isExpanded).toString());
  }

  private toggleFaq(activeIndex: number) {
    // Close all items first
    this.faqItems.forEach((itemRef, index) => {
      const item = itemRef.nativeElement;
      const answer = item.querySelector('.faq-answer') as HTMLElement;
      if (index !== activeIndex) {
        item.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0px';
      }
    });

    // Toggle active item
    const activeItem = this.faqItems.get(activeIndex)?.nativeElement;
    if (activeItem) {
      const isExpanded = activeItem.getAttribute('aria-expanded') === 'true';
      const answer = activeItem.querySelector('.faq-answer') as HTMLElement;

      if (isExpanded) {
        activeItem.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0px';
      } else {
        activeItem.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        // Reset to auto after transition for fluid future toggles
        setTimeout(() => {
          answer.style.maxHeight = '';
        }, 300);
      }
    }
  }
}
