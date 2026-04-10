import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('[AuthGuard] Checking access to:', state.url);
    
    // Check user in BehaviorSubject value
    let user = this.authService.getCurrentUserValue();
    
    // Fallback: if BehaviorSubject is empty, check localStorage directly
    if (!user) {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        try {
          user = JSON.parse(userJson);
          if (user) {
            console.log('[AuthGuard] Found user in localStorage, syncing:', user.username);
          }
        } catch (e) {
          console.error('[AuthGuard] Failed to parse localStorage user:', e);
        }
      }
    }
    
    if (!user) {
      console.log('[AuthGuard] No user found. Redirecting to login.');
      this.router.navigate(['/auth/login']);
      return false;
    }
    
    console.log('[AuthGuard] User authenticated:', user.username, '- Allowing access');
    return true;
  }
}