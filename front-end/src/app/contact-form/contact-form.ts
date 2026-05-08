import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'
import { ApiService } from '../core/api.service'
import { timeout, catchError, finalize, throwError } from 'rxjs'


@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="contact-form-container">
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
          <input formControlName="phone" type="tel" placeholder="Phone Number" />
        </div>
        <div class="form-group">
          <textarea formControlName="message" placeholder="Tell us about your project" rows="5" [class.error]="isInvalid('message')"></textarea>
          <span class="error-msg" *ngIf="isInvalid('message')">Message is required</span>
        </div>
        <button type="submit" [disabled]="loading" class="btn-primary">
          {{ loading ? 'Submitting...' : 'Send Message' }}
        </button>
        <div class="success-msg" *ngIf="success">
          Your request has been submitted successfully. We'll get back to you shortly.
          <div style="margin-top:10px">
            <a href="javascript:void(0)" style="color:inherit;text-decoration:underline" (click)="openBookingModal()">Book a Call</a>




          </div>
        </div>
        <div class="error-banner" *ngIf="error">
          Something went wrong while submitting your request. Please try again or contact us directly.
        </div>
        <div class="error-banner" *ngIf="timeoutError">
          Request timed out. Please try again.
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./contact-form.scss']
})
export class ContactFormComponent {
  openBookingModal() {
    window.dispatchEvent(new CustomEvent('booking:open'))
  }

  private api = inject(ApiService)
  private fb  = inject(FormBuilder)

  loading = false
  success = false
  error   = false
  timeoutError = false

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
    this.timeoutError = false

    this.api.submitContact(this.form.value as any).pipe(
      timeout(20000),
      catchError((err) => {
        const isTimeout = err?.name === 'TimeoutError'
        this.timeoutError = isTimeout
        this.error = !isTimeout
        return throwError(() => err)
      }),
      finalize(() => {
        this.loading = false
      })
    ).subscribe({
      next: () => {
        this.success = true
        this.form.reset()
      },
      error: () => {}
    })
  }
}

