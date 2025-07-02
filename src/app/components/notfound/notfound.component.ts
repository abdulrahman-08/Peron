import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBlankComponent } from "../nav-blank/nav-blank.component";
import { FooterComponent } from "../footer/footer.component";
import { RouterLink } from '@angular/router';
import { LanguageService } from 'src/app/services/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-notfound',
  standalone: true,
  imports: [CommonModule, NavBlankComponent, FooterComponent,RouterLink,TranslateModule],
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.css']
})
export class NotfoundComponent {
  currentLang: string = '';
constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.languageService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });
    this.languageService.loadSavedLang();
  }
}
