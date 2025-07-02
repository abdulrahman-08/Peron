import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from 'src/app/services/language.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule,TranslateModule,RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  translations: any = {}; 
  currentLang: string = 'en'; 
  currentYear: number = new Date().getFullYear();
  constructor(
    private translate: TranslateService,
    private languageService: LanguageService,
    private authService: AuthService,
    private router: Router,
    
    
  ) {}

  ngOnInit() {
    this.loadTranslations();
    this.languageService.currentLang$.subscribe((lang) => {
      this.currentLang = lang; 
    });
    this.languageService.currentLang$.subscribe((lang) => {
      this.loadTranslations(); 
    });
  }
logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: () => {
        localStorage.removeItem('accessToken'); 
        this.router.navigate(['/home']);
      }
    });
  }
  loadTranslations() {
    this.translate.get([
      'FOOTER.BRAND_NAME',
      'FOOTER.PHONE',
      'FOOTER.EMAIL', 
      'FOOTER.INFORMATION.TITLE',
      'FOOTER.INFORMATION.MY_ACCOUNT',
      'FOOTER.INFORMATION.MY_CART',
      'FOOTER.INFORMATION.MY_WISHLIST',
      'FOOTER.INFORMATION.CHECKOUT',
      'FOOTER.SERVICE.TITLE',
      'FOOTER.SERVICE.ABOUT_US',
      'FOOTER.SERVICE.PRIVACY_POLICY',
      'FOOTER.SERVICE.TERMS_CONDITIONS',
      'FOOTER.SUBSCRIBE.TITLE',
      'FOOTER.SUBSCRIBE.DESCRIPTION',
      'FOOTER.SUBSCRIBE.EMAIL',
      'FOOTER.BOTTOM_RIGHTS'
    ]).subscribe((res) => {
      this.translations = res; 
    });
  }
}
