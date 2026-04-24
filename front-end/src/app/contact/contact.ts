import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
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

  formSubmitted = false;
  formSuccess = false;

  onSubmit() {
    console.log('Form submitted:', this.formData);
    this.formSubmitted = true;
    this.formSuccess = true;
    // Handle form submission, e.g., send to backend
    alert('Thank you for your enquiry. We will respond within 24 hours.');
  }
}
