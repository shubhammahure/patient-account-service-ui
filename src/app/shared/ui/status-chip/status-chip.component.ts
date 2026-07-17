import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type StatusTone = 'active' | 'inactive' | 'pending' | 'completed' | 'error' | 'neutral';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="chip chip--{{ tone() }}">
      <span class="chip__dot"></span>
      {{ label() }}
    </span>
  `,
  styles: [`
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .chip__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .chip--active    { background: rgba(46,125,50,.12); color: #2E7D32; }
    .chip--active    .chip__dot { background: #2E7D32; }
    .chip--inactive  { background: rgba(94,99,102,.1); color: #546E7A; }
    .chip--inactive  .chip__dot { background: #546E7A; }
    .chip--pending   { background: rgba(230,81,0,.1); color: #E65100; }
    .chip--pending   .chip__dot { background: #E65100; }
    .chip--completed { background: rgba(21,101,192,.1); color: #1565C0; }
    .chip--completed .chip__dot { background: #1565C0; }
    .chip--error     { background: rgba(198,40,40,.1); color: #C62828; }
    .chip--error     .chip__dot { background: #C62828; }
    .chip--neutral   { background: var(--clr-surface-2); color: var(--clr-text-2); }
    .chip--neutral   .chip__dot { background: var(--clr-text-3); }
  `],
})
export class StatusChipComponent {
  readonly label = input.required<string>();
  readonly tone = input<StatusTone>('neutral');
}

