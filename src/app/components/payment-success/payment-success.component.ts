import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { PropertyService } from 'src/app/services/property.service';
import { AuthService } from 'src/app/services/auth.service';
import { LanguageService } from 'src/app/services/language.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { environment } from 'src/environments/environment'; // تأكد من وجود ملف environment

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  sessionId: string | null = null;
  paymentStatus: string = '';
  currentLang: string = 'en';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _AuthService: AuthService,
    private _PropertyService: PropertyService,
    private _LanguageService: LanguageService,
    private _TranslateService: TranslateService
  ) {
 
  }

  ngOnInit(): void {
    this._LanguageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      this._TranslateService.use(lang);
      this.paymentStatus = this.currentLang === 'ar'
        ? 'تم الدفع بنجاح!'
        : 'Payment Successful!';
    });

    this.route.queryParams.subscribe(params => {
      this.sessionId = params['session_id'] || null;

      if (this.sessionId) {
        this._AuthService.refreshToken().subscribe({
          next: (res) => {
            if (res.token) {
              this.verifyPayment(this.sessionId!);
            } else {
              this.paymentStatus = this.currentLang === 'ar'
                ? 'خطأ في التحقق من الدفع. الرجاء المحاولة مرة أخرى أو التواصل مع الدعم.'
                : 'Error verifying payment. Please try again or contact support.';
            }
          },
          error: () => {
            this.paymentStatus = this.currentLang === 'ar'
              ? 'خطأ في التحقق من الدفع. الرجاء المحاولة مرة أخرى أو التواصل مع الدعم.'
              : 'Error verifying payment. Please try again or contact support.';
          }
        });
      } else {
        this.paymentStatus = this.currentLang === 'ar'
          ? 'معرف الجلسة غير متوفر. الرجاء التواصل مع الدعم.'
          : 'Session ID not available. Please contact support.';
      }
    });
  }

  verifyPayment(sessionId: string): void {
    this._PropertyService.verifyPayment(sessionId).subscribe({
      next: (response) => {
        this.paymentStatus = this.currentLang === 'ar'
          ? 'تم الدفع بنجاح! إعلانك الآن منشور.'
          : 'Payment Successful! Your ad is now published.';
      },
      error: () => {
        this.paymentStatus = this.currentLang === 'ar'
          ? 'خطأ في التحقق من الدفع. الرجاء المحاولة مرة أخرى أو التواصل مع الدعم.'
          : 'Error verifying payment. Please try again or contact support.';
      }
    });
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}