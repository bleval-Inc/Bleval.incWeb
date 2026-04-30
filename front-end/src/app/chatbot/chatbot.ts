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
          <path d="M4 4h16v12H7.5L4 19.5V4z" fill="none"/>
          <path d="M5 5v10.5L7.5 15H19V5H5zm4.5 3.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm3 0c.83 0 1.5-.67 1.5-1.5S13.33 6.5 12.5 6.5 11 7.17 11 8s.67 1.5 1.5 1.5zm3.12 3.07c.35-.36.92-.39 1.31-.08.39.32.48.93.19 1.34l-1.6 2.1c-.26.35-.74.45-1.12.23-.36-.2-.5-.65-.29-1.01l.59-1.04-.59-1.04c-.2-.36-.06-.8.29-1zm-5.7 4.38a3.5 3.5 0 0 1 6.06 0 .75.75 0 0 1-1.3.8 2 2 0 0 0-3.45 0 .75.75 0 1 1-1.3-.8z"/>
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