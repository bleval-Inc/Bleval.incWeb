import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
    // Only apply fragment/scroll behavior while we are on the /services route.
    // This prevents the Services component from running its scroll logic when
    // navigating away (e.g. clicking "Explore" -> /pricing#pricing-tiers).
    this.sub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentPath = this.router.url ?? '';
        const isOnServices = currentPath === '/services' || currentPath.startsWith('/services#');

        if (!isOnServices) return;

        const fragment = this.route.snapshot.fragment;

        if (fragment) {
          this.scrollToSection(fragment);
        } else {
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