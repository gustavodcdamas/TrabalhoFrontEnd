// src/app/core/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Adicione verificação adicional
          if (this.authService.isLoggedIn()) {
            this.authService.logout();
            this.router.navigate(['/auth/login'], {
              queryParams: { sessionExpired: true }
            });
          }
        } else if (error.status === 403) {
          this.snackBar.open('You do not have permission to access this resource.', 'Close', {
            duration: 5000
          });
        } else {
          this.snackBar.open(error.error?.message || 'An error occurred. Please try again.', 'Close', {
            duration: 5000
          });
        }
        
        return throwError(() => error);
      })
    );
  }
}