import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order, Restaurant } from '../../../shared/models/index';

@Component({
  selector: 'app-manage-orders',
  templateUrl: './manage-orders.component.html',
  styleUrls: ['./manage-orders.component.css']
})
export class ManageOrdersComponent implements OnInit {

  orders: Order[] = [];
  loading = true;
  updatingStatus: { [key: string]: boolean } = {};
  ownerId: string | null = null;
  restaurant: Restaurant | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser?.id) {
      console.error('User not authenticated');
      this.loading = false;
      return;
    }

    this.ownerId = currentUser.id;

    // First, get the owner's restaurant
    this.apiService.getRestaurants().subscribe({
      next: (restaurants) => {
        const ownerRestaurant = restaurants.find(r => r.ownerId === this.ownerId);
        this.restaurant = ownerRestaurant || null;
        if (!ownerRestaurant) {
          console.warn('No restaurant found for owner');
        }
        this.fetchOrders();
      },
      error: (error) => {
        console.error('Error loading restaurants:', error);
        this.loading = false;
      }
    });
  }

  fetchOrders(): void {
    if (!this.ownerId) {
      this.loading = false;
      return;
    }
    this.apiService.getOrders({
      ownerId: this.ownerId,
      limit: 500,
      sortBy: 'date',
      order: 'desc'
    }).subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  updateOrderStatus(order: Order, newStatus: string): void {
    if (!order.orderId) {
      console.error('Order ID missing');
      return;
    }

    this.updatingStatus[order.orderId] = true;

    // Prepare update payload
    const updatePayload = {
      ...(order as any),
      status: newStatus
    };

    this.apiService.updateOrder(order.orderId, updatePayload).subscribe(
      (updatedOrder) => {
        // Update local state
        const index = this.orders.findIndex(o => o.orderId === order.orderId);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }
        this.updatingStatus[order.orderId] = false;
        alert(`✓ Order status updated to ${newStatus}`);
      },
      (error) => {
        console.error('Error updating order status:', error);
        this.updatingStatus[order.orderId] = false;
        alert('Error updating status. Please try again.');
      }
    );
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase().replace(/\s+/g, '-');
  }

  getNextStatus(currentStatus: string): string {
    const statusFlow: { [key: string]: string } = {
      'Pending': 'Preparing',
      'Preparing': 'Out for Delivery',
      'Out for Delivery': 'Delivered'
    };
    return statusFlow[currentStatus] || 'Delivered';
  }
}