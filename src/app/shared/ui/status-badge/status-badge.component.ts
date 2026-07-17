import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type BadgeVariant = 'filled' | 'outlined' | 'soft';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <span class="badge badge--{{ color }} badge--{{ variant }} badge--{{ size }}"
          [class.badge--interactive]="interactive"
          (click)="interactive && clicked.emit()"
          (keydown.enter)="interactive && clicked.emit()"
          [attr.tabindex]="interactive ? 0 : null"
          [attr.role]="interactive ? 'button' : null">
      @if (icon) {
        <mat-icon class="badge__icon">{{ icon }}</mat-icon>
      } @else if (dot) {
        <span class="badge__dot"></span>
      }
      <span class="badge__label">{{ label }}</span>
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      border-radius: 999px;
      font-weight: 600;
      letter-spacing: 0.02em;
      white-space: nowrap;
      line-height: 1;
    }

    /* Sizes */
    .badge--xs  { padding: 2px 7px;   font-size: 0.68rem; }
    .badge--sm  { padding: 3px 9px;   font-size: 0.72rem; }
    .badge--md  { padding: 4px 11px;  font-size: 0.78rem; }
    .badge--lg  { padding: 6px 14px;  font-size: 0.86rem; }

    /* Dot */
    .badge__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* Icon */
    .badge__icon { font-size: 13px; width: 13px; height: 13px; }

    /* Interactive */
    .badge--interactive { cursor: pointer; transition: opacity 120ms; }
    .badge--interactive:hover { opacity: 0.82; }

    /* Color × Variant combinations */
    /* success */
    .badge--success.badge--filled    { background: #2E7D32; color: #fff; }
    .badge--success.badge--filled    .badge__dot { background: rgba(255,255,255,.7); }
    .badge--success.badge--outlined  { background: transparent; color: #2E7D32; border: 1.5px solid #2E7D32; }
    .badge--success.badge--soft      { background: rgba(46,125,50,.12); color: #2E7D32; }
    .badge--success.badge--soft      .badge__dot { background: #2E7D32; }

    /* error */
    .badge--error.badge--filled      { background: #C62828; color: #fff; }
    .badge--error.badge--filled      .badge__dot { background: rgba(255,255,255,.7); }
    .badge--error.badge--outlined    { background: transparent; color: #C62828; border: 1.5px solid #C62828; }
    .badge--error.badge--soft        { background: rgba(198,40,40,.12); color: #C62828; }
    .badge--error.badge--soft        .badge__dot { background: #C62828; }

    /* warning */
    .badge--warning.badge--filled    { background: #E65100; color: #fff; }
    .badge--warning.badge--filled    .badge__dot { background: rgba(255,255,255,.7); }
    .badge--warning.badge--outlined  { background: transparent; color: #E65100; border: 1.5px solid #E65100; }
    .badge--warning.badge--soft      { background: rgba(230,81,0,.12); color: #E65100; }
    .badge--warning.badge--soft      .badge__dot { background: #E65100; }

    /* primary */
    .badge--primary.badge--filled    { background: #1565C0; color: #fff; }
    .badge--primary.badge--filled    .badge__dot { background: rgba(255,255,255,.7); }
    .badge--primary.badge--outlined  { background: transparent; color: #1565C0; border: 1.5px solid #1565C0; }
    .badge--primary.badge--soft      { background: rgba(21,101,192,.12); color: #1565C0; }
    .badge--primary.badge--soft      .badge__dot { background: #1565C0; }

    /* neutral */
    .badge--neutral.badge--filled    { background: #64748B; color: #fff; }
    .badge--neutral.badge--filled    .badge__dot { background: rgba(255,255,255,.7); }
    .badge--neutral.badge--outlined  { background: transparent; color: #64748B; border: 1.5px solid #94A3B8; }
    .badge--neutral.badge--soft      { background: var(--clr-surface-2); color: var(--clr-text-2); }
    .badge--neutral.badge--soft      .badge__dot { background: var(--clr-text-3); }
  `],
})
export class StatusBadgeComponent {
  @Input() label = '';
  @Input() color: 'success' | 'error' | 'warning' | 'primary' | 'neutral' = 'neutral';
  @Input() variant: BadgeVariant = 'soft';
  @Input() size: BadgeSize = 'sm';
  @Input() icon = '';
  @Input() dot = false;
  @Input() interactive = false;

  @Output() readonly clicked = new EventEmitter<void>();
}

