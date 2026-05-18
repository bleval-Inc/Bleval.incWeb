import { Component } from '@angular/core';
import { ScrollRevealDirective } from '../scroll-reveal';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [ScrollRevealDirective, RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {

}
