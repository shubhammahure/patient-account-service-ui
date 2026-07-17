import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiErrorHandlerService } from '../../../core/services/api-error-handler.service';
import { NetworkStatusService } from '../../../core/services/network-status.service';

@Component({
  selector: 'app-global-error',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatButtonModule, MatIconModule],
  template: `
    @if (!network.isOnline()) {
      <div class="banner banner--offline" role="status" aria-live="polite">
        <div class="banner__left">
          <mat-icon>wifi_off</mat-icon>
          <span>You are offline. Requests will fail until internet is restored.</span>
        </div>
      </div>
    }

    @if (errors.lastError(); as error) {
      <div class="banner banner--error" role="alert" aria-live="assertive">
        <div class="banner__left">
          <mat-icon>error_outline</mat-icon>
          <div>
            <div class="banner__title">{{ error.userMessage }}</div>
            <div class="banner__meta">
              {{ error.code }} • {{ error.timestamp | date: 'shortTime' }}
            </div>
          </div>
        </div>

        <div class="banner__actions">
          <button mat-stroked-button type="button" (click)="retry()" [disabled]="!error.retryable">
            <mat-icon>refresh</mat-icon>
            Retry
          </button>
          <button mat-stroked-button type="button" (click)="errors.clear()">
            Dismiss
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .banner {
      margin: 0.5rem 1rem;
      padding: 0.65rem 0.85rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--clr-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      box-shadow: var(--shadow-sm);
      background: var(--clr-surface);
      flex-wrap: wrap;
    }

    .banner__left {
      display: flex;
      gap: 0.6rem;
      align-items: center;
      min-width: 220px;
      flex: 1;
    }

    .banner--offline {
      border-color: rgba(230, 81, 0, 0.25);
      background: rgba(230, 81, 0, 0.08);
      color: #e65100;
    }

    .banner--error {
      border-color: rgba(198, 40, 40, 0.24);
      background: rgba(198, 40, 40, 0.08);
      color: #c62828;
    }

    .banner__title {
      font-size: 0.86rem;
      font-weight: 600;
      line-height: 1.4;
    }

    .banner__meta {
      font-size: 0.74rem;
      color: var(--clr-text-2);
      margin-top: 1px;
    }

    .banner__actions {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `],
})
export class GlobalErrorComponent {
  readonly errors = inject(ApiErrorHandlerService);
  readonly network = inject(NetworkStatusService);

  retry(): void {
    if (this.errors.lastError()?.retryable) {
      // Safe, generic retry action for global banner context.
      window.location.reload();
    }
  }
}

