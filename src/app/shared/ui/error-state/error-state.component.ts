import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="error-state" [class.error-state--inline]="inline">
      <mat-icon class="error-state__icon">{{ icon }}</mat-icon>
      <div class="error-state__body">
        <h3 class="error-state__title">{{ title }}</h3>
        @if (message) {
          <p class="error-state__msg">{{ message }}</p>
        }
      </div>
      @if (retryLabel) {
        <button mat-stroked-button type="button" (click)="retry.emit()">
          <mat-icon>refresh</mat-icon>
          {{ retryLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      text-align: center;
      gap: 0.75rem;
    }

    .error-state--inline {
      flex-direction: row;
      padding: 0.75rem 1rem;
      text-align: left;
      background: rgba(198, 40, 40, 0.06);
      border: 1px solid rgba(198, 40, 40, 0.2);
      border-radius: var(--radius-md);
      gap: 0.6rem;
    }

    .error-state__icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: var(--clr-error);
    }

    .error-state--inline .error-state__icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .error-state__body { flex: 1; }

    .error-state__title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--clr-error);
    }

    .error-state__msg {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: var(--clr-text-2);
      line-height: 1.5;
    }

    .error-state--inline .error-state__title { font-size: 0.875rem; }
  `],
})
export class ErrorStateComponent {
  @Input() title = 'Something went wrong';
  @Input() message = '';
  @Input() icon = 'error_outline';
  @Input() retryLabel = 'Retry';
  @Input() inline = false;

  @Output() readonly retry = new EventEmitter<void>();
}

