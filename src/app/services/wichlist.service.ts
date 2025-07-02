import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WichlistService {
private baseUrl = 'https://sakaniapi1.runasp.net/api/Favorites';
wishCount:BehaviorSubject<number>=new BehaviorSubject(0)
constructor(private _HttpClient:HttpClient) { }
getUserCart():Observable<any>{
  return this._HttpClient.get(`${this.baseUrl}/user-favorites`,{
    withCredentials: true 
  })
}
addToWishList(id:string):Observable<any>{
  return this._HttpClient.post(`${this.baseUrl}/add/${id}`,{
    withCredentials: true 
  });

}
removeitem(id:string):Observable<any>{
  return this._HttpClient.delete(`${this.baseUrl}/remove/${id}`,{
    withCredentials: true 
  })
}
}
