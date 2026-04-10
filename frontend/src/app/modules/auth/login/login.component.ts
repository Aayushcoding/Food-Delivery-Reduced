import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm!: FormGroup;
  submitted = false;
  loading = false;
  selectedRole: 'Customer' | 'Owner' = 'Customer';
  successMessage: string = '';
  errorMessage: string = '';
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Handle query params from registration redirect
    this.route.queryParams.subscribe(params => {
      if (params['message']) {
        this.successMessage = params['message'];
      }
      if (params['role']) {
        this.selectedRole = params['role'] as 'Customer' | 'Owner';
      }
    });
  }

  private initForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  selectRole(role: 'Customer' | 'Owner'): void {
    this.selectedRole = role;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const email = this.f['email'].value;
    const password = this.f['password'].value;
    
    console.log('[LoginComponent] Submitting login form:', { email, role: this.selectedRole });
    
    this.authService.login(email, password, this.selectedRole).subscribe(
      (user) => {
        console.log('[LoginComponent] Login successful:', user);
        this.loading = false;
        console.log('[LoginComponent] Redirecting to:', this.selectedRole === 'Customer' ? '/user/home' : '/owner/dashboard');
        if (this.selectedRole === 'Customer') {
          this.router.navigate(['/user/home']);
        } else {
          this.router.navigate(['/owner/dashboard']);
        }
      },
      error => {
        console.error('[LoginComponent] Login error:', error);
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Login failed. Please check your email and password.';
      }
    );
  }

}