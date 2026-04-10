import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    console.log('[RoleGuard] Checking role for route:', route.url);
    const user = this.authService.getCurrentUserValue();
    
    if (!user) {
      console.log('[RoleGuard] No user found. Redirecting to login.');
      this.router.navigate(['/login']);
      return false;
    }

    const expectedRoles = route.data['roles'] as string[];
    console.log('[RoleGuard] User role:', user.role, '- Expected roles:', expectedRoles);
    
    if (expectedRoles && !expectedRoles.includes(user.role)) {
      console.log('[RoleGuard] Role mismatch! Redirecting to appropriate dashboard.');
      // Redirect to appropriate dashboard based on user's actual role
      switch (user.role) {
        case 'Customer':
          this.router.navigate(['/user/home']);
          break;
        case 'Owner':
          this.router.navigate(['/owner/dashboard']);
          break;
        case 'DeliveryAgent':
          this.router.navigate(['/delivery/dashboard']);
          break;
        default:
          this.router.navigate(['/login']);
      }
      return false;
    }

    console.log('[RoleGuard] Role check passed. Allowing access.');
    return true;
  }
}