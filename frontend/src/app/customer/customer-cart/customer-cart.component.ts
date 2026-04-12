import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { CustomerService } from '../../core/services/customer.service';

@Component({
  selector:'app-customer-cart',
  templateUrl:'./customer-cart.component.html',
  styleUrls:['./customer-cart.component.css']
})
export class CustomerCartComponent implements OnInit {

  cartItems: any[] = [];       // { itemId, name, price, quantity, restaurantId }
  cartId: string = '';
  restaurantName: string = '';
  loading: boolean = false;
  cartLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    const user = this.authService.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.cartLoading = true;
    this.errorMessage = '';

    this.customerService.getCart(user.id).subscribe({
      next: (res) => {
        this.cartLoading = false;
        if (res.success && res.data) {
          this.cartId = res.data.id;

          // Backend now stores name directly in each cart item — no extra API calls needed
          this.cartItems = (res.data.items || []).map((item: any) => ({
            ...item,
            itemName: item.name || item.itemId   // 'name' is set server-side
          }));

          // Fetch restaurant name once from the cart's restaurantId
          if (res.data.restaurantId) {
            this.customerService.getRestaurantById(res.data.restaurantId).subscribe({
              next: r => { if (r.success) this.restaurantName = r.data.restaurantName; },
              error: () => {}
            });
          }
        } else {
          this.cartItems = [];
        }
      },
      error: (err) => {
        this.cartLoading = false;
        if (err.status === 404) {
          this.cartItems = []; // empty cart — valid
        } else {
          this.errorMessage = 'Failed to load cart. Please refresh.';
          console.error('Error loading cart:', err);
        }
      }
    });
  }

  // Total: price × quantity for each item
  get total(): number {
    return this.cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  }

  get itemCount(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  remove(index: number): void {
    const item = this.cartItems[index];
    if (!this.cartId || !item?.itemId) return;

    this.customerService.removeFromCart(this.cartId, item.itemId).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadCart(); // Re-sync with backend
        }
      },
      error: (err) => {
        console.error('Error removing item:', err);
        this.errorMessage = err?.error?.message || 'Could not remove item.';
      }
    });
  }

  continueShoppingOldStyle(): void {
    this.router.navigate(['/customer/customer-home']);
  }

  placeOrder(): void {
    if (this.cartItems.length === 0) return;

    const user = this.authService.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Backend reads cart by userId — no need to send items
    this.orderService.createOrder({ userId: user.id }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.cartItems = [];
          this.cartId = '';
          this.router.navigate(['/customer/success'], {
            state: { orderId: response.data?.id || 'Placed' }
          });
        } else {
          this.errorMessage = 'Failed to place order: ' + (response.message || 'Unknown error');
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Error placing order. Please try again.';
        console.error('Order error:', err);
      }
    });
  }
}
