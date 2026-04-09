import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // JWT disabled for now (can be re-enabled later) — no Bearer token attached.
    // JWT tokens are commented out in AuthService
    // When re-enabled: uncomment the following:
    // const token = this.authService.getToken();
    // if (token) {
    //   req = req.clone({
    //     setHeaders: {
    //       Authorization: `Bearer ${token}`
    //     }
    //   });
    // }

    // For now, just pass through the request without adding JWT header
    return next.handle(req);
  }
}