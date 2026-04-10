import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../../shared/models/index';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: User | null = null;
  editMode = false;
  loading = false;
  successMessage = '';
  errorMessage = '';

  profileForm = {
    username: '',
    email: '',
    phoneNo: '',
    address: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current user from storage
    this.user = this.authService.getCurrentUserValue();
    
    if (!this.user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadProfileData();
  }

  loadProfileData(): void {
    if (this.user) {
      this.profileForm = {
        username: this.user.username,
        email: this.user.email,
        phoneNo: this.user.phoneNo,
        address: this.user.address?.length > 0 
          ? `${this.user.address[0].street}, ${this.user.address[0].city}`
          : ''
      };
    }
  }

  enableEdit(): void {
    this.editMode = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.editMode = false;
    this.loadProfileData();
  }

  saveProfile(): void {
    if (!this.user) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Parse address
    const addressParts = this.profileForm.address.split(',');
    const address = [];
    if (this.profileForm.address.trim()) {
      address.push({
        street: addressParts[0]?.trim() || '',
        city: addressParts[1]?.trim() || ''
      });
    }

    // Prepare update data
    const updateData = {
      username: this.profileForm.username,
      address: address
    };

    console.log('Updating profile:', updateData);

    // TODO: Call API to update user
    // For now, just update locally
    this.user = {
      ...this.user,
      ...updateData
    };

    this.authService.updateCurrentUser(this.user);
    
    this.successMessage = 'Profile updated successfully!';
    this.editMode = false;
    this.loading = false;

    // Clear success message after 3 seconds
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  logout(): void {
    this.authService.logout();
  }
}
