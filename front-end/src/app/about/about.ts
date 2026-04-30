import { Component } from '@angular/core';
import { HeroTitleComponent } from '../hero-title/hero-title.component';
import { ScrollRevealDirective } from '../scroll-reveal';

@Component({
  selector: 'app-about',
  imports: [HeroTitleComponent, ScrollRevealDirective],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {

}
