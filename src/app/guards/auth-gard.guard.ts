import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment'; // تأكد من وجود ملف environment

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {
    // تعطيل console.log في بيئة الإنتاج
    if (environment.production) {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
    }
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const authRequired = route.data?.['authRequired'] === false;
    const path = route.routeConfig?.path;

    if (this.authService.isAuthenticated()) {
      return this.checkAccess(route, path, authRequired);
    }

    return this.authService.refreshToken().pipe(
      map((response) => {
        if (response && response.token) {
          return this.checkAccess(route, path, authRequired);
        }
        this.authService.logout();
        return this.handleUnauthenticated(authRequired);
      }),
      catchError(() => {
        this.authService.logout();
        return of(this.handleUnauthenticated(authRequired));
      })
    );
  }

  private checkAccess(route: ActivatedRouteSnapshot, path: string | undefined, authRequired: boolean): boolean {
    const token = this.authService.getAccessToken();
    let role = 'user';

    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        role = decodedToken.roles?.[1] || 'user';
      } catch {
        role = 'user';
      }
    }

    if (path === 'dashboard') {
      if (role !== 'ADMIN') {
        this.router.navigate(['/home']);
        return false;
      }
      localStorage.setItem('lang', 'en');
      return true;
    }

    if (path === 'advertise' && authRequired) {
      this.router.navigate(['/home']);
      return false;
    }

    if (authRequired) {
      this.router.navigate(['/home']);
      return false;
    }

    return true;
  }

  private handleUnauthenticated(authRequired: boolean): boolean {
    if (authRequired) {
      return true;
    }
    this.router.navigate(['auth/login']);
    return false;
  }
}