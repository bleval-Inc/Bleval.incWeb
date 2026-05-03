import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services',
  imports: [CommonModule],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {
  services = [
    {
      name: 'Web Design',
      reveals: [false, false, false]
    },
    {
      name: 'Web Development',
      reveals: [false, false, false]
    },
    {
      name: 'E-Commerce Solutions',
      reveals: [false, false, false]
    },
    {
      name: 'Growth & Maintenance',
      reveals: [false, false, false]
    }
  ];

  toggleReveal(serviceIndex: number, revealIndex: number) {
    const service = this.services[serviceIndex];
    if (service.reveals[revealIndex]) {
      service.reveals[revealIndex] = false;
    } else {
      // Close all others in this service
      service.reveals.fill(false);
      service.reveals[revealIndex] = true;
    }
  }
}
