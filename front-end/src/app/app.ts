import { Component, signal, AfterViewInit, ElementRef, Renderer2, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';
import { ScrollRevealDirective } from './scroll-reveal';
import { ChatbotComponent } from './chatbot/chatbot';
import { BookingFormComponent } from './booking-form/booking-form';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Navbar, Footer, ScrollRevealDirective, ChatbotComponent, BookingFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  protected readonly title = signal('bleval-inc');
  protected readonly isScrolled = signal(false);

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  @HostListener('window:scroll', [])
  onScroll() {
    if (typeof window !== 'undefined') {
      this.isScrolled.set(window.scrollY > 100);
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openChatbot() {
    console.log('Chatbot opened - logic to be implemented');
    // TODO: Add chatbot logic here
  }

  ngAfterViewInit() {
    const cursor = this.el.nativeElement.querySelector('#cursor');
    if (cursor) {
      this.renderer.listen('document', 'mousemove', (e: MouseEvent) => {
        this.renderer.setStyle(cursor, 'left', `${e.clientX}px`);
        this.renderer.setStyle(cursor, 'top', `${e.clientY}px`);
      });

      this.renderer.listen('document', 'mouseenter', () => {
        this.renderer.setStyle(cursor, 'opacity', '1');
      }, { capture: true });

      this.renderer.listen('document', 'mouseleave', () => {
        this.renderer.setStyle(cursor, 'opacity', '0');
      });

      // Add hover effect for interactive elements
      const interactiveElements = this.el.nativeElement.querySelectorAll('a, button, input, select');
      interactiveElements.forEach((el: Element) => {
        this.renderer.listen(el, 'mouseenter', () => {
          this.renderer.addClass(cursor, 'hover');
        });
        this.renderer.listen(el, 'mouseleave', () => {
          this.renderer.removeClass(cursor, 'hover');
        });
      });
    }
  }
}
