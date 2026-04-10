import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DeliveriesComponent } from './deliveries/deliveries.component';
import { DeliveryProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'deliveries', component: DeliveriesComponent },
  { path: 'profile', component: DeliveryProfileComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeliveryRoutingModule { }