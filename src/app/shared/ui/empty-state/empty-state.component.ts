import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="empty-state" [class.empty-state--compact]="compact">
      <div class="empty-state__icon-wrap">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <h3 class="empty-state__title">{{ title }}</h3>
      @if (description) {
        <p class="empty-state__desc">{{ description }}</p>
      }
      @if (actionLabel) {
        <button mat-flat-button color="primary" type="button" (click)="action.emit()">
          @if (actionIcon) { <mat-icon>{{ actionIcon }}</mat-icon> }
          {{ actionLabel }}
        </button>
      }
      <ng-content />
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      text-align: center;
      gap: 0.75rem;
    }

    .empty-state--compact {
      padding: 1.5rem;
    }

    .empty-state__icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--clr-surface-2);
      margin-bottom: 0.25rem;
    }

    .empty-state__icon-wrap mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--clr-text-3);
    }

    .empty-state__title {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--clr-text);
    }

    .empty-state__desc {
      margin: 0;
      font-size: 0.875rem;
      color: var(--clr-text-2);
      max-width: 340px;
      line-height: 1.6;
    }
  `],
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() description = '';
  @Input() actionLabel = '';
  @Input() actionIcon = '';
  @Input() compact = false;

  @Output() readonly action = new EventEmitter<void>();
}

