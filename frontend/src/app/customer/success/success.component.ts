import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent {

  orderId: string = '';

  constructor(private router: Router) {
    // Try router navigation state first (same-session navigate)
    const nav = this.router.getCurrentNavigation();
    const stateOrderId = nav?.extras?.state?.['orderId'];

    if (stateOrderId) {
      this.orderId = stateOrderId;
      // Save to sessionStorage so a refresh still shows the order ID
      sessionStorage.setItem('lastOrderId', stateOrderId);
    } else {
      // Fallback: read from sessionStorage (page refresh case)
      this.orderId = sessionStorage.getItem('lastOrderId') || '';
    }
  }

  goHome(): void {
    this.router.navigate(['/customer/customer-home']);
  }

  goOrders(): void {
    this.router.navigate(['/customer/orders']);
  }
}