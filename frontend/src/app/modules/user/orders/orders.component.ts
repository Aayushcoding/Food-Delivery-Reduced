import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order } from '../../../shared/models/index';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  orders: Order[] = [];
  loading = true;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const user = this.authService.getCurrentUserValue();
    if (!user) {
      console.warn('User not authenticated');
      this.loading = false;
      return;
    }

    this.apiService.getOrders(user.id).subscribe(
      (data) => {
        this.orders = data;
        this.loading = false;
      },
      (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    );
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(/\s+/g, '-');
  }

  // Get status badge color
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Pending': return 'badge-warning';
      case 'Preparing': return 'badge-info';
      case 'Out for Delivery': return 'badge-primary';
      case 'Delivered': return 'badge-success';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  // Reorder functionality
  reorder(order: Order): void {
    if (!order.items || order.items.length === 0) {
      alert('Cannot reorder: items not found');
      return;
    }

    const user = this.authService.getCurrentUserValue();
    if (!user?.id) {
      alert('Please login first');
      return;
    }

    // Create a new cart for this restaurant
    const cartData = {
      userId: user.id,
      restaurantId: order.restaurantId,
      items: order.items.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        price: item.price
      }))
    };

    this.apiService.createCart(cartData).subscribe({
      next: (cart) => {
        alert('✓ Items added to cart! Proceed to checkout.');
        // Navigate to cart
        window.location.href = '/user/cart';
      },
      error: (error) => {
        console.error('Error creating cart:', error);
        alert('Error adding items to cart');
      }
    });
  }
}