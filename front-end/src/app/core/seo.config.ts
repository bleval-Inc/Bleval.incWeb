export type SeoRouteKey =
  | 'home'
  | 'services'
  | 'pricing'
  | 'contact'
  | 'onboarding'
  | 'onboardingSuccess'
  | 'about'
  | 'work'
  | 'blog';

export interface SeoConfigEntry {
  title: string;
  description: string;
  keywords: string[];
}

export const SEO_BASE_URL = 'https://bleval.inc';

export const SEO_CONFIG: Record<SeoRouteKey, SeoConfigEntry> = {
  home: {
    title: 'Bleval.inc | High-Performance Websites & Digital Growth Systems',
    description:
      'We build conversion-focused websites for service businesses designed to generate leads and scale growth.',
    keywords: [
      'web development Cape Town',
      'business websites',
      'lead generation websites',
    ],
  },
  services: {
    title: 'Web Design & Development Services | Bleval.inc',
    description:
      'Professional websites, SEO systems, and conversion-focused digital solutions for service businesses.',
    keywords: ['web design services', 'SEO websites', 'business websites Cape Town'],
  },
  pricing: {
    title: 'Website Pricing & Packages | Bleval.inc',
    description: 'Transparent pricing for high-performance websites and growth systems.',
    keywords: ['website pricing South Africa', 'web development packages'],
  },
  contact: {
    title: 'Contact Bleval.inc | Get a Website Quote',
    description: 'Speak with Bleval.inc to build your high-performance business website.',
    keywords: ['hire web developer Cape Town'],
  },
  onboarding: {
    title: 'Start Your Project | Bleval.inc Onboarding',
    description: 'Begin your website build process with Bleval.inc.',
    keywords: [],
  },
  onboardingSuccess: {
    title: 'Onboarding Complete | Bleval.inc',
    description: 'Thanks for starting your project. We are reviewing your request and will be in touch shortly.',
    keywords: [],
  },
  about: {
    title: 'About Bleval.inc | Our Digital Agency Approach',
    description: 'Performance-first web design and development systems built for growth.',
    keywords: [],
  },
  work: {
    title: 'Bleval.inc Work | Case Studies & Results',
    description: 'Selected digital projects and outcomes delivered by Bleval.inc.',
    keywords: [],
  },
  blog: {
    title: 'Bleval.inc Blog | Digital Growth & SEO Systems',
    description: 'Articles on web development, SEO, and growth systems.',
    keywords: [],
  },
};

