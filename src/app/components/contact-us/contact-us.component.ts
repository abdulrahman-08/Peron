import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactUsService } from 'src/app/services/contact-us.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {
  isSubmitting: boolean = false;
  submitSuccess: boolean = false;
  submitError: string | null = null;
  currentLang: string = 'en';
  contactForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _ContactUsService: ContactUsService,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
      message: ['', [Validators.required, Validators.maxLength(300)]]
    });
  }

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
      this.translate.use(lang);
      // Update submitError message based on the current language
      if (this.submitError) {
        this.translate.get('CONTACT_US.FORM.ERROR.SUBMIT_FAILED').subscribe((translatedError: string) => {
          this.submitError = translatedError;
        });
      }
    });
    this.languageService.loadSavedLang();
  }

  getMessageLength(): number {
    return this.contactForm.get('message')?.value?.length || 0;
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = null;

    this._ContactUsService.submitInquiry(this.contactForm.value).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.contactForm.reset();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.translate.get('CONTACT_US.FORM.ERROR.SUBMIT_FAILED').subscribe((translatedError: string) => {
          this.submitError = translatedError;
        });
        console.error('Error sending contact form:', error);
      }
    });
  }
}