import { Component, OnInit } from '@angular/core';
import { LanguageService } from './services/language.service';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Peron';
  islogin:boolean=false
  constructor(
    private languageService: LanguageService,
    private authService: AuthService, 
  ) {}

  ngOnInit() {
    this.languageService.loadSavedLang();
    this.authService.isLoggedIn.subscribe({
      next: (data) => {
        this.islogin = data;
      }
    });
  }
}