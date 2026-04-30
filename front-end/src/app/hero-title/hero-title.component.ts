import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Hero Typography — Clean Abstract Overlapping System
 *
 * Line 1 (Primary): sits on top, dominant, solid white/gradient
 * Line 2 (Secondary): overlaps from below, closer to bottom edge of Line 1
 *
 * Rules:
 *   - Overlap is subtle, closer to the bottom of Line 1
 *   - NOT centered overlap
 *   - NOT halfway — closer to bottom edge
 *   - Same font (Orbitron) for both lines
 *   - Secondary: slightly offset, lower opacity, stroke/glow variation
 */
@Component({
  selector: 'app-hero-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hero-title">
      <span class="line line-1" *ngIf="lines[0]">{{ lines[0] }}</span>
      <span class="line line-2" *ngIf="lines[1]">{{ lines[1] }}</span>
    </div>
  `,
  styleUrls: ['./hero-title.component.scss']
})
export class HeroTitleComponent implements OnInit {
  @Input() text: string = '';

  lines: string[] = [];

  ngOnInit() {
    // Split by newline, HTML entity newline, or literal backslash-n
    this.lines = this.text
      .split(/\n|&#10;|\\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }
}

