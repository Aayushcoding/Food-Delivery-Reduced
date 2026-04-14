import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CustomerService } from '../../core/services/customer.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  owner: any = null;
  restaurants: any[] = [];
  selectedRestaurant: any = null;
  orders: any[] = [];

  loading = true;
  saving = false;
  deletingId: string | null = null;
  errorMessage = '';

  // Toast
  toastMessage = '';
  toastError = false;
  private toastTimer: any;

  // Add Restaurant form
  showAddForm = false;
  newRestaurant = { restaurantName: '', cuisine: '', displayImage: '' };

  // Rename / Edit state
  renamingId: string | null = null;
  renameValue = '';
  renameImageValue = '';
  renameCuisineValue = '';
  renameAddressValue = '';
  renameContactValue = '';

  readonly DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=300&fit=crop';

  constructor(
    private authService: AuthService,
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.owner = this.authService.getUser();
    if (!this.owner) { this.router.navigate(['/login']); return; }
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading = true;
    this.customerService.getRestaurantByOwner(this.owner.id).subscribe({
      next: (res) => {
        this.restaurants = res.success ? (res.data || []) : [];
        this.loading = false;
      },
      error: () => { this.restaurants = []; this.loading = false; }
    });
  }

  selectRestaurant(rest: any): void {
    if (this.selectedRestaurant?.restaurantId === rest.restaurantId) {
      // Toggle off
      this.selectedRestaurant = null;
      this.orders = [];
      return;
    }
    this.selectedRestaurant = rest;
    this.orders = [];
    this.loadOrders(rest.restaurantId);
  }

  loadOrders(restaurantId: string): void {
    this.customerService.getOrdersByRestaurant(restaurantId).subscribe({
      next: (res) => { this.orders = res.success ? (res.data || []) : []; },
      error: () => { this.orders = []; }
    });
  }

  // ── Stats getters ───────────────────────────────────────────────────
  get totalOrders(): number { return this.orders.length; }
  /** Only delivered orders count toward earnings */
  get totalEarnings(): number {
    return this.orders
      .filter(o => o.status === 'delivered')
      .reduce((s, o) => s + (o.totalAmount || 0), 0);
  }
  get pendingOrders(): number { return this.orders.filter(o => o.status === 'pending').length; }


  // ── Navigation ──────────────────────────────────────────────────────
  goToMenu(rest: any): void {
    // Always update sessionStorage to the restaurant being navigated to
    sessionStorage.setItem('ownerRestaurantId', rest.restaurantId);
    sessionStorage.setItem('ownerRestaurantName', rest.restaurantName || '');
    this.router.navigate(['/owner/menu'], {
      state: { restaurantId: rest.restaurantId, restaurantName: rest.restaurantName }
    });
  }

  goToOrders(rest: any): void {
    // Always update sessionStorage to the restaurant being navigated to
    sessionStorage.setItem('ownerRestaurantId', rest.restaurantId);
    sessionStorage.setItem('ownerRestaurantName', rest.restaurantName || '');
    this.router.navigate(['/owner/orders'], {
      state: { restaurantId: rest.restaurantId, restaurantName: rest.restaurantName }
    });
  }

  // ── Add Restaurant ──────────────────────────────────────────────────
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.newRestaurant = { restaurantName: '', cuisine: '', displayImage: '' };
  }

  addRestaurant(): void {
    if (!this.newRestaurant.restaurantName.trim()) {
      this.showToast('Restaurant name is required.', true);
      return;
    }
    this.saving = true;
    const cuisineArray = this.newRestaurant.cuisine
      ? this.newRestaurant.cuisine.split(',').map(c => c.trim()).filter(Boolean)
      : [];
    const payload = {
      restaurantName: this.newRestaurant.restaurantName.trim(),
      ownerId: this.owner.id,
      cuisine: cuisineArray,
      displayImage: this.newRestaurant.displayImage.trim()
    };
    this.customerService.createRestaurant(payload).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.success) {
          this.restaurants.push({
            ...res.data,
            displayImage: res.data.displayImage || this.DEFAULT_IMAGE
          });
          this.showAddForm = false;
          this.newRestaurant = { restaurantName: '', cuisine: '', displayImage: '' };
          this.showToast('✅ Restaurant created!', false);
        } else {
          this.showToast(res.message || 'Failed to create restaurant.', true);
        }
      },
      error: (err) => {
        this.saving = false;
        this.showToast(err?.error?.message || 'Error creating restaurant.', true);
      }
    });
  }

  // ── Rename Restaurant ───────────────────────────────────────────────
  startRename(rest: any): void {
    this.renamingId = rest.restaurantId;
    this.renameValue = rest.restaurantName;
    this.renameImageValue = rest.displayImage === this.DEFAULT_IMAGE ? '' : (rest.displayImage || '');
    this.renameCuisineValue = Array.isArray(rest.cuisine) ? rest.cuisine.join(', ') : (rest.cuisine || '');
    this.renameAddressValue = rest.address || '';
    this.renameContactValue = rest.restaurantContactNo || '';
  }

  saveRename(rest: any): void {
    if (!this.renameValue.trim()) {
      this.showToast('Restaurant name cannot be empty.', true);
      return;
    }
    const cuisineArray = this.renameCuisineValue
      ? this.renameCuisineValue.split(',').map(c => c.trim()).filter(Boolean)
      : (Array.isArray(rest.cuisine) ? rest.cuisine : []);
    this.customerService.updateRestaurant(rest.restaurantId, {
      restaurantName: this.renameValue.trim(),
      displayImage: this.renameImageValue.trim(),
      cuisine: cuisineArray,
      address: this.renameAddressValue.trim(),
      restaurantContactNo: this.renameContactValue.trim()
    }).subscribe({
      next: (res) => {
        if (res.success) {
          rest.restaurantName = this.renameValue.trim();
          rest.displayImage = this.renameImageValue.trim() || this.DEFAULT_IMAGE;
          rest.cuisine = cuisineArray;
          rest.address = this.renameAddressValue.trim();
          rest.restaurantContactNo = this.renameContactValue.trim();
          if (this.selectedRestaurant?.restaurantId === rest.restaurantId) {
            this.selectedRestaurant.restaurantName = rest.restaurantName;
            this.selectedRestaurant.displayImage = rest.displayImage;
            this.selectedRestaurant.cuisine = rest.cuisine;
            this.selectedRestaurant.address = rest.address;
          }
          this.renamingId = null;
          this.showToast('✅ Restaurant updated!', false);
        } else {
          this.showToast(res.message || 'Failed to update.', true);
        }
      },
      error: () => this.showToast('Error updating restaurant.', true)
    });
  }

  cancelRename(): void {
    this.renamingId = null;
    this.renameCuisineValue = '';
    this.renameAddressValue = '';
    this.renameContactValue = '';
  }

  deleteRestaurant(rest: any): void {
    if (!confirm(`Delete "${rest.restaurantName}"? This cannot be undone.`)) return;
    this.deletingId = rest.restaurantId;
    this.customerService.deleteRestaurant(rest.restaurantId).subscribe({
      next: (res) => {
        this.deletingId = null;
        if (res.success) {
          this.restaurants = this.restaurants.filter(r => r.restaurantId !== rest.restaurantId);
          if (this.selectedRestaurant?.restaurantId === rest.restaurantId) {
            this.selectedRestaurant = null;
            this.orders = [];
          }
          this.showToast('🗑 Restaurant deleted.', false);
        } else {
          this.showToast(res.message || 'Failed to delete restaurant.', true);
        }
      },
      error: (err) => {
        this.deletingId = null;
        this.showToast(err?.error?.message || 'Error deleting restaurant.', true);
      }
    });
  }

  imgOf(rest: any): string {
    return rest.displayImage || this.DEFAULT_IMAGE;
  }

  getCuisineString(c: any): string {
    return Array.isArray(c) ? c.join(', ') : (c || '');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToProfile(): void {
    this.router.navigate(['/owner/profile']);
  }

  showToast(msg: string, isError: boolean): void {
    this.toastMessage = msg;
    this.toastError = isError;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMessage = '', 3000);
  }
}