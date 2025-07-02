import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class isloginGard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    console.log('Route:', route.routeConfig?.path);

    if (this.authService.isAuthenticated()) {
      console.log("is log truuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu")

      return true;
    }

    console.log('User is not authenticated (token not in memory), attempting to refresh token');
    return this.authService.refreshToken().pipe(
      map((response) => {
        if (response && response.token) {
      console.log("is refresh  truuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu")
return true
        }
      console.log("is log truuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu")

        return true;
        
      }),
      catchError((error) => {
        return of(false);
      })
    );
  }
}