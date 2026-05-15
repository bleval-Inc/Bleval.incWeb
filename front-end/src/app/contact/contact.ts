import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../core/toast.service';
import { ScrollRevealDirective } from '../scroll-reveal';
import { ApiService } from '../core/api.service';
import { AnalyticsService } from '../core/analytics.service';


@Component({
  selector: 'app-contact',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, ScrollRevealDirective],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  private api = inject(ApiService)
  private toastService = inject(ToastService)
  private analytics = inject(AnalyticsService)


  formData = {
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    pricing: '',
    message: ''
  };

  formSubmitted = false;
  formSuccess = false;
  error = false;

  async onSubmit() {
    this.formSubmitted = true;

    this.formSuccess = false;
    this.error = false;

    const payload = {
      name: this.formData.name,
      email: this.formData.email,
      phone: this.formData.phone || undefined,
      message: this.formData.message,
      // Use projectType/pricing for “service” attribution.
      service: this.formData.projectType || this.formData.pricing || undefined,
    }

    // Timeout failsafe: never infinite load
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out. Please try again.')), 20000)
    })

    try {
      await Promise.race([
        new Promise<void>((resolve, reject) => {
          this.api.submitContact(payload as any).subscribe({
            next: () => resolve(),
            error: (e) => reject(e),
            complete: () => undefined,
          })
        }),
        timeoutPromise,
      ])

      this.formSuccess = true;
      this.toastService.show("Your request has been submitted successfully. We'll get back to you shortly.", 'success');
      this.analytics.trackEvent('contact_form_submitted', {
        source: '/contact',
      })


      // Reset form
      this.formData = {
        name: '',
        email: '',
        phone: '',
        company: '',
        projectType: '',
        pricing: '',
        message: '',
      };
    } catch (err: any) {
      this.formSuccess = false;
      this.error = true;
      const msg = err?.message === 'Request timed out. Please try again.'
        ? err.message
        : "Something went wrong while submitting your request. Please try again or contact us directly.";
      this.toastService.show(msg, 'error');
    } finally {
      this.formSubmitted = false;
    }
  }
}

