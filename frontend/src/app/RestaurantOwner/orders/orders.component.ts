import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CustomerService } from '../../core/services/customer.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  orders: any[] = [];
  loading = true;
  errorMessage = '';
  toastMessage = '';
  toastError = false;
  private toastTimer: any;

  readonly statuses = ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'];

  constructor(
    private authService: AuthService,
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const owner = this.authService.getUser();
    if (!owner) { this.router.navigate(['/login']); return; }

    this.customerService.getRestaurantByOwner(owner.id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.loadOrders(res.data.restaurantId);
        } else {
          this.errorMessage = 'No restaurant found.';
          this.loading = false;
        }
      },
      error: () => { this.errorMessage = 'Failed to load restaurant.'; this.loading = false; }
    });
  }

  loadOrders(restaurantId: string): void {
    this.customerService.getOrdersByRestaurant(restaurantId).subscribe({
      next: (res) => {
        const rawOrders: any[] = res.success ? (res.data || []) : [];

        // Order items now have 'name' stored directly by backend — no extra API calls needed
        this.orders = rawOrders.map(order => ({
          ...order,
          enrichedItems: (order.items || []).map((item: any) => ({
            ...item,
            itemName: item.name || item.itemId   // 'name' is always set by backend
          }))
        }));

        this.loading = false;
      },
      error: () => { this.errorMessage = 'Failed to load orders.'; this.loading = false; }
    });
  }

  updateStatus(order: any, event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.customerService.updateOrderStatus(order.id, status).subscribe({
      next: (res) => {
        if (res.success) {
          order.status = status;
          this.showToast('✅ Status updated!', false);
        }
      },
      error: () => this.showToast('Failed to update status.', true)
    });
  }

  get totalEarnings(): number {
    return this.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }

  showToast(msg: string, isError: boolean): void {
    this.toastMessage = msg;
    this.toastError = isError;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMessage = '', 3000);
  }

  goBack(): void { this.router.navigate(['/restaurant']); }
}