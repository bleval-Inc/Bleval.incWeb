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
    title: 'Bleval Inc | AI Automation & Revenue-Driven Digital Systems',
    description:
      'Bleval Inc builds premium, conversion-focused websites and AI-powered business systems that improve lead flow, workflow efficiency, and revenue growth.',
    keywords: [
      'AI automation for business',
      'conversion-focused web design',
      'revenue-driven websites',
      'workflow optimization',
      'digital growth systems',
    ],
  },
  services: {
    title: 'AI-Powered Web Development & Business Systems | Bleval Inc',
    description:
      'Web design, web development, branding, and workflow optimization—built to convert visitors into qualified leads and scale efficiently.',
    keywords: ['AI automation', 'web design', 'web development', 'branding', 'business systems'],
  },
  pricing: {
    title: 'Pricing for Revenue-Driven Websites & AI Systems | Bleval Inc',
    description:
      'Choose a package built for measurable growth—setup + monthly optimization designed to improve conversions, leads, and operational efficiency.',
    keywords: ['website pricing', 'AI automation packages', 'CRO services', 'conversion optimization'],
  },
  contact: {
    title: 'Book a Free Revenue Audit | Bleval Inc',
    description:
      'Book your free revenue audit. We’ll analyze your funnel, workflow, and conversion pathways—then send a clear plan to improve results.',
    keywords: ['free revenue audit', 'digital growth audit', 'website conversion audit'],
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

