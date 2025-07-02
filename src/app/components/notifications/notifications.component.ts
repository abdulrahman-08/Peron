import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';

interface Notification {
  id: number;
  title: string;
  message: string;
  timeAgo: string;
  createdAt?: any;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  currentLang: string = '';

  constructor(
    private _NotificationsService: NotificationsService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.languageService.currentLang$.subscribe((lang) => {
      this.currentLang = lang;
    });
    this.languageService.loadSavedLang();
    this._NotificationsService.getAllNotifications().subscribe({
      next: (res) => {
        this.notifications = res;
      },
      error: (err) => {
      }
    });
  }

  deleteNotification(id: number): void {
    this._NotificationsService.deleteNotification(id).subscribe({
      next: (res) => {
        this.notifications = res;
        this._NotificationsService.notificationsCount.next(res.length);
      },
      error: (err) => {
        
      }
    });
  }
}