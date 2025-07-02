import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { LanguageService } from 'src/app/services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import { WichlistService } from 'src/app/services/wichlist.service';
import { ProfileService } from 'src/app/services/profile.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { jwtDecode } from 'jwt-decode';

interface Notification {
  id: number;
  title: string;
  message: string;
  timeAgo: string;
  createdAt?: any;
}

@Component({
  selector: 'app-nav-blank',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './nav-blank.component.html',
  styleUrls: ['./nav-blank.component.css']
})
export class NavBlankComponent implements OnInit {
  currentLang!: string;
  userName: string = '';
  profileImage: string = '';
  userInitial: string = '';
  isLoggedIn: boolean = false;
  wishCount: number = 0;
  notificationCount: number = 0;
  notifications: Notification[] = [];
  dashboard: boolean = false;

  constructor(
    private languageService: LanguageService,
    private _ProfileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private _WishListService: WichlistService,
    private _NotificationsService: NotificationsService
  ) {

  }

  ngOnInit() {
    this.languageService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });

    this.authService.isLoggedIn.subscribe({
      next: (data) => {
        this.isLoggedIn = data;
        if (data) {
          this.checkLoginStatus();
          this.checkRole();
        } else {
          this.userName = '';
          this.profileImage = '';
          this.userInitial = '';
          this.wishCount = 0;
          this.notificationCount = 0;
          this.notifications = [];
          this.dashboard = false;
        }
      }
    });
  }

  checkLoginStatus(): void {
    if (this.isLoggedIn) {
      this._NotificationsService.getAllNotifications().subscribe({
        next: (res) => {
          this.notifications = res;
          this._NotificationsService.notificationsCount.next(res.length);
        },
        error: () => {
          this.notifications = [];
          this.notificationCount = 0;
        }
      });

      this._NotificationsService.notificationsCount.subscribe({
        next: (res) => {
          this.notificationCount = res;
        }
      });

      this._WishListService.wishCount.subscribe({
        next: (data) => {
          this.wishCount = data;
        }
      });

      this._WishListService.getUserCart().subscribe({
        next: (data) => {
          this.wishCount = data.length;
        },
        error: () => {
          this.wishCount = 0;
        }
      });

      this._ProfileService.getMyProfile().subscribe({
        next: (res) => {
          this.userName = res.fullName;
          this.userInitial = res.fullName.charAt(0);
          if (res.profilePictureUrl) {
            this.profileImage = res.profilePictureUrl;
          }
        },
        error: () => {
          this.userName = '';
          this.userInitial = '';
          this.profileImage = '';
        }
      });
    }
  }

  checkRole(): void {
    const token = this.authService.getAccessToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const role = decodedToken.roles?.[1];
        this.dashboard = role === 'ADMIN';
      } catch (error) {
        this.dashboard = false;
      }
    } else {
      this.dashboard = false;
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/home']);
        this.dashboard = false;
      },
      error: () => {
        localStorage.removeItem('accessToken'); 
        this.router.navigate(['/home']);
        this.dashboard = false;
      }
    });
  }

  switchLang(lang: string) {
    this.languageService.switchLang(lang);
  }
}