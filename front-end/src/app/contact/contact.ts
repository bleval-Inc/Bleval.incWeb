import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'
import { ContactFormComponent } from '../contact-form/contact-form';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, ContactFormComponent],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  formData = {
    name: '',
    email: '',
    company: '',
    projectType: '',
    budget: '',
    message: ''
  };

  onSubmit() {
    console.log('Form submitted:', this.formData);
    // Handle form submission, e.g., send to backend
    alert('Thank you for your enquiry. We will respond within 24 hours.');
  }
}
