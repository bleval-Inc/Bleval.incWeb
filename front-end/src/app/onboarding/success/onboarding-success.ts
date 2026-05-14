import { Component, inject, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'

@Component({
  selector: 'app-onboarding-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-success.html',
  styleUrl: './onboarding-success.scss',
})
export class OnboardingSuccessComponent implements OnInit, OnDestroy {
  private router = inject(Router)

  readonly holdSeconds = 10
  countdown = this.holdSeconds

  private timer?: number

  ngOnInit() {
    console.log('[Onboarding] Backend onboarding completed')
    console.log('[Onboarding] Confirmation emails dispatched')
    console.log('[Onboarding] Homepage redirect countdown started')


    this.timer = window.setInterval(() => {
      this.countdown = Math.max(0, this.countdown - 1)
      if (this.countdown <= 0) {
        this.finishRedirect()
      }
    }, 1000) as unknown as number
  }

  ngOnDestroy() {
    this.timer && clearInterval(this.timer)
    this.timer = undefined
  }

  returnHomeNow() {
    this.finishRedirect()
  }

  private finishRedirect() {
    console.log('[Onboarding] Redirecting to onboarding success experience')
    this.timer && clearInterval(this.timer)

    this.timer = undefined
    this.router.navigate(['/home'], { replaceUrl: true })
  }
}

