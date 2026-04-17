import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'
import { ApiService } from '../core/api.service'

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
      <div class="form-group">
        <input formControlName="name" placeholder="Your name" [class.error]="isInvalid('name')" />
        <span class="error-msg" *ngIf="isInvalid('name')">Name is required</span>
      </div>
      <div class="form-group">
        <input formControlName="email" type="email" placeholder="Email address" [class.error]="isInvalid('email')" />
        <span class="error-msg" *ngIf="isInvalid('email')">Valid email required</span>
      </div>
      <div class="form-group">
        <input formControlName="phone" placeholder="Phone number (optional)" />
      </div>
      <div class="form-group">
        <textarea formControlName="message" placeholder="Tell us about your project" rows="5" [class.error]="isInvalid('message')"></textarea>
        <span class="error-msg" *ngIf="isInvalid('message')">Message is required</span>
      </div>
      <button type="submit" [disabled]="loading" class="btn-primary">
        {{ loading ? 'Sending...' : 'Send Message' }}
      </button>
      <div class="success-msg" *ngIf="success">
        Message sent! We'll be in touch within 1 business day.
      </div>
      <div class="error-banner" *ngIf="error">
        Something went wrong. Please email us directly at hello@bleval.inc
      </div>
    </form>
  `
})
export class ContactFormComponent {
  private api = inject(ApiService)
  private fb  = inject(FormBuilder)

  loading = false
  success = false
  error   = false

  form = this.fb.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    phone:   [''],
    message: ['', [Validators.required, Validators.minLength(10)]],
  })

  isInvalid(field: string) {
    const control = this.form.get(field)
    return control?.invalid && control?.touched
  }

  onSubmit() {
    this.form.markAllAsTouched()
    if (this.form.invalid || this.loading) return
    this.loading = true
    this.success = false
    this.error   = false

    this.api.submitContact(this.form.value as any).subscribe({
      next: () => { this.success = true; this.loading = false; this.form.reset() },
      error: () => { this.error = true; this.loading = false }
    })
  }
}