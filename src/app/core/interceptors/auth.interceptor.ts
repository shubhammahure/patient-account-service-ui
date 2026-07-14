import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { ApiFacadeService } from '../services/api-facade.service';
import { TokenService } from '../services/token.service';

const authFreeEndpoints = ['/api/v1/auth/login', '/api/v1/auth/token/refresh', '/api/v1/health'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const api = inject(ApiFacadeService);

  const accessToken = tokenService.accessToken;
  const shouldAttachToken = accessToken && !authFreeEndpoints.some((endpoint) => req.url.includes(endpoint));

  const authReq = shouldAttachToken
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || req.url.includes('/token/refresh')) {
        return throwError(() => error);
      }

      const refreshToken = tokenService.refreshToken;
      if (!refreshToken) {
        tokenService.clear();
        return throwError(() => error);
      }

      return api.refreshToken({ refreshToken }).pipe(
        switchMap((response) => {
          tokenService.setTokens(response.accessToken, response.refreshToken);
          return next(req.clone({ setHeaders: { Authorization: `Bearer ${response.accessToken}` } }));
        }),
        catchError((refreshError) => {
          tokenService.clear();
          return throwError(() => refreshError);
        })
      );
    })
  );
};

