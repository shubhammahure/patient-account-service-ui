import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { SnackbarService } from '../../shared/services/snackbar.service';

const skipUnauthorizedEndpoints = ['/api/v1/auth/login', '/api/v1/auth/token/refresh'];

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);
  const snackbar = inject(SnackbarService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      if (skipUnauthorizedEndpoints.some((url) => req.url.includes(url))) {
        return throwError(() => error);
      }

      if (error.status === 401) {
        tokenService.clear();
        snackbar.warning('Session expired. Please login again.');
        void router.navigate(['/auth/login'], { queryParams: { reason: 'unauthorized' } });
      }

      if (error.status === 403) {
        snackbar.error('Access denied. You do not have permission for this action.');
        void router.navigate(['/error/403']);
      }

      return throwError(() => error);
    })
  );
};

