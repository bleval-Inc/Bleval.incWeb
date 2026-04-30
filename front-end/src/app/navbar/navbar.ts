import { Component, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements AfterViewInit {
  constructor(private elementRef: ElementRef) {}

  @ViewChild('mobileToggle') mobileToggle!: ElementRef<HTMLElement>;
  @ViewChild('mobileMenu') mobileMenu!: ElementRef<HTMLElement>;
  @ViewChild('closeMenu') closeBtn!: ElementRef<HTMLElement>;

  isScrolled = false;
  isMenuOpen = false;

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMobileMenu();
    }, 0);
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (typeof window !== 'undefined') {
      this.isScrolled = window.scrollY > 50;
      const nav = document.querySelector('app-navbar .navbar') as HTMLElement;
      if (nav) nav.classList.toggle('scrolled', this.isScrolled);
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (typeof window !== 'undefined' && window.innerWidth > 900 && this.isMenuOpen) {
      this.closeMenuFn();
    }
  }

  private initMobileMenu() {
    if (this.mobileToggle?.nativeElement) {
      this.mobileToggle.nativeElement.addEventListener('click', () => this.toggleMenu());
    }
    if (this.closeBtn?.nativeElement) {
      this.closeBtn.nativeElement.addEventListener('click', () => this.closeMenuFn());
    }
    // Close on outside click
    if (this.elementRef.nativeElement) {
      this.elementRef.nativeElement.addEventListener('click', (e: MouseEvent) => {
        if ((e.target as Node) && !this.mobileMenu?.nativeElement?.contains(e.target as Node) && 
            !this.mobileToggle?.nativeElement?.contains(e.target as Node)) {
          this.closeMenuFn();
        }
      });
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.mobileMenu?.nativeElement) {
      this.mobileMenu.nativeElement.classList.toggle('open', this.isMenuOpen);
    }
    if (this.mobileToggle?.nativeElement) {
      this.mobileToggle.nativeElement.setAttribute('aria-expanded', String(this.isMenuOpen));
    }
    // Lock body scroll when menu open
    if (typeof document !== 'undefined') {
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }
  }

  closeMenuFn() {
    this.isMenuOpen = false;
    if (this.mobileMenu?.nativeElement) {
      this.mobileMenu.nativeElement.classList.remove('open');
    }
    if (this.mobileToggle?.nativeElement) {
      this.mobileToggle.nativeElement.setAttribute('aria-expanded', 'false');
    }
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }
}
