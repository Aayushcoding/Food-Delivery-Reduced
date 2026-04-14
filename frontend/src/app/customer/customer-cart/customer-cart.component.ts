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

  // Each item: { itemId, name, itemName, price, quantity }
  cartItems: any[] = [];
  cartId: string = '';
  /** totalAmount from backend — the authoritative total */
  backendTotal: number = 0;
  loading: boolean = false;
  cartLoading: boolean = false;
  errorMessage: string = '';

  // Prevent double-tap per item during API call
  inFlight: { [itemId: string]: boolean } = {};

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
    if (!user) { this.router.navigate(['/login']); return; }

    this.cartLoading = true;
    this.errorMessage = '';

    this.customerService.getCart(user.id).subscribe({
      next: (res) => {
        this.cartLoading = false;
        if (res.success && res.data) {
          this.cartId = res.data.id;
          this.backendTotal = res.data.totalAmount || 0;
          // Backend stores 'name' in cart items — map to itemName for template
          this.cartItems = (res.data.items || []).map((item: any) => ({
            ...item,
            itemName: item.name || item.itemName || item.itemId
          }));
        } else {
          this.cartItems = [];
          this.backendTotal = 0;
        }
      },
      error: (err) => {
        this.cartLoading = false;
        this.cartItems = (err.status === 404) ? [] : [];
        if (err.status !== 404) {
          this.errorMessage = 'Failed to load cart. Please refresh.';
        }
      }
    });
  }

  // ── TOTALS ─────────────────────────────────────────────────────────
  /** Use backend total as source of truth to avoid frontend/price drift */
  get total(): number {
    return this.backendTotal || this.cartItems.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 1), 0);
  }

  get itemCount(): number {
    return this.cartItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
  }

  // ── QUANTITY CONTROLS ──────────────────────────────────────────────
  increase(item: any): void {
    if (!this.cartId || this.inFlight[item.itemId]) return;
    this.inFlight[item.itemId] = true;
    const newQty = (item.quantity || 1) + 1;

    this.customerService.updateCartItemQuantity(this.cartId, item.itemId, newQty).subscribe({
      next: (res) => {
        this.inFlight[item.itemId] = false;
        if (res.success) { item.quantity = newQty; }
      },
      error: () => { this.inFlight[item.itemId] = false; }
    });
  }

  decrease(item: any): void {
    if (!this.cartId || this.inFlight[item.itemId]) return;
    this.inFlight[item.itemId] = true;

    if ((item.quantity || 1) <= 1) {
      // Remove item entirely when qty would reach 0
      this.customerService.removeFromCart(this.cartId, item.itemId).subscribe({
        next: (res) => {
          this.inFlight[item.itemId] = false;
          if (res.success) {
            this.cartItems = this.cartItems.filter(i => i.itemId !== item.itemId);
          }
        },
        error: () => { this.inFlight[item.itemId] = false; }
      });
    } else {
      const newQty = item.quantity - 1;
      this.customerService.updateCartItemQuantity(this.cartId, item.itemId, newQty).subscribe({
        next: (res) => {
          this.inFlight[item.itemId] = false;
          if (res.success) { item.quantity = newQty; }
        },
        error: () => { this.inFlight[item.itemId] = false; }
      });
    }
  }

  remove(item: any): void {
    if (!this.cartId || !item?.itemId) return;
    this.customerService.removeFromCart(this.cartId, item.itemId).subscribe({
      next: (res) => {
        if (res.success) {
          this.cartItems = this.cartItems.filter(i => i.itemId !== item.itemId);
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Could not remove item.';
      }
    });
  }

  // ── NAVIGATION ─────────────────────────────────────────────────────
  goHome(): void {
    this.router.navigate(['/customer/customer-home']);
  }

  // ── ORDER ──────────────────────────────────────────────────────────
  placeOrder(): void {
    if (this.cartItems.length === 0) return;

    const user = this.authService.getUser();
    if (!user) { this.router.navigate(['/login']); return; }

    this.loading = true;
    this.errorMessage = '';

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
      }
    });
  }
}
