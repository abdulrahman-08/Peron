import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactUsService {

private baseURL:string='https://sakaniapi1.runasp.net/api/Inquiry'
  constructor(private _HttpClient:HttpClient) { }

  submitInquiry(data:object):Observable<any>{
    return this._HttpClient.post(`${this.baseURL}/submit-inquiry`,data,{withCredentials:true})
  }
  

}
