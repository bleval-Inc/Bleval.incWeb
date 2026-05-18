import { Component, AfterViewInit, ElementRef, Inject, PLATFORM_ID, ViewChild, ViewChildren, QueryList } from '@angular/core';
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
export class Pricing implements AfterViewInit {
  @ViewChildren('faqItem') faqItems!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren('faqQuestion') faqQuestions!: QueryList<ElementRef<HTMLButtonElement>>;

  private trackFired = new Set<string>()

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private analytics: AnalyticsService) {}

  trackPricingPlanSelected(plan: 'starter' | 'growth' | 'enterprise') {
    const key = `pricing_plan_selected:${plan}`
    if (this.trackFired.has(key)) return
    this.trackFired.add(key)

    const map: Record<typeof plan, { monthly: number; setup_fee: number; displayPlan: string }> = {
      starter: { monthly: 999, setup_fee: 6000, displayPlan: 'Foundation' },
      growth: { monthly: 1500, setup_fee: 9000, displayPlan: 'Acceleration' },
      enterprise: { monthly: 1999, setup_fee: 12000, displayPlan: 'Enterprise' },
    }

    const v = map[plan]
    this.analytics.trackEvent('pricing_plan_selected', {
      plan: v.displayPlan,
      monthly: v.monthly,
      setup_fee: v.setup_fee,
    })
  }


  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.faqQuestions.changes.subscribe(() => this.initFaq());
      this.initFaq();
    }
  }

  private initFaq() {
    this.faqQuestions.forEach((questionRef, index) => {
      questionRef.nativeElement.onclick = () => this.toggleFaq(index);
    });
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
