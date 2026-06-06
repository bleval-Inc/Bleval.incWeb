import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'
import { ApiService } from '../core/api.service'
import { timeout, catchError, finalize, throwError } from 'rxjs'

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="booking-form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
        <div class="form-group">
          <label>Service</label>
          <select formControlName="service" (change)="onServiceChange()">
            <option value="">Select a service</option>
            <option *ngFor="let s of services()" [value]="s.name">
              {{ s.name }} {{ s.price ? '— R' + s.price : '(Free)' }}
            </option>
          </select>
        </div>

        <!-- Date/time removed: simplified booking payload -->

        <div class="form-group">
          <input formControlName="name" placeholder="Full Name" />
        </div>

        <div class="form-group">
          <input formControlName="email" type="email" placeholder="Email Address" />
        </div>

        <div class="form-group">
          <input formControlName="phone" type="tel" placeholder="Contact Number" />
        </div>

        <div class="form-group">
          <textarea
            class="project-details"
            formControlName="message"
            placeholder="Tell us about your project, goals, or what you're looking to achieve..."
            rows="6"
          ></textarea>
        </div>


        <button type="submit" [disabled]="loading() || form.invalid" class="btn-primary">
          {{ loading() ? 'Submitting...' : 'Book Now' }}
        </button>

        <div class="success-msg" *ngIf="success()">
          Booking request submitted successfully. We’ll contact you shortly to confirm your booking.
        </div>
        <div class="error-banner" *ngIf="error()">
          Something went wrong while submitting your booking. Please try again.
        </div>
        <div class="error-banner" *ngIf="timeoutError()">
          Something went wrong while submitting your booking. Please try again.
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./booking-form.scss']
})
export class BookingFormComponent implements OnInit {
  private api = inject(ApiService)
  private fb = inject(FormBuilder)

  services = signal<any[]>([])

  loading = signal(false)

  success = signal(false)
  error = signal(false)
  timeoutError = signal(false)

  form = this.fb.group({
    service: ['', Validators.required],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    message: ['', Validators.required],
  })

  ngOnInit() {
    this.api.getBookingServices().subscribe({
      next: (res) => this.services.set(res.services),
      error: () => {},
    })
  }

  onServiceChange() {
    // no-op; kept for API compatibility with template
  }
  

  onSubmit() {
    this.form.markAllAsTouched()
    if (this.form.invalid || this.loading()) return

    this.loading.set(true)
    this.success.set(false)
    this.error.set(false)
    this.timeoutError.set(false)

    const { service, name, email, phone, message } = this.form.value

    const payload = {
      name,
      email,
      phone,
      service,
      message,
      source: 'booking_form' as const,
    }


    this.api
      .createBooking(payload as any)
      .pipe(
        timeout(20000),
        catchError((err) => {
          const isTimeout = err?.name === 'TimeoutError'
          this.timeoutError.set(isTimeout)
          this.error.set(!isTimeout)
          return throwError(() => err)
        }),
        finalize(() => {
          this.loading.set(false)
        })
      )
      .subscribe({
        next: () => {
          this.success.set(true)
          this.form.reset()
        },

        error: () => {},
      })
  }
}

