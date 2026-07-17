# HTTP Pipeline and Global API Error Handling

This project now uses a centralized interceptor pipeline with offline detection, retry logic, unauthorized handling, and global error UI.

## Interceptors

Registered in `src/app/app.config.ts` in this order:

1. `httpInterceptor`
2. `loadingInterceptor`
3. `authInterceptor`
4. `retryInterceptor`
5. `errorInterceptor`
6. `unauthorizedInterceptor`

## Responsibilities

- `http.interceptor.ts`
  - Adds `X-Request-Id`, `X-Client-Timezone`, `Accept` headers
  - Short-circuits requests when offline with `HttpErrorResponse(status=0)`

- `loading.interceptor.ts`
  - Increments/decrements global loading counter via `LoadingService`
  - Supports opt-out using `X-Skip-Loading: true`

- `auth.interceptor.ts`
  - Attaches access token
  - Handles refresh token workflow

- `retry.interceptor.ts`
  - Retries safe methods (`GET/HEAD/OPTIONS`) with exponential backoff + jitter
  - Retries for network errors (`0`), `408`, `425`, `429`, `5xx`

- `error.interceptor.ts`
  - Sends non-401/403 errors to `ApiErrorHandlerService`

- `unauthorized.interceptor.ts`
  - Handles `401` (`/auth/login`) and `403` (`/error/403`) navigation
  - Clears token and shows snackbar messages

## Services

- `ApiErrorHandlerService`
  - Centralized API error parser + user-friendly message mapper
  - Emits `lastError` signal used by global error UI

- `NetworkStatusService`
  - Tracks online/offline status with signals and browser events

- `LoadingService`
  - Tracks active HTTP request count and exposes `isLoading`

## Global Error UI

`GlobalErrorComponent` is rendered in `src/app/app.ts`.

It shows:
- Offline banner (live network status)
- Latest API error banner with retry/dismiss actions

## Try It

```powershell
Set-Location "C:\Users\ShubhamMahure\Bench_Project\patient-account-service\patient-account-service-ui"
npm run build
```

To test offline behavior:
1. Open browser devtools
2. Set network mode to `Offline`
3. Trigger any API action
4. Verify offline banner and centralized error snackbar/banner

