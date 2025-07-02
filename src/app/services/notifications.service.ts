import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  notificationsCount:BehaviorSubject<number>=new BehaviorSubject(0)
  
private baseURL:string='https://sakaniapi1.runasp.net/api/Notifications'
  constructor(private _HttpClient:HttpClient) { }

  getAllNotifications():Observable<any>{
    return this._HttpClient.get(this.baseURL,{withCredentials:true})
  }
  deleteNotification(id:any):Observable<any>{
    return this._HttpClient.delete(`${this.baseURL}/Delete/${id}`,{withCredentials:true})
  }
}
