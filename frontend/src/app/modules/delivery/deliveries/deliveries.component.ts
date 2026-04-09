import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order } from '../../../shared/models/index';

@Component({
  selector: 'app-deliveries',
  templateUrl: './deliveries.component.html',
  styleUrls: ['./deliveries.component.css']
})
export class DeliveriesComponent implements OnInit {

  deliveries: Order[] = [];
  loading = true;
  updatingStatus: { [key: string]: boolean } = {};

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDeliveries();
  }

  loadDeliveries(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser?.id) {
      console.error('User not authenticated');
      this.loading = false;
      return;
    }

    // Get orders assigned to this delivery agent
    this.apiService.getOrdersByDeliveryAgent(currentUser.id).subscribe(
      (data) => {
        // Show only in-progress deliveries (exclude delivered)
        this.deliveries = data.filter(o => o.status !== 'Delivered');
        this.loading = false;
      },
      (error) => {
        console.error('Error loading deliveries:', error);
        this.loading = false;
      }
    );
  }

  updateDeliveryStatus(order: Order, newStatus: string): void {
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
        const index = this.deliveries.findIndex(d => d.orderId === order.orderId);
        if (index !== -1) {
          this.deliveries[index] = updatedOrder;
        }
        this.updatingStatus[order.orderId] = false;
        alert(`✓ Delivery status updated to ${newStatus}`);
      },
      (error) => {
        console.error('Error updating delivery status:', error);
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