import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'
import { ApiService } from '../core/api.service'

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
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
        <label>Preferred Date</label>
        <input type="date" formControlName="date" [min]="minDate" (change)="loadSlots()" />
      </div>

      <div class="form-group" *ngIf="slots().length">
        <label>Available Time Slots</label>
        <select formControlName="start_time">
          <option value="">Select a time</option>
          <option *ngFor="let slot of slots()" [value]="slot">
            {{ formatSlot(slot) }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <input formControlName="contact_name" placeholder="Your name" />
      </div>
      <div class="form-group">
        <input formControlName="contact_email" type="email" placeholder="Email address" />
      </div>
      <div class="form-group">
        <input formControlName="contact_phone" placeholder="Phone (optional)" />
      </div>
      <div class="form-group">
        <textarea formControlName="notes" placeholder="Anything we should know?" rows="3"></textarea>
      </div>

      <button type="submit" [disabled]="loading() || form.invalid" class="btn-primary">
        {{ loading() ? 'Booking...' : 'Book Now' }}
      </button>

      <div class="success-msg" *ngIf="success()">
        Booking confirmed! Check your email for details.
      </div>
      <div class="error-banner" *ngIf="error()">
        Something went wrong. Please try again or email us.
      </div>
    </form>
  `
})
export class BookingFormComponent implements OnInit {
  private api = inject(ApiService)
  private fb  = inject(FormBuilder)

  services = signal<any[]>([])
  slots    = signal<string[]>([])
  loading  = signal(false)
  success  = signal(false)
  error    = signal(false)
  minDate  = new Date().toISOString().split('T')[0]

  form = this.fb.group({
    service_id:    ['', Validators.required],
    date:          ['', Validators.required],
    start_time:    ['', Validators.required],
    contact_name:  ['', Validators.required],
    contact_email: ['', [Validators.required, Validators.email]],
    contact_phone: [''],
    notes:         [''],
  })

  ngOnInit() {
    this.api.getBookingServices().subscribe({
      next: (res) => this.services.set(res.services),
      error: () => {}
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
      error: () => {}
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

    const { date, ...rest } = this.form.value
    this.api.createBooking(rest as any).subscribe({
      next: () => { this.success.set(true); this.loading.set(false); this.form.reset() },
      error: () => { this.error.set(true); this.loading.set(false) }
    })
  }
}