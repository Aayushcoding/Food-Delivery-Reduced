import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn:'root'
})
export class LoginService{

  private baseUrl='http://localhost:5000/api/auth';

  constructor(private http:HttpClient){}

  // Login requires: { email, password, role }
  login(data:any):Observable<any>{
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  // Routes to the correct endpoint based on the role field
  register(data:any):Observable<any>{
    const endpoint = data.role==='Owner' ? 'register/owner' : 'register/customer';
    return this.http.post(`${this.baseUrl}/${endpoint}`, data);
  }

  logout():void{
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  getCurrentUser():any{
    const userStr=localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isLoggedIn():boolean{
    return !!localStorage.getItem('token');
  }
}