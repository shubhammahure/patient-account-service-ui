import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';

const MAX_RETRY_ATTEMPTS = 2;
const BASE_DELAY_MS = 400;

function shouldRetry(error: unknown, method: string): boolean {
  if (!(error instanceof HttpErrorResponse)) {
    return false;
  }

  // Do not retry unsafe methods by default.
  const safeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
  if (!safeMethod) {
    return false;
  }

  if (error.status === 0) {
    return true;
  }

  return error.status === 408 || error.status === 425 || error.status === 429 || error.status >= 500;
}

export const retryInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    retry({
      count: MAX_RETRY_ATTEMPTS,
      delay: (error, retryCount) => {
        if (!shouldRetry(error, req.method)) {
          throw error;
        }

        // Exponential backoff with small jitter.
        const delayMs = BASE_DELAY_MS * Math.pow(2, retryCount - 1) + Math.floor(Math.random() * 80);
        return timer(delayMs);
      },
      resetOnSuccess: true,
    })
  );


