import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // JWT DISABLED FOR NOW - check for user in localStorage instead
    // const token = this.authService.getToken();
    // if (!token) {
    //   this.router.navigate(['/auth/login']);
    //   return false;
    // }
    
    // Check if user exists in localStorage
    const user = this.authService.getCurrentUserValue();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    return true;
  }
}