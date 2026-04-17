import { Component, AfterViewInit, ElementRef, Inject, PLATFORM_ID, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pricing',
  imports: [CommonModule, RouterLink],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss',
})
export class Pricing implements AfterViewInit {
  @ViewChildren('faqItem') faqItems!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren('faqQuestion') faqQuestions!: QueryList<ElementRef<HTMLButtonElement>>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

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
