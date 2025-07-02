import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private baseUrl = 'https://sakaniapi1.runasp.net/api';

  constructor(
    private _HttpClient: HttpClient,
    private _Router: Router
  ) {}

  getAllPropertys(): Observable<any> {
    return this._HttpClient
      .get(`${this.baseUrl}/Property`, {
        withCredentials: true 
      })
  }
  getPropertyDetails(id:any): Observable<any> {
    return this._HttpClient
      .get(`${this.baseUrl}/Property/${id}`, {
        withCredentials: true 
      })
  }
  getPropertyRating(id:any): Observable<any> {
    return this._HttpClient
      .get(`${this.baseUrl}/rating/Property/${id}`, {
        withCredentials: true 
      })
  }
  addPropertyRating(obj:any): Observable<any> {
    return this._HttpClient
      .post(`${this.baseUrl}/Rating/add`,obj, {
        withCredentials: true 
      })
  }
  addProperty(obj:any): Observable<any> {
    return this._HttpClient
      .post(`${this.baseUrl}/Property/pending`,obj, {
        withCredentials: true 
      })
  }
  verifyPayment(sessionId:string|null): Observable<any> {
    return this._HttpClient
      .post(`${this.baseUrl}/Property/confirm?session_id=${sessionId}`, {
        withCredentials: true 
      })
  }
}