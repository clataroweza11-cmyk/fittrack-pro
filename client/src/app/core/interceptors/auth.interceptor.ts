import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Functional HTTP interceptor that:
 * 1. Attaches Bearer JWT token to every request
 * 2. Handles 401 responses by logging out
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  // Clone request with Authorization header if token exists
  const authReq = token
    ? req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Auto-logout on 401 Unauthorized (token expired, etc.)
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
