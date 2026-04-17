import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { Router, NavigationEnd } from '@angular/router';
import { inject } from '@angular/core';
import { filter } from 'rxjs/operators';

// Wrap the original appConfig providers with scroll handling
const updatedAppConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    {
      provide: 'ROUTER_SCROLL_TOP',
      useFactory: () => {
        const router = inject(Router);
        router.events
          .pipe(filter(event => event instanceof NavigationEnd))
          .subscribe(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
          });
      },
      multi: true
    }
  ]
};

bootstrapApplication(App, updatedAppConfig)
  .catch((err) => console.error(err));