import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Restaurant } from '../../../shared/models/index';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  restaurants: Restaurant[] = [];
  allRestaurants: Restaurant[] = [];
  loading = true;
  selectedCategory: string | null = null;
  searchQuery: string = '';
  minRating: number = 0;
  vegOnly: boolean = false;

  categories = [
    { name: 'Pizza', icon: 'fas fa-pizza-slice', cuisine: 'Pizza' },
    { name: 'Burger', icon: 'fas fa-hamburger', cuisine: 'Burger' },
    { name: 'Biryani', icon: 'fas fa-utensils', cuisine: 'Biryani' },
    { name: 'Chinese', icon: 'fas fa-dragon', cuisine: 'Chinese' },
    { name: 'Ice Cream', icon: 'fas fa-ice-cream', cuisine: 'Ice Cream' },
    { name: 'Cake', icon: 'fas fa-birthday-cake', cuisine: 'Cake' },
    { name: 'Veg', icon: 'fas fa-leaf', cuisine: null },
    { name: 'Non-Veg', icon: 'fas fa-drumstick-bite', cuisine: null }
  ];

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading = true;
    this.apiService.getRestaurants().subscribe(
      (data) => {
        this.allRestaurants = data;
        this.restaurants = data;
        this.loading = false;
      },
      (error) => {
        console.error('Error loading restaurants:', error);
        this.loading = false;
      }
    );
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onMinRatingChange(): void {
    this.applyFilters();
  }

  toggleVegOnly(): void {
    this.vegOnly = !this.vegOnly;
    this.applyFilters();
  }

  filterByCategory(category: any): void {
    if (category.name === 'Veg') {
      this.selectedCategory = null;
      this.vegOnly = true;
    } else if (category.name === 'Non-Veg') {
      this.selectedCategory = null;
      this.vegOnly = false;
    } else {
      this.selectedCategory = this.selectedCategory === category.cuisine ? null : category.cuisine;
      this.vegOnly = false;
    }
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allRestaurants];

    // Apply search filter (restaurant name, cuisine, address)
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.restaurantName.toLowerCase().includes(query) ||
        r.address.toLowerCase().includes(query) ||
        r.cuisine.some(c => c.toLowerCase().includes(query))
      );
    }

    // Apply category/cuisine filter
    if (this.selectedCategory) {
      filtered = filtered.filter(r =>
        r.cuisine.some(c => c.toLowerCase().includes(this.selectedCategory!.toLowerCase()))
      );
    }

    // Apply veg/non-veg filter
    if (this.vegOnly !== undefined) {
      filtered = filtered.filter(r => r.isVeg === this.vegOnly);
    }

    // Apply rating filter
    if (this.minRating > 0) {
      filtered = filtered.filter(r => r.rating >= this.minRating);
    }

    this.restaurants = filtered;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.minRating = 0;
    this.vegOnly = false;
    this.restaurants = [...this.allRestaurants];
  }

  viewMenu(restaurantId: string): void {
    this.router.navigate(['/user/restaurant', restaurantId]);
  }

  isSelectedCategory(category: any): boolean {
    if (category.name === 'Veg') {
      return this.vegOnly === true;
    }
    if (category.name === 'Non-Veg') {
      return this.vegOnly === false;
    }
    return this.selectedCategory === category.cuisine;
  }
}