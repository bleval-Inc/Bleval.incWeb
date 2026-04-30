import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeroTitleComponent } from '../hero-title/hero-title.component';
import { ScrollRevealDirective } from '../scroll-reveal';

@Component({
  selector: 'app-services',
  imports: [RouterLink, CommonModule, HeroTitleComponent, ScrollRevealDirective],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services {

}
