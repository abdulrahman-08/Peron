import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private currentLang = new BehaviorSubject<string>('en'); 
  currentLang$ = this.currentLang.asObservable(); 

  constructor(private translate: TranslateService) {}

  switchLang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    this.currentLang.next(lang); 
    this.setDirection(lang);
  }

  setDirection(lang: string) {
    const htmlTag = document.documentElement;
    const bodyTag = document.body;
  
    if (lang === 'ar') {
      htmlTag.setAttribute('dir', 'rtl');
      this.loadRTLBootstrap(true);
    } else {
      htmlTag.setAttribute('dir', 'ltr');
      this.loadRTLBootstrap(false);
    }
  }
  
  loadRTLBootstrap(isRTL: boolean) {
    let existingLink = document.getElementById('bootstrapRTL') as HTMLLinkElement;
  
    if (isRTL) {
      if (!existingLink) {
        let link = document.createElement('link');
        link.id = 'bootstrapRTL';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css';
        document.head.appendChild(link);
      }
    } else {
      if (existingLink) {
        existingLink.remove();
      }
    }
  }
  

  loadSavedLang() {
    const savedLang = localStorage.getItem('lang') || 'en';
    this.translate.use(savedLang);
    this.currentLang.next(savedLang);
    this.setDirection(savedLang);
  }}
