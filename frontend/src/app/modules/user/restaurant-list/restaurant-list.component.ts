import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Restaurant } from '../../../shared/models/index';

@Component({
  selector: 'app-restaurant-list',
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.css']
})
export class RestaurantListComponent implements OnInit {

  restaurants: Restaurant[] = [];
  selectedRestaurant: Restaurant | null = null;
  loading = true;
  searchText = '';

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading = true;

    this.apiService.getRestaurants().subscribe({
      next: (data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          this.restaurants = data;
        } else {
          this.restaurants = this.getDummyRestaurants();
        }
        this.loading = false;
      },
      error: () => {
        this.restaurants = this.getDummyRestaurants();
        this.loading = false;
      }
    });
  }

  get filteredRestaurants(): Restaurant[] {
    if (!this.searchText) {
      return this.restaurants;
    }
    return this.restaurants.filter(r =>
      r.restaurantName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  selectRestaurant(restaurant: Restaurant): void {
    this.selectedRestaurant = restaurant;
    // Navigate to menu page after a small delay to show selection
    setTimeout(() => {
      this.router.navigate(['/user/menu', restaurant.restaurantId]);
    }, 200);
  }

  private getDummyRestaurants(): Restaurant[] {
    return [
      {
        restaurantId: 'rest_dummy_1',
        restaurantName: 'Spice Village',
        ownerId: 'usr_dummy',
        contactNo: '+919999999999',
        address: '123 Main Street, Mumbai',
        email: 'spice@example.com',
        cuisine: ['Indian', 'Chinese'],
        isVeg: false,
        rating: 4.2,
        gstinNo: 'GST123456',
        imageUrl: 'https://source.unsplash.com/featured/?restaurant'
      },
      {
        restaurantId: 'rest_dummy_2',
        restaurantName: 'Green Garden',
        ownerId: 'usr_dummy',
        contactNo: '+919888888888',
        address: '456 Park Avenue, Delhi',
        email: 'green@example.com',
        cuisine: ['Indian', 'Continental'],
        isVeg: true,
        rating: 4.5,
        gstinNo: 'GST789012',
        imageUrl: 'https://source.unsplash.com/featured/?restaurant,veg'
      },
      {
        restaurantId: 'rest_dummy_3',
        restaurantName: 'Ocean Grill',
        ownerId: 'usr_dummy',
        contactNo: '+919777777777',
        address: '789 Beach Road, Chennai',
        email: 'ocean@example.com',
        cuisine: ['Chinese', 'FastFood'],
        isVeg: false,
        rating: 4.0,
        gstinNo: 'GST345678',
        imageUrl: 'https://source.unsplash.com/featured/?restaurant,grill'
      }
    ];
  }

}