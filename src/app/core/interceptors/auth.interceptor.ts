import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthenticationService } from '../api/generated';
import { TokenService } from '../services/token.service';

const authFreeEndpoints = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/token/refresh',
  '/api/v1/health',
];

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresInMs?: number;
}

let refreshInFlight$: Observable<string> | null = null;

function unwrap<T>(response: unknown): T {
  if (response && typeof response === 'object' && 'data' in (response as Record<string, unknown>)) {
    return (response as { data: T }).data;
  }
  return response as T;
}

function redirectToLogin(router: Router): void {
  void router.navigate(['/auth/login'], { queryParams: { reason: 'unauthorized' } });
}

function refreshAccessToken(
  authApi: AuthenticationService,
  tokenService: TokenService,
  router: Router
): Observable<string> {
  if (refreshInFlight$) {
    return refreshInFlight$;
  }

  const refreshToken = tokenService.refreshToken;
  if (!refreshToken) {
    tokenService.clear();
    redirectToLogin(router);
    return throwError(() => new Error('Missing refresh token'));
  }

  refreshInFlight$ = authApi.refreshToken({ refreshToken }).pipe(
    map((responseEnvelope) => {
      const response = unwrap<TokenResponse>(responseEnvelope);
      tokenService.setTokens(
        response.accessToken,
        response.refreshToken,
        tokenService.rememberMe,
        response.expiresInMs
      );
      return response.accessToken;
    }),
    catchError((error) => {
      tokenService.clear();
      redirectToLogin(router);
      return throwError(() => error);
    }),
    finalize(() => {
      refreshInFlight$ = null;
    }),
    shareReplay(1)
  );

  return refreshInFlight$;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authApi = inject(AuthenticationService);
  const router = inject(Router);

  if (authFreeEndpoints.some((endpoint) => req.url.includes(endpoint))) {
    return next(req);
  }

  const attachToken = (token: string | null) => {
    if (!token) {
      return req;
    }

    return req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  };

  const executeRequest = (token: string | null) => next(attachToken(token)).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      if (error.status === 403) {
        void router.navigate(['/error/403']);
        return throwError(() => error);
      }

      if (error.status !== 401 || req.url.includes('/token/refresh')) {
        return throwError(() => error);
      }

      return refreshAccessToken(authApi, tokenService, router).pipe(
        switchMap((newToken) => next(attachToken(newToken))),
        catchError((refreshError) => throwError(() => refreshError))
      );
    })
  );

  if (tokenService.isAccessTokenExpired(10_000) && tokenService.refreshToken) {
    return refreshAccessToken(authApi, tokenService, router).pipe(
      switchMap((newToken) => executeRequest(newToken))
    );
  }

  if (!tokenService.accessToken && tokenService.refreshToken) {
    return refreshAccessToken(authApi, tokenService, router).pipe(
      switchMap((newToken) => executeRequest(newToken))
    );
  }

  if (!tokenService.accessToken) {
    redirectToLogin(router);
    return of(null).pipe(switchMap(() => throwError(() => new Error('Unauthorized'))));
  }

  return executeRequest(tokenService.accessToken);
};
