import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http    = inject(HttpClient)
  private baseUrl = environment.apiUrl
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'X-Client-ID':  environment.clientId,
  })

  private get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, { headers: this.headers })
  }

  private post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, { headers: this.headers })
  }

  submitContact(data: { name: string; email: string; phone?: string; message: string }): Observable<{ success: boolean; id: string }> {
    return this.post('/contact', data)
  }

  sendChat(message: string, sessionKey?: string): Observable<{ reply: string; session_key: string }> {
    return this.post('/chat', { message, session_key: sessionKey })
  }

  getBookingServices(): Observable<{ services: any[] }> {
    return this.get('/bookings/services')
  }

  getAvailableSlots(serviceId: string, date: string): Observable<{ slots: string[] }> {
    return this.get(`/bookings/slots/${serviceId}?date=${date}`)
  }

  createBooking(data: { service_id: string; contact_name: string; contact_email: string; contact_phone?: string; start_time: string; notes?: string }): Observable<any> {
    return this.post('/bookings', data)
  }

  requestQuote(data: { name: string; email: string; phone?: string; service: string; budget?: string; message: string }): Observable<{ success: boolean }> {
    return this.post('/contact', { ...data, source: 'quote_request' })
  }

  getBlogPosts(limit = 6): Observable<{ posts: any[] }> {
    return this.get(`/blog?limit=${limit}`)
  }
}