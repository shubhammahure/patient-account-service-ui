import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { httpInterceptor } from './core/interceptors/http.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { retryInterceptor } from './core/interceptors/retry.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { unauthorizedInterceptor } from './core/interceptors/unauthorized.interceptor';
import { provideApi } from './core/api/generated';
import { getApiBasePath } from './core/config/runtime-env';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideApi(getApiBasePath()),
    provideHttpClient(
      withInterceptors([
        httpInterceptor,
        loadingInterceptor,
        authInterceptor,
        retryInterceptor,
        errorInterceptor,
        unauthorizedInterceptor,
      ])
    ),
  ],
};
