import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { AnalyticsService } from '../../core/analytics.service'

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { Subscription } from 'rxjs'
import { OnboardingPlan, OnboardingState, OnboardingStateService, OnboardingStep } from '../onboarding-state.service'
import { ToastService } from '../../core/toast.service'
import { ApiOnboarding } from '../../core/api-onboarding'

import { ScrollRevealDirective } from '../../scroll-reveal'

type UiMode = 'form' | 'processing' | 'success' | 'failure'

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ScrollRevealDirective],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export class OnboardingOnboarding implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private stateService = inject(OnboardingStateService)
  private fb = inject(FormBuilder)

  private sub = new Subscription()
  private toastService = inject(ToastService)
  private onboardingApi = inject(ApiOnboarding)
  private analytics = inject(AnalyticsService)


  goBackToPricing() {
    this.router.navigate(['/pricing'])
  }

  state!: OnboardingState


  brandingAddOnPrice = 2500

  readonly planMeta = computed(() => {
    const plan = this.state.plan
    const meta: Record<OnboardingPlan, {
      name: string
      positioning: string
      timeline: string
      price: number
      monthly: number
      included: string[]
      toneKicker: string
    }> = {
      foundation: {
        name: 'Foundation',
        positioning: 'Show up professionally online, get found on Google, and start capturing leads within 7 days.',
        timeline: '2–3 weeks',
        price: 6000,
        monthly: 1299,
        included: [
          'Professional mobile-first website (up to 5 pages)',
          'Conversion-focused copywriting',
          'WhatsApp click-to-chat integration',
          'Calendly booking embedded',
          'Lead capture forms with email notifications',
          'Google Maps + location embed',
          'Google Business Profile setup & optimisation',
          'Local SEO foundation',
          'Google Search Console submission',
          'IG + Facebook profile optimisation',
          '20 AI-assisted branded posts/month',
          'Content calendar template',
          'Hosting + uptime monitoring',
          'Security updates & automatic backups',
          'Monthly SEO performance report',
          'Monthly analytics dashboard',
          'Review request campaign',
        ],
        toneKicker: 'Build trust. Get found. Start generating enquiries.',
      },
      growth: {
        name: 'Growth',
        positioning: 'Stop losing leads to silence. Every missed call, unanswered form, and no-show is recovered automatically.',
        timeline: '3–4 weeks',
        price: 14000,
        monthly: 2999,
        included: [
          'Everything in Foundation',
          'Up to 8 conversion-optimised pages',
          'AI chatbot trained on your services',
          'WhatsApp Business integration',
          'Deposit capture on booking',
          'Missed call → instant SMS auto-response',
          '3-touch lead nurture sequence',
          'Automated appointment reminders',
          'Post-job WhatsApp review request',
          'AI lead qualification flow',
          'Advanced SEO + content system',
          'Answer Engine Optimisation',
          'Google Ads keyword research guidance',
          'Conversion tracking dashboard',
          'Automation monitoring',
          '16 branded social posts/month',
          'Monthly lead reports',
          'A/B testing',
          'Growth optimisation reviews',
        ],
        toneKicker: 'Turn every lead into an opportunity.',
      },
      enterprise: {
        name: 'Enterprise',
        positioning: 'Replace operational overhead with AI systems and scale without adding complexity.',
        timeline: '4–5 weeks',
        price: 25000,
        monthly: 5999,
        included: [
          'Everything in Growth',
          'Unlimited conversion systems',
          'CRM + GoHighLevel sub-account',
          'Booking & payment portal',
          'Custom integrations',
          'AI Voice Receptionist',
          'Client reactivation campaigns',
          'Invoice reminders',
          'WhatsApp Business API flows',
          'AI review response system',
          'Meta Ads management',
          'Google Ads management',
          'Advanced attribution tracking',
          'Enterprise SEO',
          '24 branded posts/month',
          'Email newsletter engine',
          'Quarterly strategy sessions',
          'Priority support',
          'Monthly ROI reviews',
          'Automation consulting',
          'Scaling roadmap',
        ],
        toneKicker: 'Your entire revenue operation. Automated.',
      },
    }
    return meta[plan]
  })

  readonly planLabel = computed(() => this.planMeta().name)

  readonly progress = computed(() => {
    // Step 1..6 => 0..1
    return (this.state.step - 1) / 5
  })

  // This onboarding is now single-flow. Kept for UI consistency.
  readonly nextStepLabel = computed(() => 'Preparing your launch details')

  profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    company: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    industry: [''],
    location: [''],
  })

  // Step 3: execution alignment (no package customization)
  alignmentForm = this.fb.nonNullable.group({
    businessOverview: ['', [Validators.required, Validators.minLength(12)]],
    targetAudience: ['', [Validators.required, Validators.minLength(4)]],
    competitorsInspiration: ['', [Validators.required, Validators.minLength(2)]],
    preferredDesignDirection: ['', [Validators.required, Validators.minLength(2)]],
    existingWebsite: [false],
    existingBranding: [false],
    projectGoals: ['', [Validators.required, Validators.minLength(8)]],
    contentReadiness: ['', Validators.required],
    specialRequirements: [''],
  })

  // Step 4/5: computed summary-only fields
  readonly setupInvestment = computed(() => {
    const base = this.planMeta().price
    const addOn = this.state.brandingAddOnSelected ? this.brandingAddOnPrice : 0
    return base + addOn
  })

  readonly monthlySubscription = computed(() => {
    return this.planMeta().monthly
  })

  ngOnInit() {
    const planFromQuery = this.route.snapshot.queryParamMap.get('plan') ?? null
    this.state = this.stateService.getInitialState(planFromQuery)

    // Keep URL plan consistent even if user reloaded on a saved state.
    const qpPlan = this.route.snapshot.queryParamMap.get('plan')
    const normalized = this.stateService.normalizePlan(qpPlan)
    if (!normalized || normalized !== this.state.plan) {
      this.router.navigate(['/onboarding'], { queryParams: { plan: this.state.plan }, replaceUrl: true })
    }

    this.patchFormsFromState()
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
    this.processingTicker && clearInterval(this.processingTicker)
  }

  private patchFormsFromState() {
    this.profileForm.patchValue({
      name: this.state.name,
      company: this.state.company,
      email: this.state.email,
      phone: this.state.phone,
      industry: this.state.industry,
      location: this.state.location,
    })
  }

  setStep(step: OnboardingStep) {
    this.state.step = step
    this.stateService.write(this.state)
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { plan: this.state.plan },
      replaceUrl: true,
    })
  }

  next() {
    const step = this.state.step

    // onboarding_step_completed should ONLY fire after successful validation/progression.
    if (step === 1) {
      // Step 1 -> 2 has no validation gates.
      this.setStep(2)
      if (!this.onboardingLifecycleFired.stepCompletedByStep.has(2)) {
        this.onboardingLifecycleFired.stepCompletedByStep.add(2)
        this.analytics.trackEvent('onboarding_step_completed', {
          plan: this.state.plan,
          // next step completed
          step: 2,
        })
      }
      return
    }


    if (step === 2) {
      this.profileForm.markAllAsTouched()
      if (this.profileForm.invalid) return

      const v = this.profileForm.getRawValue()
      this.state = {
        ...this.state,
        name: v.name,
        company: v.company,
        email: v.email,
        phone: v.phone,
        industry: v.industry,
        location: v.location,
      }
      this.stateService.write(this.state)
      this.setStep(3)
      if (!this.onboardingLifecycleFired.stepCompletedByStep.has(3)) {
        this.onboardingLifecycleFired.stepCompletedByStep.add(3)
        this.analytics.trackEvent('onboarding_step_completed', {
          plan: this.state.plan,
          step: 3,
        })
      }
      return
    }


    if (step === 3) {
      this.alignmentForm.markAllAsTouched()
      if (this.alignmentForm.invalid) return

      // Persist only branding add-on (supported by current state model)
      this.state = {
        ...this.state,
        brandingAddOnSelected: this.state.brandingAddOnSelected || false,
      }
      this.stateService.write(this.state)
      this.setStep(4)
      if (!this.onboardingLifecycleFired.stepCompletedByStep.has(4)) {
        this.onboardingLifecycleFired.stepCompletedByStep.add(4)
        this.analytics.trackEvent('onboarding_step_completed', {
          plan: this.state.plan,
          step: 4,
        })
      }
      return
    }


    if (step === 4) {
      this.setStep(5)
      if (!this.onboardingLifecycleFired.stepCompletedByStep.has(5)) {
        this.onboardingLifecycleFired.stepCompletedByStep.add(5)
        this.analytics.trackEvent('onboarding_step_completed', {
          plan: this.state.plan,
          step: 5,
        })
      }
      return
    }


    if (step === 5) {
      this.setStep(6)
      if (!this.onboardingLifecycleFired.stepCompletedByStep.has(6)) {
        this.onboardingLifecycleFired.stepCompletedByStep.add(6)
        this.analytics.trackEvent('onboarding_step_completed', {
          plan: this.state.plan,
          step: 6,
        })
      }
      return
    }


    if (step === 6) {
      // terminal
      return
    }
  }

  back() {
    const step = this.state.step
    if (step <= 1) return
    this.setStep(((step - 1) as OnboardingStep))
  }

  reset() {
    this.stateService.clear()
    this.state = this.stateService.getInitialState(this.state.plan)
    this.profileForm.reset({
      name: '',
      company: '',
      email: '',
      phone: '',
      industry: '',
      location: '',
    })
    this.alignmentForm.reset({
      businessOverview: '',
      targetAudience: '',
      competitorsInspiration: '',
      preferredDesignDirection: '',
      existingWebsite: false,
      existingBranding: false,
      projectGoals: '',
      contentReadiness: '',
      specialRequirements: '',
    })
    this.router.navigate(['/onboarding'], { queryParams: { plan: this.state.plan }, replaceUrl: true })
  }

  isInvalidProfile(field: keyof OnboardingState extends never ? never : any) {
    const control = this.profileForm.get(field as any)
    return !!(control && control.invalid && (control.touched || control.dirty))
  }

  // Step 3 branding add-on toggle (only optional add-on)
  toggleBrandingAddOn(v: boolean) {
    this.state.brandingAddOnSelected = v
    this.stateService.write(this.state)
  }

  private readonly requestLSKey = 'bleval.onboarding.request.v1'
  private readonly successHoldSeconds = 10

  // GA4 onboarding event safety (prevents duplicates & premature fires)
  private onboardingLifecycleFired = {
    started: false,
    submitted: false,
    completed: false,
    failed: false,
    stepCompletedByStep: new Set<OnboardingStep>(),
  }


  uiMode: UiMode = 'form'
  isSubmitting = false
  submitErrorMessage: string | null = null

  // Processing overlay messaging
  processingIndex = 0
  processingMessages = [
    'Processing your onboarding request…',
    'Configuring project workflow…',
    'Securing onboarding information…',
    'Sending confirmation emails…',
    'Finalizing onboarding…',
  ]


  private processingTicker?: number




  // Step 6 request submission (no direct payments)
  submitRequest() {
    if (this.isSubmitting) return
    if (this.uiMode === 'processing') return

    console.log('[Onboarding] Submission started')


    const payload = {
      plan: this.state.plan,
      profile: this.profileForm.getRawValue(),
      alignment: this.alignmentForm.getRawValue(),
      brandingAddOnSelected: this.state.brandingAddOnSelected,
      requestedAt: new Date().toISOString(),
    }

    // Persist raw payload for debugging/UX only.
    localStorage.setItem(this.requestLSKey, JSON.stringify(payload))

    this.submitErrorMessage = null
    this.isSubmitting = true
    this.uiMode = 'processing'

    // onboarding_started: fire once per request lifecycle (entered processing mode)
    if (!this.onboardingLifecycleFired.started) {
      this.onboardingLifecycleFired.started = true
      this.analytics.trackEvent('onboarding_started', {
        plan: this.state.plan,
      })
    }

    // onboarding_submitted: must fire immediately before API request
    if (!this.onboardingLifecycleFired.submitted) {
      this.onboardingLifecycleFired.submitted = true
      this.analytics.trackEvent('onboarding_submitted', {
        plan: this.state.plan,
      })
    }


    this.processingIndex = 0


    // Subtle staged message progression (keeps UX premium without changing backend logic)
    // Guard for SSR/prerender where `window` is not defined.
    this.processingTicker && clearInterval(this.processingTicker)
    if (typeof window !== 'undefined') {
      this.processingTicker = window.setInterval(() => {
        this.processingIndex = Math.min(
          this.processingMessages.length - 1,
          this.processingIndex + 1,
        )
      }, 1300) as unknown as number
    }


    this.onboardingApi.complete(payload).subscribe({
      next: (res: any) => {
        const ok = !!res?.ok && res?.onboardingCompleted === true
        if (!ok) {
          // Backend returned non-ok in a controlled way.
          if (!this.onboardingLifecycleFired.failed) {
            this.onboardingLifecycleFired.failed = true
            this.analytics.trackEvent('onboarding_failed', {
              plan: this.state.plan,
              error_stage: 'backend_non_ok',
            })
          }

          this.uiMode = 'failure'
          this.submitErrorMessage = 'We encountered an issue while submitting your onboarding request. Please try again in a moment.'
          return
        }


        // Success: clear onboarding state and request snapshot (required by spec after redirect as well)
        // We clear now to avoid stale UI; redirect happens after success hold.
        this.stateService.clear()
        try {
          localStorage.removeItem(this.requestLSKey)
        } catch {
          // ignore
        }

        console.log('[Onboarding] Backend onboarding completed')
        console.log('[Onboarding] Confirmation emails dispatched')
        console.log('[Onboarding] Redirecting to onboarding success experience')


        // onboarding_completed: MUST fire ONLY when res.ok===true && res.onboardingCompleted===true
        if (!this.onboardingLifecycleFired.completed) {
          this.onboardingLifecycleFired.completed = true
          this.analytics.trackEvent('onboarding_completed', {
            plan: this.state.plan,
            success: true,
          })
        }

        // Navigate to dedicated cinematic success page.
        this.isSubmitting = false
        this.clearProcessingTicker()


        // onb-success route handles 10s redirect countdown.
        this.router.navigate(['/onboarding/success'], { replaceUrl: true })

      },
      error: () => {
        // API error callback
        if (!this.onboardingLifecycleFired.failed) {
          this.onboardingLifecycleFired.failed = true
          this.analytics.trackEvent('onboarding_failed', {
            plan: this.state.plan,
            error_stage: 'backend_error',
          })
        }

        this.uiMode = 'failure'
        this.submitErrorMessage = 'We encountered an issue while submitting your onboarding request. Please try again in a moment.'
        this.isSubmitting = false
        this.clearProcessingTicker()
      },

    })
  }

  private clearProcessingTicker() {
    if (this.processingTicker) {
      clearInterval(this.processingTicker)
      this.processingTicker = undefined
    }
  }

  get stepClass() {

    return `onb-step-${this.state.step}`
  }

  get planAccentClass(): string {
    return this.state.plan === 'enterprise' ? 'accent-uv' : 'accent-cyan'
  }

  get processingMessage() {
    return this.processingMessages[this.processingIndex] ?? this.processingMessages[0]
  }


  // Template helpers
  get contentReadinessOptions() {
    return [
      { value: 'ready', label: 'Content ready' },
      { value: 'some', label: 'Some content available' },
      { value: 'needs', label: 'Need content support' },
    ]
  }
}

