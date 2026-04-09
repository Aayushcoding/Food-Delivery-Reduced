import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Menu, Restaurant, CartItem, User } from '../../../shared/models/index';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  restaurantId!: string;
  restaurant: Restaurant | null = null;
  menus: Menu[] = [];
  loading = true;
  quantities: { [key: string]: number } = {};
  currentUser: User | null = null;
  
  // Observable cart items from cart service
  cartItems$ = this.cartService.getCartItems();
  cartTotal$ = this.cartService.getTotalAmount();

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get current user
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    // Get restaurant ID from route params
    this.restaurantId = this.route.snapshot.paramMap.get('restaurantId') || '';
    this.loadRestaurantDetails();
    this.loadMenu();
  }

  loadRestaurantDetails(): void {
    this.apiService.getRestaurantById(this.restaurantId).subscribe({
      next: (data) => {
        this.restaurant = data;
      },
      error: () => {
        this.restaurant = null;
      }
    });
  }

  loadMenu(): void {
    this.apiService.getMenusByRestaurant(this.restaurantId).subscribe({
      next: (data) => {
        this.menus = data || [];
        this.menus.forEach(item => {
          this.quantities[item.menuId] = 0;
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  async addToCart(item: Menu): Promise<void> {
    const quantity = this.quantities[item.menuId] || 1;
    
    if (quantity === 0) {
      return;
    }

    const cartItem: CartItem = {
      itemId: item.menuId,
      name: item.itemName,
      quantity: quantity,
      price: item.price,
      description: item.description || '',
      category: item.category || '',
      isVeg: item.isVeg || false
    };

    try {
      await this.cartService.addToCart(cartItem, this.restaurantId);

      // Reset quantity
      this.quantities[item.menuId] = 0;
      
      // Show feedback
      alert(`${item.itemName} added to cart!`);
    } catch {
      alert('Failed to add item to cart');
    }
  }

  removeFromCart(itemId: string): void {
    this.cartService.removeFromCart(itemId, this.restaurantId).catch(() => {});
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity < 1) {
      this.removeFromCart(itemId);
    } else {
      this.cartService.updateQuantity(itemId, quantity, this.restaurantId).catch(() => {});
    }
  }

  proceedToCheckout(): void {
    this.router.navigate(['/user/cart']);
  }

  goBack(): void {
    this.router.navigate(['/user/restaurants']);
  }

}