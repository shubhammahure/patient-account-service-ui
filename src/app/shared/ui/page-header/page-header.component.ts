import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="page-header" [class.page-header--bordered]="bordered()">
      <div class="page-header__text">
        @if (icon()) {
          <span class="page-header__icon-wrap">
            <mat-icon>{{ icon() }}</mat-icon>
          </span>
        }
        <div>
          <h2 class="page-header__title">{{ title() }}</h2>
          @if (subtitle()) {
            <p class="page-header__subtitle">{{ subtitle() }}</p>
          }
        </div>
      </div>
      <div class="page-header__actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .page-header--bordered {
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--clr-border);
    }

    .page-header__text {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .page-header__icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: rgba(21, 101, 192, 0.1);
      flex-shrink: 0;
      margin-top: 1px;

      mat-icon { color: var(--clr-primary); font-size: 20px; }
    }

    .page-header__title {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--clr-text);
      letter-spacing: -0.02em;
    }

    .page-header__subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: var(--clr-text-2);
    }

    .page-header__actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
      flex-wrap: wrap;
    }
  `],
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly icon = input<string>('');
  readonly bordered = input<boolean>(false);
}
