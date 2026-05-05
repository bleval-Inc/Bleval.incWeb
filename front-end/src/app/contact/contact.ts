import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../core/toast.service';
import { ScrollRevealDirective } from '../scroll-reveal';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, ScrollRevealDirective],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  formData = {
    name: '',
    email: '',
    company: '',
    projectType: '',
    pricing: '',
    message: ''
  };

  formSubmitted = false;
  formSuccess = false;

  constructor(private toastService: ToastService) {}

  async onSubmit() {
    console.log('Form submitted:', this.formData);
    this.formSubmitted = true;

    try {
      // TODO: Replace with actual API call
      // const response = await this.http.post('/api/contact', this.formData).toPromise();

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.formSuccess = true;
      this.toastService.show(
        'Thank you for your enquiry! We\'ll be in touch within 24 hours.',
        'success'
      );

      // Reset form
      this.formData = {
        name: '',
        email: '',
        company: '',
        projectType: '',
        pricing: '',
        message: ''
      };

    } catch (error) {
      this.formSuccess = false;
      this.toastService.show(
        'Error sending message. Please try again or contact us directly.',
        'error'
      );
    }

    this.formSubmitted = false;
  }
}
