import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatBotService {
  private apiUrl = 'https://sakaniapi1.runasp.net/api/ChatBot';

  constructor(private http: HttpClient) {}

  // جلب الـ History بتاع الدردشة
  getChatHistory(): Observable<any> {

    return this.http.get(`${this.apiUrl}/history`,{withCredentials:true});
  }

  // إرسال رسالة جديدة
  sendMessage(message: string): Observable<any> {
    const body ={
      "message": message
    }
    return this.http.post(`${this.apiUrl}/ask`, body,{withCredentials:true});
  }
}