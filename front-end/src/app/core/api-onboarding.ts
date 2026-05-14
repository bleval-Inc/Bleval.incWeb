import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { ApiService } from './api.service'

export type OnboardingStartPayload = {
  plan: string
  profile: {
    name: string
    company?: string
    email: string
    phone?: string
    industry?: string
    location?: string
  }
  alignment?: Record<string, any>
  brandingAddOnSelected?: boolean
  requestedAt?: string
}

export type OnboardingCompletePayload = OnboardingStartPayload & {
  completionNote?: string
}

@Injectable({ providedIn: 'root' })
export class ApiOnboarding {
  constructor(private api: ApiService) {}

  start(payload: OnboardingStartPayload): Observable<any> {
    return this.api.post<any>('/onboarding/start', payload)
  }

  complete(payload: OnboardingCompletePayload): Observable<any> {
    return this.api.post<any>('/onboarding/complete', payload)
  }
}

