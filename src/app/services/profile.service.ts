import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
private baseURL:string='https://sakaniapi1.runasp.net/api/Profile'
  constructor(private _HttpClient:HttpClient) { }

  getMyProfile():Observable<any>{
    return this._HttpClient.get(`${this.baseURL}/me`,{withCredentials:true})
  }
  updateProfile(formData: FormData): Observable<any> {
    return this._HttpClient.put<any>(`${this.baseURL}/update`, formData,{withCredentials:true});
  }
  changePassword(formData: FormData): Observable<any> {
    return this._HttpClient.post<any>(`${this.baseURL}/change-password`, formData);
  }
}
