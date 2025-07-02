import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { LanguageService } from 'src/app/services/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment'; // تأكد من وجود ملف environment

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup = this._FormBuilder.group({
    email: [null, [Validators.required]],
    password: [null, [Validators.required]],
  });
  msError: string = '';
  spinCheck: boolean = false;
  inputErr: boolean = false;
  currentLang: string = 'en';

  constructor(
    private _AuthService: AuthService,
    private _Router: Router,
    private _FormBuilder: FormBuilder,
    private languageService: LanguageService,
    private translate: TranslateService
  ) {
    // تعطيل console.log في بيئة الإنتاج
    if (environment.production) {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
    }
  }

  ngOnInit(): void {
    this.languageService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
      this.translate.use(lang);
    });
    this.languageService.loadSavedLang();
  }

  setLogin(): void {
    if (this.loginForm.valid) {
      this.spinCheck = true;
      this._AuthService.signinApi(this.loginForm.value).subscribe({
        next: (response: any) => {
          this._Router.navigate(['/home']);
          this.spinCheck = false;
        },
        error: (err) => {
          this.spinCheck = false;
          this.msError = this.currentLang === 'en'
            ? 'Your Data is Incorrect please try again!'
            : 'بياناتك غير صحيحة الرجاء المحاولة مرة أخرى';
        }
      });
    } else {
      this.msError = this.currentLang === 'en'
        ? 'Email and password are required!'
        : 'البريد الإلكتروني وكلمة السر مطلوبين!';
      this.inputErr = true;
    }
  }
}