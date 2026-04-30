import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../scroll-reveal';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string[];
  gradient: string;
  featured?: boolean;
}

@Component({
  selector: 'app-work',
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './work.html',
  styleUrl: './work.scss',
})
export class Work {
  activeFilter = signal('All');

  projects: Project[] = [
    {
      id: 1,
      title: 'Fintech SaaS Platform',
      description: 'Complete redesign and development of a financial technology platform, resulting in 300% increase in user signups.',
      category: 'Web App',
      tags: ['Web App', 'React', 'Custom'],
      gradient: 'linear-gradient(135deg, var(--uv-start), var(--cyan))',
      featured: true
    },
    {
      id: 2,
      title: 'E-Commerce Brand',
      description: 'Shopify store with headless architecture',
      category: 'E-Commerce',
      tags: ['Shopify', 'E-Commerce'],
      gradient: 'linear-gradient(135deg, var(--deep-iris), var(--uv-start))'
    },
    {
      id: 3,
      title: 'Corporate Website',
      description: 'Modern corporate website with CMS integration',
      category: 'Web Design',
      tags: ['Web Design', 'CMS', 'Corporate'],
      gradient: 'linear-gradient(135deg, var(--cyan), var(--deep-iris))'
    },
    {
      id: 4,
      title: 'Brand Identity System',
      description: 'Complete brand identity design and implementation',
      category: 'Brand',
      tags: ['Brand', 'Identity', 'Design'],
      gradient: 'linear-gradient(135deg, var(--slate), var(--uv-start))'
    },
    {
      id: 5,
      title: 'Mobile App Backend',
      description: 'Scalable backend API for mobile application',
      category: 'Custom',
      tags: ['API', 'Backend', 'Custom'],
      gradient: 'linear-gradient(135deg, var(--primary), var(--secondary))'
    },
    {
      id: 6,
      title: 'Marketing Landing Page',
      description: 'High-converting landing page for SaaS product',
      category: 'Web Design',
      tags: ['Landing Page', 'SaaS', 'Conversion'],
      gradient: 'linear-gradient(135deg, var(--secondary), var(--primary))'
    }
  ];

  filters = ['All', 'Web Design', 'E-Commerce', 'Brand', 'Custom'];

  get filteredProjects() {
    if (this.activeFilter() === 'All') {
      return this.projects;
    }
    return this.projects.filter(project => project.category === this.activeFilter());
  }

  get featuredProject() {
    return this.projects.find(project => project.featured);
  }

  setActiveFilter(filter: string) {
    this.activeFilter.set(filter);
  }

  trackByProject(index: number, project: Project): number {
    return project.id;
  }
}
