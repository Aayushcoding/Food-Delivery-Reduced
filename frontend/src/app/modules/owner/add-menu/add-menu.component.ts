import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { Restaurant } from '../../../shared/models/index';

@Component({
  selector: 'app-add-menu',
  templateUrl: './add-menu.component.html',
  styleUrls: ['./add-menu.component.css']
})
export class AddMenuComponent implements OnInit {

  menuForm!: FormGroup;
  submitted = false;
  loading = false;
  restaurant: Restaurant | null = null;
  ownerId: string | null = null;

  categories = ['FastFood', 'Indian', 'Chinese', 'Continental', 'Dessert', 'Beverages'];

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadRestaurantData();
  }

  private initForm(): void {
    this.menuForm = this.formBuilder.group({
      itemName: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      description: ['', Validators.required],
      isVeg: [false]
    });
  }

  private loadRestaurantData(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser?.id || currentUser.role !== 'Owner') {
      this.router.navigate(['/login']);
      return;
    }

    this.ownerId = currentUser.id;

    // Get owner's restaurant
    this.apiService.getRestaurants().subscribe({
      next: (restaurants) => {
        const ownerRestaurant = restaurants.find(r => r.ownerId === this.ownerId);
        if (ownerRestaurant) {
          this.restaurant = ownerRestaurant;
        } else {
          alert('Please create a restaurant first');
          this.router.navigate(['/owner/dashboard']);
        }
      },
      error: (error) => {
        console.error('Error loading restaurant:', error);
      }
    });
  }

  get f() {
    return this.menuForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.menuForm.invalid) {
      return;
    }

    if (!this.restaurant?.restaurantId) {
      alert('Restaurant not found');
      return;
    }

    this.loading = true;

    const menuData = {
      ...this.menuForm.value,
      restaurantId: this.restaurant.restaurantId,
      rating: 4.0  // Default rating
    };

    this.apiService.createMenu(menuData).subscribe({
      next: (response) => {
        this.loading = false;
        alert('✓ Menu item added successfully!');
        this.menuForm.reset();
        this.submitted = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error adding menu item:', error);
        alert('Error adding menu item. Please try again.');
      }
    });
  }

}