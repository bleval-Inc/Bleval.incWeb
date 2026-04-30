import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms'
import { ApiService } from '../core/api.service'

interface Message { role: 'user' | 'bot'; text: string }

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="chat-widget" [class.open]="isOpen()">
<button type="button" class="chat-launcher" (click)="toggle()" [attr.aria-expanded]="isOpen()" aria-label="Open chatbot">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      </button>

      <div class="chat-window" *ngIf="isOpen()">
        <div class="chat-header">
          <div class="chat-avatar"></div>
          <div>
            <strong>Bleval Assistant</strong>
            <small>Typically replies instantly</small>
          </div>
          <button type="button" class="chat-close" (click)="toggle()" aria-label="Close chat">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.59 7.1 5.7A1 1 0 0 0 5.7 7.1L10.59 12l-4.9 4.9a1 1 0 1 0 1.4 1.4L12 13.41l4.9 4.9a1 1 0 0 0 1.4-1.4L13.41 12l4.9-4.9a1 1 0 0 0 0-1.4z"/>
            </svg>
          </button>
        </div>

        <div class="chat-messages" #messageContainer>
          <div *ngFor="let msg of messages()" [class]="'message ' + msg.role">
            <div class="bubble" [innerHTML]="formatMessage(msg.text)"></div>
          </div>
          <div class="message bot" *ngIf="loading()">
            <div class="bubble typing">...</div>
          </div>
        </div>

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
  styleUrls: ['./chatbot.scss']
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('messageContainer') private container!: ElementRef
  private api = inject(ApiService)

  isOpen   = signal(false)
  loading  = signal(false)
  messages = signal<Message[]>([
    { role: 'bot', text: 'Hi! I\'m the Bleval assistant. Ask me about our services, pricing, or process — or type **contact** to get in touch.' }
  ])
  sessionKey: string | undefined
  inputControl = new FormControl('', Validators.required)

  toggle() { this.isOpen.update(v => !v) }

  formatMessage(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/•/g, '&bull;')
  }

  sendMessage() {
    const message = this.inputControl.value?.trim()
    if (!message || this.loading()) return

    this.messages.update(msgs => [...msgs, { role: 'user', text: message }])
    this.inputControl.reset()
    this.loading.set(true)

    this.api.sendChat(message, this.sessionKey).subscribe({
      next: (res) => {
        this.sessionKey = res.session_key
        this.messages.update(msgs => [...msgs, { role: 'bot', text: res.reply }])
        this.loading.set(false)
      },
      error: () => {
        this.messages.update(msgs => [...msgs, {
          role: 'bot',
          text: 'Sorry, I ran into an issue. Please email us at hello@bleval.inc'
        }])
        this.loading.set(false)
      }
    })
  }

  ngAfterViewChecked() {
    if (this.container) {
      this.container.nativeElement.scrollTop = this.container.nativeElement.scrollHeight
    }
  }
}