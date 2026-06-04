import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AnalyticsService } from '../core/analytics.service';
import { ScrollRevealDirective } from '../scroll-reveal';


interface Service {
  number: string;
  title: string;
  tabLabel: string;
  description: string;
  included: string[];
  bestFor: string[];
  imageSrc: string;
  imageAlt: string;
}

interface RevenuAccelerator {
  label: string;
  title: string;
  price: string;
  features: string[];
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, ScrollRevealDirective],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services implements AfterViewInit, OnDestroy {

  private sub?: Subscription;
  private trackFired = new Set<string>();

  selectedServiceIndex = 0;

  services: Service[] = [
    {
      number: '01',
      title: 'Websites Built To Generate Revenue',
      tabLabel: 'Websites',
      description: 'Your website should do more than look professional.\n\nWe build fast, mobile-first websites, booking systems, and e-commerce platforms designed to convert visitors into enquiries, appointments, and customers.',
      included: [
        'Custom Website Development',
        'Mobile-First Design',
        'E-Commerce Solutions',
        'Online Booking Systems',
        'Lead Capture Forms',
        'WhatsApp Integration',
        'Calendly Integration',
        'SEO-Ready Architecture',
        'Conversion Copywriting'
      ],
      bestFor: ['Startups', 'Service Businesses', 'Tradespeople', 'Clinics', 'Salons', 'Professional Services'],
      imageSrc: 'assets/Web-design.jpg',
      imageAlt: 'Web design and revenue system preview'
    },
    {
      number: '02',
      title: 'Never Lose Another Lead',
      tabLabel: 'AI',
      description: 'Every missed call, forgotten follow-up, and unanswered enquiry costs money.\n\nWe build AI-powered systems that capture, qualify, and nurture leads automatically.',
      included: [
        'AI Chatbots',
        'Lead Qualification Flows',
        'Missed Call Recovery',
        'SMS Automations',
        'WhatsApp Automations',
        'Appointment Reminders',
        'Review Request Systems',
        'Lead Nurture Sequences'
      ],
      bestFor: ['Plumbers', 'Electricians', 'Salons', 'Real Estate', 'Clinics', 'Gyms'],
      imageSrc: 'assets/Web-design.jpg',
      imageAlt: 'AI lead capture and conversion system preview'
    },
    {
      number: '03',
      title: 'Get Found When Customers Are Searching',
      tabLabel: 'SEO',
      description: 'The best website in the world means nothing if nobody can find it.\n\nWe help businesses dominate local search results, Google Business Profile rankings, and emerging AI search platforms.',
      included: [
        'Local SEO',
        'Google Business Profile Optimisation',
        'Search Console Setup',
        'Schema Markup',
        'Technical SEO',
        'Content Optimisation',
        'AEO Optimisation',
        'Monthly Reporting'
      ],
      bestFor: ['Startups', 'Service Businesses', 'Tradespeople', 'Clinics', 'Salons', 'Real Estate'],
      imageSrc: 'assets/Web-design.jpg',
      imageAlt: 'Growth and conversion strategy preview'
    },
    {
      number: '04',
      title: 'Turn Visibility Into Consistent Growth',
      tabLabel: 'Growth',
      description: 'Once your website and automation systems are working, growth becomes a process rather than a guessing game.\n\nWe build content and conversion systems that continuously generate opportunities.',
      included: [
        'Social Media Management',
        'AI Content Creation',
        'Reels Production',
        'Graphics Design',
        'Content Calendars',
        'Analytics Dashboards',
        'Growth Reviews',
        'Lead Reporting'
      ],
      bestFor: ['Startups', 'E-Commerce', 'Service Businesses', 'Agencies', 'Coaches', 'Consultants'],
      imageSrc: 'assets/Web-design.jpg',
      imageAlt: 'Continuous growth and content systems preview'
    },
    {
      number: '05',
      title: 'Every Call Answered. Every Opportunity Captured.',
      tabLabel: 'Voice AI',
      description: 'Most service businesses lose thousands every month from missed calls alone.\n\nOur AI Voice Receptionist answers every call, qualifies enquiries, books appointments, and follows up automatically.',
      included: [
        '24/7 AI Call Answering',
        'Appointment Booking',
        'Lead Qualification',
        'Call Summaries',
        'Missed Call Recovery',
        'WhatsApp Follow-Up',
        'CRM Handoff'
      ],
      bestFor: ['Plumbers', 'Electricians', 'Salons', 'Real Estate', 'Clinics', 'Service Businesses'],
      imageSrc: 'assets/Web-design.jpg',
      imageAlt: 'Voice AI receptionist and automation preview'
    },
    {
      number: '06',
      title: 'Your Entire Revenue Operation. Automated.',
      tabLabel: 'Enterprise',
      description: 'For businesses ready to scale, we combine CRM systems, automations, AI, marketing, and reporting into a single revenue engine.',
      included: [
        'CRM Implementation',
        'GoHighLevel Management',
        'Paid Advertising Systems',
        'Advanced Automations',
        'Client Reactivation Campaigns',
        'Payment Automations',
        'Enterprise SEO',
        'Quarterly Strategy Reviews'
      ],
      bestFor: ['Agencies', 'Growing Businesses', 'E-Commerce', 'Professional Services', 'Enterprises', 'Consultancies'],
      imageSrc: 'assets/Web-design.jpg',
      imageAlt: 'Enterprise revenue operations preview'
    }
  ];

  revenueAccelerators: RevenuAccelerator[] = [
    {
      label: 'Foundation Accelerator',
      title: 'Brand Identity Package',
      price: 'R3,500 Once-Off',
      features: [
        'Professional Logo Design',
        'Brand Colour Palette',
        'Typography System',
        'Business Card Design',
        'Social Media Kit',
        'Brand Guidelines PDF'
      ]
    },
    {
      label: 'Highest Perceived Value',
      title: 'AI Voice Receptionist',
      price: 'R1,500–R4,000/month',
      features: [
        '24/7 Call Answering',
        'Lead Qualification',
        'Appointment Booking',
        'Call Summaries',
        'Missed Call Recovery',
        'WhatsApp Follow-Up'
      ]
    },
    {
      label: 'Growth Accelerator',
      title: 'Content Creation Suite',
      price: 'From R2,500/month',
      features: [
        'Social Content Creation',
        'Branded Graphics',
        'Reels Production',
        'Content Calendar',
        'Scheduling',
        'Monthly Reporting'
      ]
    }
  ];

  expandedAcceleratorIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private analytics: AnalyticsService
  ) {}

  selectService(index: number) {
    this.selectedServiceIndex = index;
  }

  trackServiceExploreClicked(serviceName: string) {
    const key = `service_explore_clicked:${serviceName}`;
    if (this.trackFired.has(key)) return;
    this.trackFired.add(key);

    this.analytics.trackEvent('service_explore_clicked', {
      service: serviceName,
      destination: '/pricing',
    });

    this.analytics.trackEvent('service_cta_clicked', {
      cta: 'Explore Plans',
    });
  }

  toggleAccelerator(index: number) {
    this.expandedAcceleratorIndex = this.expandedAcceleratorIndex === index ? null : index;
  }

  scrollToServices() {
    const element = document.getElementById('services-anchor');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  ngAfterViewInit() {
    // Only apply fragment/scroll behavior while we are on the /services route.
    // This prevents the Services component from running its scroll logic when
    // navigating away (e.g. clicking "See Recommended Package" -> /pricing#pricing-tiers).
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
}