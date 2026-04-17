import { Component, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
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

  private initMobileMenu() {
    if (this.mobileToggle?.nativeElement) {
      this.mobileToggle.nativeElement.addEventListener('click', () => this.toggleMenu());
    }
    if (this.closeBtn?.nativeElement) {
      this.closeBtn.nativeElement.addEventListener('click', () => this.closeMenu());
    }
    // Close on outside click
    if (this.elementRef.nativeElement) {
      this.elementRef.nativeElement.addEventListener('click', (e: MouseEvent) => {
        if ((e.target as Node) && !this.mobileMenu?.nativeElement?.contains(e.target as Node) && 
            !this.mobileToggle?.nativeElement?.contains(e.target as Node)) {
          this.closeMenu();
        }
      });
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.mobileMenu?.nativeElement) {
      this.mobileMenu.nativeElement.classList.toggle('open', this.isMenuOpen);
    }
  }

  closeMenu() {
    this.isMenuOpen = false;
    if (this.mobileMenu?.nativeElement) {
      this.mobileMenu.nativeElement.classList.remove('open');
    }
  }
}

