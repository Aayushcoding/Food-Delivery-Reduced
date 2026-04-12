import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css']
})
export class ItemCardComponent {

  @Input() item: any;

  // Current quantity of this item in the cart (0 = not in cart)
  @Input() quantity: number = 0;

  // Disables buttons while API call is in-flight
  @Input() inFlight: boolean = false;

  // Emits the item when + or Add is clicked
  @Output() increase = new EventEmitter<any>();

  // Emits the item when − is clicked
  @Output() decrease = new EventEmitter<any>();
}
