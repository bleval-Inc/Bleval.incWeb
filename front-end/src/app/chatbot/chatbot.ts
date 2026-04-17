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
    <div class="chat-launcher" (click)="toggle()" [class.open]="isOpen()">
      <span *ngIf="!isOpen()">Chat with us</span>
      <span *ngIf="isOpen()">Close</span>
    </div>

    <div class="chat-window" *ngIf="isOpen()">
      <div class="chat-header">
        <div class="chat-avatar"></div>
        <div>
          <strong>Bleval Assistant</strong>
          <small>Typically replies instantly</small>
        </div>
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
  `
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