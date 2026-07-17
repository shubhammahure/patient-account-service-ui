import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type ChipColor =
  | 'primary' | 'success' | 'error' | 'warning' | 'info'
  | 'purple' | 'teal' | 'pink' | 'neutral';

@Component({
  selector: 'app-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <span class="chip chip--{{ color }}"
          [class.chip--removable]="removable"
          [class.chip--selected]="selected"
          [class.chip--outline]="outlined"
          [class.chip--sm]="size === 'sm'">
      @if (icon) {
        <mat-icon class="chip__icon">{{ icon }}</mat-icon>
      }
      <span class="chip__label">{{ label }}</span>
      @if (removable) {
        <button type="button" class="chip__remove" (click)="$event.stopPropagation(); removed.emit()" aria-label="Remove">
          <mat-icon>close</mat-icon>
        </button>
      }
    </span>
  `,
  styles: [`
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 500;
      cursor: default;
      border: 1.5px solid transparent;
      transition: background 120ms, color 120ms;
      user-select: none;
    }

    .chip--sm { padding: 2px 8px; font-size: 0.72rem; }

    .chip__icon { font-size: 14px; width: 14px; height: 14px; }

    .chip__remove {
      display: flex;
      align-items: center;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      opacity: 0.6;
      transition: opacity 100ms;
      color: inherit;

      mat-icon { font-size: 13px; width: 13px; height: 13px; }

      &:hover { opacity: 1; }
    }

    /* Colors */
    .chip--primary  { background: rgba(21,101,192,.12); color: #1565C0; border-color: rgba(21,101,192,.22); }
    .chip--success  { background: rgba(46,125,50,.12);  color: #2E7D32; border-color: rgba(46,125,50,.22);  }
    .chip--error    { background: rgba(198,40,40,.12);  color: #C62828; border-color: rgba(198,40,40,.22);  }
    .chip--warning  { background: rgba(230,81,0,.12);   color: #E65100; border-color: rgba(230,81,0,.22);   }
    .chip--info     { background: rgba(1,87,155,.12);   color: #01579B; border-color: rgba(1,87,155,.22);   }
    .chip--purple   { background: rgba(106,27,154,.12); color: #6A1B9A; border-color: rgba(106,27,154,.22); }
    .chip--teal     { background: rgba(0,121,107,.12);  color: #00796B; border-color: rgba(0,121,107,.22);  }
    .chip--pink     { background: rgba(173,20,87,.12);  color: #AD1457; border-color: rgba(173,20,87,.22);  }
    .chip--neutral  { background: var(--clr-surface-2); color: var(--clr-text-2); border-color: var(--clr-border); }

    /* Outlined */
    .chip--outline { background: transparent; }

    /* Selected */
    .chip--selected { outline: 2px solid currentColor; outline-offset: 1px; }
  `],
})
export class ChipComponent {
  @Input() label = '';
  @Input() icon = '';
  @Input() color: ChipColor = 'neutral';
  @Input() size: 'sm' | 'md' = 'md';
  @Input() removable = false;
  @Input() selected = false;
  @Input() outlined = false;

  @Output() readonly removed = new EventEmitter<void>();
}

