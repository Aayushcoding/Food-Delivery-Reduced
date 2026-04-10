import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isLoggedIn = false;
  currentUser: any = null;
  cartCount = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    // Initialize from localStorage immediately to avoid timing issues
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      this.isLoggedIn = true;
      console.log('[NavbarComponent] Initialized from localStorage:', this.currentUser.username);
    }
  }

  ngOnInit(): void {
    console.log('[NavbarComponent] ngOnInit called');
    
    this.authService.isAuthenticated().subscribe(isAuth => {
      console.log('[NavbarComponent] isAuthenticated changed to:', isAuth);
      this.isLoggedIn = isAuth;
    });

    this.authService.getCurrentUser().subscribe(user => {
      console.log('[NavbarComponent] currentUser changed to:', user?.username || 'null');
      this.currentUser = user;
    });

    this.cartService.getCartItems().subscribe(items => {
      this.cartCount = items.length;
    });
  }

  logout(): void {
    console.log('[NavbarComponent] Logout clicked');
    this.authService.logout();
  }

  getProfileLink(): string {
    if (!this.isLoggedIn || !this.currentUser) {
      console.warn('[NavbarComponent] getProfileLink called but not logged in');
      return '/auth/login';
    }

    switch (this.currentUser.role) {
      case 'Customer':
        return '/user/profile';
      case 'Owner':
        return '/owner/profile';
      case 'DeliveryAgent':
        return '/delivery/profile';
      default:
        return '/auth/login';
    }
  }

  getHomeLink(): string {
    if (!this.isLoggedIn || !this.currentUser) {
      console.warn('[NavbarComponent] getHomeLink called but not logged in');
      return '/auth/login';
    }

    switch (this.currentUser.role) {
      case 'Customer':
        return '/user/home';
      case 'Owner':
        return '/owner/dashboard';
      case 'DeliveryAgent':
        return '/delivery/dashboard';
      default:
        return '/auth/login';
    }
  }
}