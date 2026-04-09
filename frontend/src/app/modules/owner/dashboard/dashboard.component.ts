import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order, Menu, Restaurant } from '../../../shared/models/index';

export interface DayOrderCount {
  label: string;
  count: number;
  key: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  totalOrders = 0;
  totalRevenue = 0;
  totalMenuItems = 0;
  loading = true;
  uiReady = false;
  ownerId: string | null = null;
  ownerName = 'Owner';
  restaurant: Restaurant | null = null;
  recentOrders: Order[] = [];
  ordersByDay: DayOrderCount[] = [];
  chartMax = 1;
  loadError: string | null = null;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadOwnerData();
  }

  loadOwnerData(): void {
    this.loading = true;
    this.uiReady = false;
    this.loadError = null;

    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser?.id || currentUser.role !== 'Owner') {
      this.router.navigate(['/login']);
      return;
    }

    this.ownerId = currentUser.id;
    this.ownerName = currentUser.username || 'Owner';

    this.apiService.getRestaurants().subscribe({
      next: (restaurants) => {
        this.restaurant = restaurants.find(r => r.ownerId === this.ownerId) || null;
        this.fetchDashboardData();
      },
      error: () => {
        this.loadError = 'Could not load restaurants.';
        this.loading = false;
        this.uiReady = true;
      }
    });
  }

  private fetchDashboardData(): void {
    const menu$ = this.restaurant
      ? this.apiService.getMenusByRestaurant(this.restaurant.restaurantId)
      : of<Menu[]>([]);

    const orders$ = this.apiService.getOrders({
      ownerId: this.ownerId!,
      limit: 500,
      sortBy: 'date',
      order: 'desc'
    });

    forkJoin({
      menu: menu$.pipe(catchError(() => of<Menu[]>([]))),
      orders: orders$.pipe(catchError(() => of<Order[]>([])))
    }).subscribe({
      next: ({ menu, orders }) => {
        this.totalMenuItems = menu.length;
        this.applyOrderStats(orders);
        this.loading = false;
        requestAnimationFrame(() => {
          this.uiReady = true;
        });
      },
      error: () => {
        this.loadError = 'Could not load dashboard data.';
        this.loading = false;
        this.uiReady = true;
      }
    });
  }

  private applyOrderStats(orders: Order[]): void {
    this.totalOrders = orders.length;
    this.totalRevenue = orders.reduce(
      (sum, o) => sum + (Number(o.totalAmount) || 0),
      0
    );

    const sorted = [...orders].sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    this.recentOrders = sorted.slice(0, 5);

    this.ordersByDay = this.buildLast7DaysCounts(orders);
    this.chartMax = Math.max(
      1,
      ...this.ordersByDay.map(d => d.count)
    );
  }

  private buildLast7DaysCounts(orders: Order[]): DayOrderCount[] {
    const buckets: DayOrderCount[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      buckets.push({
        key: this.dateKeyLocal(d),
        label: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
        count: 0
      });
    }
    orders.forEach(o => {
      const od = new Date(o.date);
      const key = this.dateKeyLocal(od);
      const b = buckets.find(x => x.key === key);
      if (b) {
        b.count += 1;
      }
    });
    return buckets;
  }

  private dateKeyLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  barHeight(count: number): number {
    return Math.round((count / this.chartMax) * 100);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'badge-pending';
      case 'Preparing':
        return 'badge-preparing';
      case 'Delivered':
        return 'badge-delivered';
      case 'Confirmed':
      case 'Out for Delivery':
        return 'badge-preparing';
      case 'Cancelled':
        return 'badge-cancelled';
      default:
        return 'badge-neutral';
    }
  }

  goToAddMenu(): void {
    this.router.navigate(['/owner/menu/add']);
  }

  goToManageOrders(): void {
    this.router.navigate(['/owner/orders']);
  }

  get hasNoOrders(): boolean {
    return !this.loading && this.totalOrders === 0;
  }
}
