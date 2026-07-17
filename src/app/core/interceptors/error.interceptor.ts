import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ApiErrorHandlerService } from '../services/api-error-handler.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const apiErrorHandler = inject(ApiErrorHandlerService);

  return next(req).pipe(
    catchError((error: unknown) => {
      // Unauthorized statuses are handled by unauthorizedInterceptor to avoid duplicate routing.
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
        return throwError(() => error);
      }

      apiErrorHandler.handle(error);
      return throwError(() => error);
    })
  );
};
