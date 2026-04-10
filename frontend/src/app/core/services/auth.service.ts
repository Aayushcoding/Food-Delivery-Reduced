import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from '../../shared/models/index';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoggedIn = new BehaviorSubject<boolean>(this.hasUser());
  private currentUser = new BehaviorSubject<User | null>(this.getStoredUser());

  constructor(private apiService: ApiService, private router: Router) {
    // Sync subjects on service init to ensure they match localStorage
    const storedUser = this.getStoredUser();
    if (storedUser) {
      console.log('[AuthService] Initializing from localStorage:', storedUser.username);
      this.isLoggedIn.next(true);
      this.currentUser.next(storedUser);
    } else {
      console.log('[AuthService] No user in localStorage on init');
      this.isLoggedIn.next(false);
      this.currentUser.next(null);
    }
  }

  // ✅ LOGIN - Backend returns { success: true, user: {...} }
  login(email: string, password: string, role: string): Observable<User> {
    return this.apiService.loginUser(email, password, role).pipe(
      map((response: any) => {
        console.log('[AuthService] Login response:', response);
        // Extract user from response
        const user = response.user || response.data;
        if (!user) {
          throw new Error('No user in response');
        }
        // Store user in localStorage (no token needed)
        localStorage.setItem('user', JSON.stringify(user));
        console.log('[AuthService] User stored in localStorage:', user.username);
        this.isLoggedIn.next(true);
        this.currentUser.next(user);
        console.log('[AuthService] BehaviorSubjects updated. isLoggedIn:', true, 'currentUser:', user.username);
        return user;
      }),
      catchError(err => {
        console.error('[AuthService] Login error:', err);
        return throwError(() => err);
      })
    );
  }

  // ✅ REGISTER - Backend returns { success: true, data: user, message: '...' }
  register(userData: {
    username: string;
    email: string;
    phoneNo: string;
    password: string;
    role: 'Customer' | 'Owner';
  }): Observable<User> {
    return this.apiService.createUser(userData).pipe(
      map((response: any) => {
        console.log('Register response:', response);
        // Extract user from response - backend returns data field
        const user = response.data as User;
        if (!user) {
          throw new Error('No user in registration response');
        }
        return user;
      }),
      catchError(err => {
        console.error('Register error:', err);
        return throwError(() => err);
      })
    );
  }

  // ✅ LOGOUT - Clear localStorage and redirect
  logout(): void {
    console.log('[AuthService] Logging out...');
    // Remove user from localStorage
    localStorage.removeItem('user');
    this.isLoggedIn.next(false);
    this.currentUser.next(null);
    console.log('[AuthService] User cleared from localStorage and BehaviorSubjects');
    // Redirect to login
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isLoggedIn.asObservable();
  }

  isAuthenticatedValue(): boolean {
    return this.isLoggedIn.value;
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  getCurrentUserValue(): User | null {
    return this.currentUser.value;
  }

  // Update current user in memory and storage
  updateCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.next(user);
  }

  private hasUser(): boolean {
    return !!localStorage.getItem('user');
  }

  private getStoredUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
