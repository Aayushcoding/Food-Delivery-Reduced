import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, Restaurant, Menu, Cart, Order, DeliveryAgent } from '../../shared/models/index';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  // User endpoints
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`);
  }

  createUser(user: {
    username: string;
    email: string;
    phoneNo: string;
    password: string;
    role: 'Customer' | 'Owner';
  }): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, user);
  }

  loginUser(email: string, password: string, role: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users/login`, { email, password, role });
  }

  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`);
  }

  // Restaurant endpoints
  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<any>(`${this.baseUrl}/restaurants`).pipe(
      map(response => {
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
  }

  searchRestaurants(filters: {
    search?: string;
    cuisine?: string;
    isVeg?: boolean;
    minRating?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Observable<Restaurant[]> {
    const params = new URLSearchParams();
    
    if (filters.search) {
      params.set('search', filters.search);
    }
    if (filters.cuisine) {
      params.set('cuisine', filters.cuisine);
    }
    if (filters.isVeg !== undefined) {
      params.set('isVeg', String(filters.isVeg));
    }
    if (filters.minRating !== undefined) {
      params.set('rating', String(filters.minRating));
    }
    if (filters.page) {
      params.set('page', String(filters.page));
    }
    if (filters.limit) {
      params.set('limit', String(filters.limit));
    }
    if (filters.sortBy) {
      params.set('sortBy', filters.sortBy);
    }
    if (filters.order) {
      params.set('order', filters.order);
    }

    const qs = params.toString();
    const url = qs ? `${this.baseUrl}/restaurants?${qs}` : `${this.baseUrl}/restaurants`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
  }

  getRestaurantById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.baseUrl}/restaurants/${id}`);
  }

  createRestaurant(restaurant: Restaurant): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.baseUrl}/restaurants`, restaurant);
  }

  updateRestaurant(id: string, restaurant: Restaurant): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.baseUrl}/restaurants/${id}`, restaurant);
  }

  deleteRestaurant(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/restaurants/${id}`);
  }

  // Menu endpoints
  getMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.baseUrl}/menu`);
  }

  getMenuById(id: string): Observable<Menu> {
    return this.http.get<Menu>(`${this.baseUrl}/menu/${id}`);
  }

  private normalizeOrdersResponse(res: any): Order[] {
    if (res && Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return [];
  }

  getMenusByRestaurant(restaurantId: string, limit = 500): Observable<Menu[]> {
    const q = `restaurantId=${encodeURIComponent(restaurantId)}&limit=${limit}`;
    return this.http.get<any>(`${this.baseUrl}/menu?${q}`).pipe(
      map(response => {
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      })
    );
  }

  createMenu(menu: Menu): Observable<Menu> {
    return this.http.post<Menu>(`${this.baseUrl}/menu`, menu);
  }

  updateMenu(id: string, menu: Menu): Observable<Menu> {
    return this.http.put<Menu>(`${this.baseUrl}/menu/${id}`, menu);
  }

  deleteMenu(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/menu/${id}`);
  }

  // Cart endpoints
  getCarts(userId?: string): Observable<Cart[]> {
    const url = userId ? `${this.baseUrl}/cart?userId=${userId}` : `${this.baseUrl}/cart`;
    return this.http.get<Cart[]>(url);
  }

  getCartById(id: string): Observable<Cart> {
    return this.http.get<Cart>(`${this.baseUrl}/cart/${id}`);
  }

  createCart(cart: any): Observable<Cart> {
    return this.http.post<Cart>(`${this.baseUrl}/cart`, cart);
  }

  updateCart(id: string, cart: Cart): Observable<Cart> {
    return this.http.put<Cart>(`${this.baseUrl}/cart/${id}`, cart);
  }

  deleteCart(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cart/${id}`);
  }

  // Get cart by user ID
  getCartByUser(userId: string): Observable<Cart> {
    return this.http.get<Cart>(`${this.baseUrl}/cart/user/${userId}`);
  }

  // Add item to cart
  addItemToCart(cartId: string, item: any): Observable<Cart> {
    return this.http.post<Cart>(`${this.baseUrl}/cart/add-item`, { cartId, ...item });
  }

  // Update item quantity in cart
  updateItemQuantity(cartId: string, itemId: string, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.baseUrl}/cart/update-quantity`, { cartId, itemId, quantity });
  }

  // Remove item from cart
  removeItemFromCart(cartId: string, itemId: string): Observable<Cart> {
    return this.http.post<Cart>(`${this.baseUrl}/cart/remove-item`, { cartId, itemId });
  }

  // Order endpoints — backend returns { success, total, page, data }
  getOrders(query?: string | {
    userId?: string;
    ownerId?: string;
    restaurantId?: string;
    deliveryAgentId?: string;
    status?: string;
    limit?: number;
    page?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Observable<Order[]> {
    const params = new URLSearchParams();
    if (typeof query === 'string') {
      params.set('userId', query);
    } else if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && `${v}` !== '') {
          params.set(k, String(v));
        }
      });
    }
    const qs = params.toString();
    const url = qs ? `${this.baseUrl}/orders?${qs}` : `${this.baseUrl}/orders`;
    return this.http.get<any>(url).pipe(map(res => this.normalizeOrdersResponse(res)));
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/${id}`);
  }

  createOrder(order: any): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders`, order);
  }

  // Place order from cart (converts cart to order)
  placeOrderFromCart(cartId: string, deliveryAddress: string): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders/place`, { cartId, deliveryAddress });
  }

  updateOrder(id: string, order: Order): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/orders/${id}`, order);
  }

  deleteOrder(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/orders/${id}`);
  }

  // Get orders by delivery agent (for delivery dashboard)
  getOrdersByDeliveryAgent(agentId: string): Observable<Order[]> {
    return this.getOrders({ deliveryAgentId: agentId, limit: 200, sortBy: 'date', order: 'desc' });
  }

  // Delivery Agent endpoints
  getDeliveryAgents(): Observable<DeliveryAgent[]> {
    return this.http.get<DeliveryAgent[]>(`${this.baseUrl}/delivery`);
  }

  getDeliveryAgentById(id: string): Observable<DeliveryAgent> {
    return this.http.get<DeliveryAgent>(`${this.baseUrl}/delivery/${id}`);
  }

  createDeliveryAgent(agent: DeliveryAgent): Observable<DeliveryAgent> {
    return this.http.post<DeliveryAgent>(`${this.baseUrl}/delivery`, agent);
  }

  updateDeliveryAgent(id: string, agent: DeliveryAgent): Observable<DeliveryAgent> {
    return this.http.put<DeliveryAgent>(`${this.baseUrl}/delivery/${id}`, agent);
  }

  deleteDeliveryAgent(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delivery/${id}`);
  }
}