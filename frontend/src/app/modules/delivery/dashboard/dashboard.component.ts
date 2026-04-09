import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order } from '../../../shared/models/index';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  activeDeliveries = 0;
  completedDeliveries = 0;
  earnings = 0;
  loading = true;
  deliveryAgentId: string | null = null;
  orders: Order[] = [];

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDeliveryData();
  }

  loadDeliveryData(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUserValue();
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.deliveryAgentId = currentUser.id;

    // Fetch orders assigned to this delivery agent
    this.apiService.getOrdersByDeliveryAgent(this.deliveryAgentId).subscribe({
      next: (orders) => {
        this.orders = orders;
        
        // Calculate statistics
        this.activeDeliveries = orders.filter(o => o.status === 'Out for Delivery').length;
        this.completedDeliveries = orders.filter(o => o.status === 'Delivered').length;
        
        // Calculate total earnings (assuming delivery fee)
        this.earnings = orders
          .filter(o => o.status === 'Delivered')
          .reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading delivery data:', error);
        this.loading = false;
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([`/delivery/${route}`]);
  }

}