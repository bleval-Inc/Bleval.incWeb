import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { ApiService } from '../core/api.service';

interface CTA {
  type: 'contact' | 'booking' | 'none';
  label: string;
  link: string;
}

interface Message {
  role: 'user' | 'bot';
  text: string;
  cta?: CTA[] | null;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="chat-widget" [class.open]="isOpen()">
      <!-- Launcher -->
      <button
        type="button"
        class="chat-launcher"
        (click)="toggle()"
        [attr.aria-expanded]="isOpen()"
        aria-label="Open chatbot"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="5" width="16" height="12" rx="4" stroke="currentColor" stroke-width="2" />

          <circle cx="9" cy="11" r="1.2" fill="currentColor" />
          <circle cx="12" cy="11" r="1.2" fill="currentColor" />
          <circle cx="15" cy="11" r="1.2" fill="currentColor" />

          <path
            d="M10 17L8 21L13 17"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <!-- Chat Window -->
      <div class="chat-window" *ngIf="isOpen()">
        <div class="chat-header">
          <div class="chat-avatar"></div>
          <div>
            <strong>Bleval Assistant</strong>
            <small>Typically replies instantly</small>
          </div>
          <button type="button" class="chat-close" (click)="toggle()">×</button>
        </div>

        <!-- Messages -->
        <div class="chat-messages" #messageContainer>
          <div *ngFor="let msg of messages()" [class]="'message ' + msg.role">
            <div class="bubble" [innerHTML]="formatMessage(msg.text)"></div>

            <!-- ✅ MULTI CTA SUPPORT -->
            <div class="cta-buttons" *ngIf="msg.cta?.length">
              <a *ngFor="let c of msg.cta" [routerLink]="c.link" class="cta-btn" [ngClass]="c.type">
                {{ c.label }}
              </a>
            </div>
          </div>

          <!-- Typing -->
          <div class="message bot" *ngIf="loading()">
            <div class="bubble typing">...</div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input">
          <input
            [formControl]="inputControl"
            placeholder="Type a message..."
            (keyup.enter)="sendMessage()"
          />
          <button (click)="sendMessage()" [disabled]="loading()">Send</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./chatbot.scss'],
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('messageContainer') private container!: ElementRef;
  private api = inject(ApiService);

  isOpen = signal(false);
  loading = signal(false);

  messages = signal<Message[]>([
    {
      role: 'bot',
      text: `Hi! I'm the Bleval assistant. Ask me about our **services**, **pricing**, or **process** — or type **contact** to get in touch.`,
      cta: null,
    },
  ]);

  sessionKey: string | undefined;
  inputControl = new FormControl('', Validators.required);
  leadEmailControl = new FormControl('', [Validators.required, Validators.email]);

  toggle() {
    this.isOpen.update((v) => !v);
  }

  // ✅ safer formatting
  formatMessage(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/•/g, '&bull;');
  }

  sendMessage() {
    const message = this.inputControl.value?.trim();

    if (!message || this.loading()) return;

    // Add user message
    this.messages.update((msgs) => [...msgs, { role: 'user', text: message }]);

    this.inputControl.reset();
    this.loading.set(true);

    this.api.sendChat(message, this.sessionKey).subscribe({
      next: (res) => {
        this.sessionKey = res.session_key;

        // ✅ normalize CTA to always be array
        let normalizedCTA: CTA[] | null = null;

        if (Array.isArray(res.cta)) {
          normalizedCTA = res.cta as CTA[];
        } else if (res.cta) {
          normalizedCTA = [res.cta as CTA];
        }

        this.messages.update((msgs) => [
          ...msgs,
          {
            role: 'bot',
            text: res.reply,
            cta: normalizedCTA,
          },
        ]);

        this.loading.set(false);
      },

      error: () => {
        this.messages.update((msgs) => [
          ...msgs,
          {
            role: 'bot',
            text: 'Something went wrong. Please contact us directly at hello@bleval.inc',
            cta: [{ type: 'contact', label: 'Contact Us', link: '/contact' }],
          },
        ]);

        this.loading.set(false);
      },
    });
  }

  // ✅ smooth auto-scroll
  ngAfterViewChecked() {
    if (this.container) {
      requestAnimationFrame(() => {
        this.container.nativeElement.scrollTop = this.container.nativeElement.scrollHeight;
      });
    }
  }
}
