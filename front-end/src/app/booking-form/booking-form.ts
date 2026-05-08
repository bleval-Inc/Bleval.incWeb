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
          <select formControlName="service_id" (change)="onServiceChange()">
            <option value="">Select a service</option>
            <option *ngFor="let s of services()" [value]="s.id">
              {{ s.name }} {{ s.price ? '— R' + s.price : '(Free)' }}
            </option>
          </select>
        </div>

        <div class="form-group" *ngIf="form.value.service_id">
          <label>Preferred Booking Date</label>
          <input type="date" formControlName="date" [min]="minDate" (change)="loadSlots()" />
        </div>

        <div class="form-group" *ngIf="slots().length">
          <label>Preferred Booking Time</label>
          <select formControlName="start_time">
            <option value="">Select a time</option>
            <option *ngFor="let slot of slots()" [value]="slot">
              {{ formatSlot(slot) }}
            </option>
          </select>
        </div>

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
          <textarea formControlName="notes" placeholder="Additional Notes / Message" rows="3"></textarea>
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
  slots = signal<string[]>([])

  loading = signal(false)
  success = signal(false)
  error = signal(false)
  timeoutError = signal(false)

  minDate = new Date().toISOString().split('T')[0]

  form = this.fb.group({
    service_id: ['', Validators.required],
    date: ['', Validators.required],
    start_time: ['', Validators.required],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    notes: [''],
  })

  ngOnInit() {
    this.api.getBookingServices().subscribe({
      next: (res) => this.services.set(res.services),
      error: () => {},
    })
  }

  onServiceChange() {
    this.slots.set([])
    this.form.patchValue({ start_time: '' })
  }

  loadSlots() {
    const { service_id, date } = this.form.value
    if (!service_id || !date) return

    this.api.getAvailableSlots(service_id, date).subscribe({
      next: (res) => this.slots.set(res.slots),
      error: () => {},
    })
  }

  formatSlot(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
  }

  onSubmit() {
    this.form.markAllAsTouched()
    if (this.form.invalid || this.loading()) return

    this.loading.set(true)
    this.success.set(false)
    this.error.set(false)
    this.timeoutError.set(false)

    const { service_id, date, start_time, name, email, phone, notes } = this.form.value

    const selectedService = this.services().find((s) => s.id === service_id)
    const serviceLabel = selectedService?.name ?? ''
    const timeLabel = this.formatSlot(start_time as string)

    const payload = {
      name,
      email,
      phone,
      service: serviceLabel,
      date,
      time: timeLabel,
      notes,
      source: 'booking_modal' as const,
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
          this.slots.set([])
        },
        error: () => {},
      })
  }
}

