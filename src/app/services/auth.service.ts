import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://sakaniapi1.runasp.net/api';
  private emailOrPhone: string = '';
  private otp: string = '';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken()); 

  constructor(private _HttpClient: HttpClient, private _Router: Router) {

  }

  get isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  getIsLoggedInValue(): boolean {
    return this.isLoggedInSubject.getValue();
  }

  setemailOrPhone(emailOrPhone: string) {
    this.emailOrPhone = emailOrPhone;
  }

  getemailOrPhone() {
    return this.emailOrPhone;
  }

  setOtp(otp: string) {
    this.otp = otp;
  }

  getOtp() {
    return this.otp;
  }

  signinApi(userData: object): Observable<any> {
    return this._HttpClient.post(`${this.baseUrl}/auth/login`, userData).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('accessToken', response.token);
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  refreshToken(): Observable<any> {
    return this._HttpClient
      .post(`${this.baseUrl}/Auth/refresh-token`, {}, { withCredentials: true })
      .pipe(
        tap((response: any) => {
          if (response.token) {
            localStorage.setItem('accessToken', response.token); 
            this.isLoggedInSubject.next(true);
          } else {
            this.logout();
            throw new Error('لم يتم إرجاع Access Token من الـ Refresh');
          }
        }),
        catchError((error) => {
          this.logout();
          return throwError(() => new Error('فشل تجديد الجلسة: ' + error.message));
        })
      );
  }

  logout(): Observable<any> {
    return this._HttpClient.post(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        localStorage.removeItem('accessToken'); 
        this.isLoggedInSubject.next(false);
        this._Router.navigate(['/auth/login']);
      }),
      catchError((error) => {
        localStorage.removeItem('accessToken');
        this.isLoggedInSubject.next(false);
        this._Router.navigate(['/auth/login']);
        return throwError(() => new Error('فشل تسجيل الخروج: ' + error.message));
      })
    );
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('accessToken'); 
  }

  setRegister(userData: object): Observable<any> {
    return this._HttpClient.post(`${this.baseUrl}/auth/register`, userData, { withCredentials: true });
  }

  changePassword(userData: object): Observable<any> {
    return this._HttpClient.post(`${this.baseUrl}/Auth/reset-password`, userData, { withCredentials: true });
  }

  forgetpassword(obj: object): Observable<any> {
    return this._HttpClient.post(`${this.baseUrl}/Auth/forgot-password`, obj, { withCredentials: true });
  }

  sendOtpToResetPassword(code: object): Observable<any> {
    return this._HttpClient.post(`${this.baseUrl}/Auth/Check-Otp-For-ResetPassword`, code, { withCredentials: true });
  }

  sendOtpToConfirmedEmail(code: object): Observable<any> {
    return this._HttpClient.post(`${this.baseUrl}/Auth/Verify-Otp-ForConfirmedEmail`, code, { withCredentials: true });
  }
}