import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { NetworkStatusService } from '../services/network-status.service';

function requestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const network = inject(NetworkStatusService);

  if (!network.isOnline()) {
    return throwError(() => new HttpErrorResponse({
      status: 0,
      statusText: 'Offline',
      error: { code: 'NETWORK_OFFLINE', message: 'No internet connection' },
      url: req.url,
    }));
  }

  const enriched = req.clone({
    setHeaders: {
      'X-Request-Id': requestId(),
      'X-Client-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      Accept: 'application/json',
    },
  });

  return next(enriched);
};

