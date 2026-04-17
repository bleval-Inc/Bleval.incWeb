import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home').then(m => m.Home) },
  { path: 'services', loadComponent: () => import('./services/services').then(m => m.Services) },
  { path: 'pricing', loadComponent: () => import('./pricing/pricing').then(m => m.Pricing) },
  { path: 'work', loadComponent: () => import('./work/work').then(m => m.Work) },
  { path: 'about', loadComponent: () => import('./about/about').then(m => m.About) },
  { path: 'blog', loadComponent: () => import('./blog/blog').then(m => m.Blog) },
  { path: 'contact', loadComponent: () => import('./contact/contact').then(m => m.Contact) },
];
