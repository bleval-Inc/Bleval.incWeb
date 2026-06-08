import { Injectable } from '@angular/core'

export type OnboardingPlan = 'foundation' | 'growth' | 'enterprise'
export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6


export type OnboardingState = {
  plan: OnboardingPlan
  step: OnboardingStep

  // Step 2
  name: string
  company: string
  email: string
  phone: string
  industry: string
  location: string

  // Step 3
  websiteOrApp: 'website' | 'app' | 'both' | ''
  brandingNeeded: boolean
  seoNeeded: boolean
  aiChatbotNeeded: boolean
  timeline: 'asap' | 'this-month' | 'next-quarter' | 'exploring' | ''
  existingWebsite: boolean
  competitors: 'yes' | 'no' | ''
  inspiration: 'yes' | 'no' | ''

  // Step 4/5
  brandingAddOnSelected: boolean
}


const LS_KEY = 'bleval.onboarding.v1'

const DEFAULT_STATE: OnboardingState = {
  plan: 'foundation',

  step: 1,


  name: '',
  company: '',
  email: '',
  phone: '',
  industry: '',
  location: '',

  websiteOrApp: '',
  brandingNeeded: false,
  seoNeeded: false,
  aiChatbotNeeded: false,
  timeline: '',
  existingWebsite: false,
  competitors: '',
  inspiration: '',

  brandingAddOnSelected: false,
}


@Injectable({ providedIn: 'root' })
export class OnboardingStateService {
  getInitialState(planFromQuery: string | null): OnboardingState {
    const parsed = this.read()
    const plan = this.normalizePlan(planFromQuery)

    // If we already have state, keep the stored plan unless query explicitly overrides it.
    if (parsed) {
      return {
        ...DEFAULT_STATE,
        ...parsed,
        plan: plan ?? parsed.plan,
      }
    }

    return {
      ...DEFAULT_STATE,
      plan: plan ?? DEFAULT_STATE.plan,
    }
  }

  normalizePlan(v: string | null): OnboardingPlan | null {
    if (!v) return null
    const key = v.toLowerCase().trim()

    // Accept multiple legacy keys so existing links/bookmarking keep working.
    if (key === 'foundation' || key === 'starter') return 'foundation'
    if (key === 'growth' || key === 'acceleration') return 'growth'
    if (key === 'enterprise' || key === 'premium') return 'enterprise'

    return null
  }


  read(): OnboardingState | null {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return null
      const data = JSON.parse(raw) as Partial<OnboardingState>
      if (!data || !data.plan || !data.step) return null
      // Basic shape validation.
      return {
        ...DEFAULT_STATE,
        ...data,
      }

    } catch {
      return null
    }
  }

  write(state: OnboardingState) {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  }

  clear() {
    localStorage.removeItem(LS_KEY)
  }

  persistStep(step: OnboardingStep, patch: Partial<OnboardingState>) {
    const current = this.read() ?? DEFAULT_STATE
    const next: OnboardingState = {
      ...current,
      ...patch,
      step,
    }
    // Ensure branding add-on flag completeness
    next.brandingAddOnSelected = !!next.brandingAddOnSelected
    this.write(next)
    return next
  }

  getBranchLabel(_plan: OnboardingPlan): string {
    return 'Preparing for your onboarding strategy session'
  }
}


