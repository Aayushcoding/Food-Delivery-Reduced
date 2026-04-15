import {Component,OnInit} from '@angular/core';
import {FormBuilder,Validators,FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {LoginService} from 'src/app/core/services/login.service';

@Component({
  selector:'app-signup',
  templateUrl:'./signup.component.html',
  styleUrls:['./signup.component.css']
})
export class SignupComponent implements OnInit{

  signupForm!:FormGroup;
  role='customer';
  isLoading=false;
  errorMessage='';
  successMessage='';

  constructor(
    private fb:FormBuilder,
    private router:Router,
    private loginService:LoginService
  ){}

  ngOnInit():void{
    this.signupForm=this.fb.group({
      username:['', [Validators.required]],
      email:   ['', [Validators.required, Validators.email]],
      password:['', [Validators.required, Validators.minLength(6)]],
      contact: [''],
      street:  [''],
      city:    ['']
    });
  }

  selectRole(r:string){ this.role=r; }

  onSubmit(){
    if(this.signupForm.invalid){
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading=true;
    this.errorMessage='';
    this.successMessage='';

    const v = this.signupForm.value;

    // Build phone — only send if provided and 10 digits
    const phone = (v.contact || '').trim().replace(/\D/g, '');

    const payload:any={
      username: v.username,
      email:    v.email,
      password: v.password,
      phoneNo:  phone.length === 10 ? phone : '',
      role:     this.role==='owner' ? 'Owner' : 'Customer'
    };

    // Only include address if either field is filled
    if(v.street?.trim() || v.city?.trim()){
      payload.address = [{ street: v.street?.trim() || '', city: v.city?.trim() || '' }];
    }

    this.loginService.register(payload).subscribe({
      next:(res)=>{
        this.isLoading=false;
        if(res.success){
          this.successMessage='Account created! Redirecting to login...';
          setTimeout(()=>this.router.navigate(['/login']),1500);
        }else{
          this.errorMessage=res.message||'Registration failed.';
        }
      },
      error:(err)=>{
        this.isLoading=false;
        this.errorMessage=err?.error?.message||'Registration failed. Please try again.';
      }
    });
  }
}