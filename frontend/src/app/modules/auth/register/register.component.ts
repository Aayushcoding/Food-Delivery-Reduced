import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  submitted = false;
  loading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
  }

  private initForm(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNo: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['Customer', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  get f() {
    return this.registerForm.controls;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ 'passwordMismatch': true });
      return { 'passwordMismatch': true };
    }
    return null;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const selectedRole: 'Customer' | 'Owner' =
      this.f['role'].value === 'Owner' ? 'Owner' : 'Customer';
    const phoneDigits = String(this.f['phoneNo'].value).replace(/\D/g, '');
    const user = {
      username: String(this.f['username'].value).trim(),
      email: String(this.f['email'].value).trim().toLowerCase(),
      phoneNo: phoneDigits,
      password: String(this.f['password'].value),
      role: selectedRole
    };

    console.log('Register payload (before POST /api/users):', user);

    this.authService.register(user).subscribe(
      (createdUser) => {
        this.loading = false;
        // After successful registration, redirect to login page
        this.router.navigate(['/auth/login'], { 
          queryParams: { 
            message: 'Registration successful! Please login with your credentials.',
            role: createdUser?.role 
          }
        });
      },
      error => {
        console.error('Register error:', error);
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Registration failed. Please try again.';
      }
    );
  }

}