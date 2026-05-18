import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../scroll-reveal';
import { CommonModule } from '@angular/common';

export interface BlogPost {
  title: string;
  excerpt: string;
  image: string;
  url: string;
  source:
    | 'Angular Blog'
    | 'Node.js Blog'
    | 'Smashing Magazine'
    | 'CSS-Tricks'
    | 'Dev.to'
    | 'TechCrunch'
    | 'MIT Technology Review'
    | 'OpenAI Blog';
}

@Component({
  selector: 'app-blog',
  imports: [ScrollRevealDirective, CommonModule],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class Blog {
  email = '';
  isSubscribing = false;
  subscribeError: string | null = null;

  private subscribeTimerId: number | null = null;
  private subscribeRunId = 0;


  onEmailInput(value: string): void {
    this.email = value;
  }


  get featuredPost(): BlogPost {
    return this.posts[0];
  }

  getFeaturedBg(): string {
    const p = this.featuredPost;
    return `linear-gradient(135deg, rgba(124, 58, 237, 0.35), rgba(0, 229, 255, 0.18)), url('${p.image}')`;
  }

  getPostBg(image: string): string {
    return `linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(0, 229, 255, 0.15)), url('${image}')`;
  }

  /**
   * Static, frontend-only dataset (no backend/CMS/API calls).
   * Links open in a new tab (handled in template).
   */
  readonly posts: BlogPost[] = [
    {
      title: 'The future of Angular: Signals and reactivity at scale',
      excerpt:
        'A practical look at how Angular Signals change component state, improve predictability, and make reactive UI patterns easier to reason about.',
      image: 'assets/blog/anular-blog-img.jpg', 

      url: 'https://blog.angular.io/',
      source: 'Angular Blog',
    },

    {
      title: 'Node.js v22: Performance work, diagnostics, and platform improvements',
      excerpt:
        'An overview of what matters in modern Node releases—faster execution paths, better tooling hooks, and developer-focused platform updates.',
      image: 'assets/blog/node.js-blog.png',

      url: 'https://nodejs.org/en/blog',
      source: 'Node.js Blog',
    },

    {
      title: 'Smashing Magazine: Practical micro-interactions that improve UX',
      excerpt:
        'Learn how to design motion, feedback, and small state transitions that guide users without adding cognitive load or visual noise.',
      image: 'assets/blog/smashingmag-blog.png',


      url: 'https://www.smashingmagazine.com/',
      source: 'Smashing Magazine',
    },
    {
      title: 'CSS-Tricks: Modern responsive layouts with grid + flex strategies',
      excerpt:
        'A production-minded tour of layout patterns—how to combine CSS Grid and Flexbox to build resilient interfaces across screen sizes.',
      image: 'assets/blog/css-blog.jpg',

      url: 'https://css-tricks.com/',

      source: 'CSS-Tricks',
    },
    {
      title: 'Dev.to: TypeScript patterns for safer large-scale refactors',
      excerpt:
        'Guidance on writing maintainable types—using narrowing, generics boundaries, and conventions that keep codebases flexible.',
      image: 'assets/blog/dev.io-blog.png',

      url: 'https://dev.to/t/typescript',
      source: 'Dev.to',
    },

    {
      title: 'TechCrunch: The engineering reality of AI in production products',
      excerpt:
        'What AI adoption looks like when engineering teams ship: cost tradeoffs, latency constraints, and product UX expectations.',
      image: 'assets/blog/techCrunch-blog.png',

      url: 'https://techcrunch.com/tag/ai/',

      source: 'TechCrunch',
    },
    {
      title: 'MIT Technology Review: Multimodal systems and new application design patterns',
      excerpt:
        'How multimodal AI changes interface design—input strategies, grounding, and user workflows for real-world use cases.',
      image: 'assets/blog/mit.blog.png',

      url: 'https://www.technologyreview.com/topic/artificial-intelligence/',
      source: 'MIT Technology Review',
    },
    {
      title: 'OpenAI Blog: Building trustworthy assistant experiences',
      excerpt:
        'Principles for safer assistants—transparency, guardrails, and interaction patterns that reduce confusion and user friction.',
      image: 'assets/blog/open-AI-blog.png',

      url: 'https://openai.com/blog',
      source: 'OpenAI Blog',
    },

    {
      title: 'Full-stack checklist: designing APIs your UI can trust',
      excerpt:
        'A concise blueprint for building predictable endpoints—validation, error formats, pagination strategy, and versioning.',
      image: 'assets/blog/node.js-blog.png',


      url: 'https://nodejs.org/en/blog',
      source: 'Node.js Blog',
    },
    {
      title: 'UI/UX: glassmorphism done right for performance and readability',
      excerpt:
        'How to keep frosted-glass aesthetics while maintaining contrast, accessibility, and smooth rendering in production UIs.',
      image: 'assets/blog/smashingmag-blog.png',



      url: 'https://www.smashingmagazine.com/',

      source: 'Smashing Magazine',
    },
  ];



onSubscribe(): void {

// Prevent double-click spam
if (this.isSubscribing) {
return;
}

// Reset previous error
this.subscribeError = null;

// Start loading state
this.isSubscribing = true;

// Simulate API request delay
setTimeout(() => {

//  Stop loading
this.isSubscribing = false;

// Show error message
this.subscribeError =
  'Error subscribing. Please try again later.';

}, 5000);
}

}


