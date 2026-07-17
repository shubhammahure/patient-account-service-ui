import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type StatCardTone = 'primary' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stat-card stat-card--{{ tone() }}">
      <div class="stat-card__icon-wrap">
        <mat-icon>{{ icon() }}</mat-icon>
      </div>
      <div class="stat-card__body">
        <p class="stat-card__label">{{ label() }}</p>
        <p class="stat-card__value">{{ value() }}</p>
        @if (subtitle()) {
          <p class="stat-card__subtitle">{{ subtitle() }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-height: 120px;
      background: var(--clr-surface);
      border-radius: var(--radius-lg);
      padding: 1.25rem 1.5rem;
      border: 1px solid var(--clr-border);
      box-shadow: var(--shadow-sm);
    }
    .stat-card__icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      flex-shrink: 0;
    }
    .stat-card__icon-wrap mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }
    .stat-card__body { flex: 1; min-width: 0; }
    .stat-card__label {
      margin: 0;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--clr-text-2);
    }
    .stat-card__value {
      margin: 0.125rem 0 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--clr-text);
      line-height: 1.1;
    }
    .stat-card__subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.78rem;
      color: var(--clr-text-2);
    }

    /* Tone variants */
    .stat-card--primary .stat-card__icon-wrap {
      background: rgba(21, 101, 192, 0.12);
      color: #1565C0;
    }
    .stat-card--success .stat-card__icon-wrap {
      background: rgba(46, 125, 50, 0.12);
      color: #2E7D32;
    }
    .stat-card--warning .stat-card__icon-wrap {
      background: rgba(230, 81, 0, 0.12);
      color: #E65100;
    }
    .stat-card--error .stat-card__icon-wrap {
      background: rgba(198, 40, 40, 0.12);
      color: #C62828;
    }
    .stat-card--info .stat-card__icon-wrap {
      background: rgba(1, 87, 155, 0.12);
      color: #01579B;
    }
  `],
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input<string>('info');
  readonly tone = input<StatCardTone>('primary');
  readonly subtitle = input<string>('');
}

