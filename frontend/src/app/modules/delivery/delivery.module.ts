import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { DeliveryRoutingModule } from './delivery-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DeliveriesComponent } from './deliveries/deliveries.component';
import { DeliveryProfileComponent } from './profile/profile.component';

@NgModule({
  declarations: [
    DashboardComponent,
    DeliveriesComponent,
    DeliveryProfileComponent
  ],
  imports: [
    CommonModule,
    DeliveryRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class DeliveryModule { }