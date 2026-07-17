import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-no-data',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="no-data" [class.no-data--sm]="size === 'sm'">
      <mat-icon>{{ icon }}</mat-icon>
      <span>{{ message }}</span>
    </div>
  `,
  styles: [`
    .no-data {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 2rem 1rem;
      color: var(--clr-text-2);
      font-size: 0.875rem;
    }

    .no-data mat-icon { font-size: 22px; width: 22px; height: 22px; }

    .no-data--sm { padding: 1rem; font-size: 0.8rem; }
    .no-data--sm mat-icon { font-size: 16px; width: 16px; height: 16px; }
  `],
})
export class NoDataComponent {
  @Input() message = 'No records found.';
  @Input() icon = 'search_off';
  @Input() size: 'sm' | 'md' = 'md';
}

