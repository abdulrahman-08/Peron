import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

private baseURL:string='https://sakaniapi1.runasp.net/api/AdminDashboard'
  constructor(private _HttpClient:HttpClient) { }

  getTotalApartmentUserrent():Observable<any>{
    return this._HttpClient.get(`${this.baseURL}/total-Apartment-User-Rent`,{withCredentials:true})
  }
  getlatestlistings():Observable<any>{
    return this._HttpClient.get(`${this.baseURL}/latest-listings`,{withCredentials:true})
  }
  getCustomerAnalysis():Observable<any>{
    return this._HttpClient.get(`${this.baseURL}/customer-analysis`,{withCredentials:true})
  } 
  getincomeAnalysis():Observable<any>{
    return this._HttpClient.get(`${this.baseURL}/income-analysis`,{withCredentials:true})
  } 
  GetLast12MonthsIncome():Observable<any>{
    return this._HttpClient.get(`${this.baseURL}/Get-Last-12-Months-Income`,{withCredentials:true})
  }
  getTotalRatings():Observable<any>{
    return this._HttpClient.get(`${this.baseURL}/total-ratings`,{withCredentials:true})
  }
  getAppRatingusers():Observable<any>{
    return this._HttpClient.get(`${this.baseURL}/app-rating-users`,{withCredentials:true})
  }
  getAverage():Observable<any>{
    return this._HttpClient.get(`${this.baseURL}/average`,{withCredentials:true})
  }
  getUsersWithPropertyPayments():Observable<any>{
    return this._HttpClient.get(`${this.baseURL}/users-with-property-payments`,{withCredentials:true})
  }
  editUserData(id:string,userData:object):Observable<any>{
    return this._HttpClient.put(`${this.baseURL}/${id}`,userData,{withCredentials:true})
  }
  deleteUser(id:string):Observable<any>{
    return this._HttpClient.delete(`${this.baseURL}/${id}`,{withCredentials:true})
  }
   deleteRating(id:string):Observable<any>{
    return this._HttpClient.delete(`${this.baseURL}/delete-rating/${id}`,{withCredentials:true})
  }
  }
