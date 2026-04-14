import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CustomerService } from '../../core/services/customer.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  restaurant: any = null;
  menuItems: any[] = [];
  loading = true;
  saving = false;
  errorMessage = '';

  // Toast
  toastMessage = '';
  toastError = false;
  private toastTimer: any;

  // New item form
  newItem = { itemName: '', price: 0, category: '', description: '', isVeg: true, image: '' };
  showAddForm = false;

  // Edit state
  editingId: string | null = null;
  editData: any = {};

  readonly DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=200&fit=crop';

  constructor(
    private authService: AuthService,
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const owner = this.authService.getUser();
    if (!owner) { this.router.navigate(['/login']); return; }

    // 1. Try to read restaurantId from router navigation state
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as any;

    if (state?.restaurantId) {
      // Store in sessionStorage so page refresh still works
      sessionStorage.setItem('ownerRestaurantId', state.restaurantId);
      sessionStorage.setItem('ownerRestaurantName', state.restaurantName || '');
      this.loadRestaurantById(state.restaurantId);
    } else {
      // Fallback: sessionStorage (after refresh)
      const storedId = sessionStorage.getItem('ownerRestaurantId');
      if (storedId) {
        this.loadRestaurantById(storedId);
      } else {
        // Last resort: load first restaurant for this owner
        this.customerService.getRestaurantByOwner(owner.id).subscribe({
          next: (res) => {
            const list: any[] = res.success ? (res.data || []) : [];
            if (list.length > 0) {
              this.loadRestaurantById(list[0].restaurantId);
            } else {
              this.errorMessage = 'No restaurant found. Create one from the dashboard.';
              this.loading = false;
            }
          },
          error: () => { this.errorMessage = 'Failed to load restaurant.'; this.loading = false; }
        });
      }
    }
  }

  loadRestaurantById(restaurantId: string): void {
    this.customerService.getRestaurantById(restaurantId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.restaurant = res.data;
          this.loadMenu();
        } else {
          this.errorMessage = 'Restaurant not found.';
          this.loading = false;
        }
      },
      error: () => { this.errorMessage = 'Failed to load restaurant.'; this.loading = false; }
    });
  }

  loadMenu(): void {
    this.customerService.getMenuByRestaurantOwner(this.restaurant.restaurantId).subscribe({
      next: (res) => {
        this.menuItems = res.success ? (res.data || []) : [];
        this.loading = false;
      },
      error: () => { this.menuItems = []; this.loading = false; }
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.newItem = { itemName: '', price: 0, category: '', description: '', isVeg: true, image: '' };
  }

  addItem(): void {
    if (!this.newItem.itemName.trim() || !this.newItem.price) {
      this.showToast('Item name and price are required.', true);
      return;
    }
    this.saving = true;
    const payload = {
      ...this.newItem,
      restaurantId: this.restaurant.restaurantId,
      isAvailable: true
    };
    this.customerService.addMenuItem(payload).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.success) {
          this.menuItems.push(res.data);
          this.showAddForm = false;
          this.newItem = { itemName: '', price: 0, category: '', description: '', isVeg: true, image: '' };
          this.showToast('✅ Item added!', false);
        } else {
          this.showToast(res.message || 'Failed to add item.', true);
        }
      },
      error: (err) => { this.saving = false; this.showToast(err?.error?.message || 'Error adding item.', true); }
    });
  }

  startEdit(item: any): void {
    this.editingId = item.menuId;
    this.editData = {
      itemName: item.itemName,
      price: item.price,
      category: item.category,
      description: item.description || '',
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      image: item.image || ''
    };
  }

  saveEdit(item: any): void {
    this.customerService.updateMenuItemData(item.menuId, this.editData).subscribe({
      next: (res) => {
        if (res.success) {
          Object.assign(item, this.editData);
          this.editingId = null;
          this.showToast('✅ Item updated!', false);
        }
      },
      error: () => this.showToast('Failed to update item.', true)
    });
  }

  cancelEdit(): void { this.editingId = null; }

  toggleAvailability(item: any): void {
    this.customerService.updateMenuItemData(item.menuId, { isAvailable: !item.isAvailable }).subscribe({
      next: (res) => {
        if (res.success) {
          item.isAvailable = !item.isAvailable;
          this.showToast(item.isAvailable ? '✅ Item activated' : '🔕 Item deactivated', false);
        }
      },
      error: () => this.showToast('Failed to update availability.', true)
    });
  }

  deleteItem(item: any): void {
    if (!confirm(`Delete "${item.itemName}"?`)) return;
    this.customerService.deleteMenuItemById(item.menuId).subscribe({
      next: (res) => {
        if (res.success) {
          this.menuItems = this.menuItems.filter(m => m.menuId !== item.menuId);
          this.showToast('🗑 Item deleted.', false);
        }
      },
      error: () => this.showToast('Failed to delete item.', true)
    });
  }

  imgOf(item: any): string {
    return item.image || this.DEFAULT_FOOD_IMAGE;
  }

  showToast(msg: string, isError: boolean): void {
    this.toastMessage = msg;
    this.toastError = isError;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMessage = '', 3000);
  }

  goBack(): void { this.router.navigate(['/restaurant']); }
}