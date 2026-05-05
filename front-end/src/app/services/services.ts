import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services implements AfterViewInit, OnDestroy {

  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  services = [
    {
      name: 'Web Design',
      id: 'web-design',
      reveals: [false, false, false]
    },
    {
      name: 'Web Development',
      id: 'web-development',
      reveals: [false, false, false]
    },
    {
      name: 'E-Commerce Solutions',
      id: 'e-commerce-solutions',
      reveals: [false, false, false]
    },
    {
      name: 'Growth & Maintenance',
      id: 'growth-maintenance',
      reveals: [false, false, false]
    }
  ];

  ngAfterViewInit() {

    // Wait for full navigation completion BEFORE scrolling
    this.sub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {

        const fragment = this.route.snapshot.fragment;

        if (fragment) {
          // Fragment navigation → ONLY scroll to section
          this.scrollToSection(fragment);
        } else {
          // Normal navigation → scroll to top
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
      });
  }

  private scrollToSection(fragment: string) {
    requestAnimationFrame(() => {
      const element = document.getElementById(fragment);

      if (!element) return;

      const yOffset = -100; // navbar offset
      const y =
        element.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  toggleReveal(serviceIndex: number, revealIndex: number) {
    const service = this.services[serviceIndex];

    if (service.reveals[revealIndex]) {
      service.reveals[revealIndex] = false;
    } else {
      service.reveals.fill(false);
      service.reveals[revealIndex] = true;
    }
  }
}