import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  currentLang: string = '';

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.languageService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });
    this.languageService.loadSavedLang();
  }
}