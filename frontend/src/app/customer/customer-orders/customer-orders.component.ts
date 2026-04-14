import { Component, OnInit, OnDestroy } from '@angular/core';

import { Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { CustomerService } from '../../core/services/customer.service';

@Component({
selector:'app-customer-orders',
templateUrl:'./customer-orders.component.html',
styleUrls:['./customer-orders.component.css']
})
export class CustomerOrdersComponent implements OnInit, OnDestroy {


orders: any[] = [];
loading: boolean = false;
errorMessage: string = '';
cancellingId: string = '';  // tracks which order is mid-cancel
toastMessage: string = '';
toastError: boolean = false;
private toastTimer: any;

// Ticker to keep the 5-minute window live without a heavy interval
private ticker: any;

constructor(
  private orderService: OrderService,
  private authService: AuthService,
  private customerService: CustomerService,
  private router: Router
){}

ngOnInit(): void {
  this.loadOrders();
  // Refresh every 30 s so cancel buttons auto-disable after the 5-min window
  this.ticker = setInterval(() => { this.orders = [...this.orders]; }, 30000);
}

ngOnDestroy(): void {
  clearInterval(this.ticker);
  clearTimeout(this.toastTimer);
}

loadOrders(): void {
  const user = this.authService.getUser();
  if (!user) {
    this.router.navigate(['/login']);
    return;
  }

  this.loading = true;
  this.errorMessage = '';

  this.orderService.getUserOrders(user.id).subscribe({
    next: (res) => {
      this.loading = false;
      if (res.success) {
        this.orders = res.data || [];
      } else {
        this.errorMessage = res.message || 'Could not load orders.';
      }
    },
    error: (err) => {
      this.loading = false;
      this.errorMessage = err?.error?.message || 'Failed to load orders. Please try again.';
      console.error('Error loading orders:', err);
    }
  });
}

/** Returns true only when the order is pending AND within the 5-minute cancel window */
canCancel(order: any): boolean {
  if (order.status !== 'pending') return false;
  const created = new Date(order.createdAt).getTime();
  const diffMs = Date.now() - created;
  return diffMs <= 5 * 60 * 1000;  // 5 minutes in ms
}

/** Returns minutes remaining in the cancel window (0 = expired) */
minutesLeft(order: any): number {
  const created = new Date(order.createdAt).getTime();
  const elapsed = (Date.now() - created) / (1000 * 60);
  return Math.max(0, Math.ceil(5 - elapsed));
}

cancelOrder(order: any): void {
  if (this.cancellingId || !this.canCancel(order)) return;
  if (!confirm('Cancel this order?')) return;

  this.cancellingId = order.id;
  this.orderService.cancelOrder(order.id).subscribe({
    next: (res) => {
      this.cancellingId = '';
      if (res.success) {
        order.status = 'cancelled';
        this.showToast('Order cancelled successfully.', false);
      } else {
        this.showToast(res.message || 'Could not cancel order.', true);
      }
    },
    error: (err) => {
      this.cancellingId = '';
      this.showToast(err?.error?.message || 'Failed to cancel order.', true);
    }
  });
}

showToast(message: string, isError: boolean): void {
  this.toastMessage = message;
  this.toastError = isError;
  clearTimeout(this.toastTimer);
  this.toastTimer = setTimeout(() => this.toastMessage = '', 3000);
}

goHome(){
  this.router.navigate(['/customer/customer-home']);
}

}