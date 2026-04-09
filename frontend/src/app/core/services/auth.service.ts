import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from '../../shared/models/index';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoggedIn = new BehaviorSubject<boolean>(this.hasUser());
  private currentUser = new BehaviorSubject<User | null>(this.getStoredUser());

  constructor(private apiService: ApiService) { }

  login(email: string, password: string, role: string): Observable<User> {
    return this.apiService.loginUser(email, password, role).pipe(
      map((response: any) => {
        // JWT disabled - just extract user object
        const user = response.user;
        // Store user in localStorage (no token needed)
        localStorage.setItem('user', JSON.stringify(user));
        this.isLoggedIn.next(true);
        this.currentUser.next(user);
        return user;
      }),
      catchError(err => throwError(() => err))
    );
  }

  register(userData: {
    username: string;
    email: string;
    phoneNo: string;
    password: string;
    role: 'Customer' | 'Owner';
  }): Observable<User> {
    return this.apiService.createUser(userData).pipe(
      map((response: any) => {
        const user = response.data as User;
        return user;
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    // Remove user from localStorage
    localStorage.removeItem('user');
    this.isLoggedIn.next(false);
    this.currentUser.next(null);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isLoggedIn.asObservable();
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  getCurrentUserValue(): User | null {
    return this.currentUser.value;
  }

  // JWT is disabled - no token handling needed
  // getToken(): string | null {
  //   return localStorage.getItem('token');
  // }

  private hasUser(): boolean {
    return !!localStorage.getItem('user');
  }

  private getStoredUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
