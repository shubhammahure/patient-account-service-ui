import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { NotificationService } from './notification.service';
import { NetworkStatusService } from './network-status.service';

export interface ApiErrorView {
  status: number;
  code: string;
  message: string;
  userMessage: string;
  retryable: boolean;
  offline: boolean;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ApiErrorHandlerService {
  private readonly snackbar = inject(SnackbarService);
  private readonly notifications = inject(NotificationService);
  private readonly network = inject(NetworkStatusService);

  readonly lastError = signal<ApiErrorView | null>(null);
  readonly hasError = computed(() => !!this.lastError());

  clear(): void {
    this.lastError.set(null);
  }

  build(error: unknown): ApiErrorView {
    if (error instanceof HttpErrorResponse) {
      const status = error.status ?? 0;
      const offline = status === 0 || !this.network.isOnline();
      const payload = this.extractPayload(error.error);
      const code = payload.code ?? this.defaultCode(status, offline);
      const message = payload.message ?? error.message ?? 'Unknown API error';
      const userMessage = this.toUserMessage(status, offline, message);

      return {
        status,
        code,
        message,
        userMessage,
        retryable: this.isRetryable(status, offline),
        offline,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: -1,
      code: 'UNEXPECTED_ERROR',
      message: 'Unexpected error',
      userMessage: 'An unexpected error occurred. Please try again.',
      retryable: false,
      offline: false,
      timestamp: new Date().toISOString(),
    };
  }

  handle(error: unknown, options?: { silent?: boolean; notify?: boolean }): ApiErrorView {
    const parsed = this.build(error);
    this.lastError.set(parsed);

    if (!options?.silent) {
      this.snackbar.error(parsed.userMessage);
    }

    if (options?.notify !== false) {
      this.notifications.add({
        type: 'error',
        icon: 'error_outline',
        title: `API Error ${parsed.status >= 0 ? `(${parsed.status})` : ''}`.trim(),
        message: parsed.userMessage,
        time: new Date(),
      });
    }

    return parsed;
  }

  private toUserMessage(status: number, offline: boolean, fallback: string): string {
    if (offline) {
      return 'You appear to be offline. Please check your internet connection.';
    }

    switch (status) {
      case 400:
        return 'Invalid request. Please verify the input and try again.';
      case 401:
        return 'Your session has expired. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Requested resource was not found.';
      case 409:
        return 'Conflict detected. Please refresh and retry.';
      case 422:
        return 'Request cannot be processed due to business validation.';
      case 429:
        return 'Too many requests. Please wait and retry.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Server is temporarily unavailable. Please try again shortly.';
      default:
        return fallback || 'Request failed. Please try again.';
    }
  }

  private isRetryable(status: number, offline: boolean): boolean {
    if (offline) {
      return true;
    }

    return status === 408 || status === 425 || status === 429 || status >= 500;
  }

  private defaultCode(status: number, offline: boolean): string {
    if (offline) {
      return 'NETWORK_OFFLINE';
    }

    return status > 0 ? `HTTP_${status}` : 'HTTP_UNKNOWN';
  }

  private extractPayload(errorPayload: unknown): { code?: string; message?: string } {
    if (!errorPayload || typeof errorPayload !== 'object') {
      return {};
    }

    const payload = errorPayload as { code?: unknown; message?: unknown; error?: unknown };
    if (payload.error && typeof payload.error === 'string' && !payload.message) {
      return { message: payload.error };
    }

    return {
      code: typeof payload.code === 'string' ? payload.code : undefined,
      message: typeof payload.message === 'string' ? payload.message : undefined,
    };
  }
}

