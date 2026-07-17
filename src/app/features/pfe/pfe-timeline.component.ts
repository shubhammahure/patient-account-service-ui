import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PfeCaseHistoryResponseDto } from '../../core/api/generated';

@Component({
  selector: 'app-pfe-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, DatePipe],
  template: `
    <section class="timeline">
      @if (items.length === 0) {
        <div class="timeline-empty">
          <mat-icon>history_toggle_off</mat-icon>
          <span>No workflow transitions yet.</span>
        </div>
      }

      @for (entry of items; track entry.historyId ?? $index; let last = $last) {
        <article class="timeline-item">
          <div class="line" [class.hidden]="last"></div>
          <div class="dot" [class.active]="entry.toStatus === currentStatus"></div>

          <div class="content">
            <header>
              <h4>{{ entry.fromStatus || 'NEW' }} -> {{ entry.toStatus || '-' }}</h4>
              <span class="time">{{ entry.actionAt ? (entry.actionAt | date: 'medium') : '-' }}</span>
            </header>
            <p class="comment">{{ entry.comment || 'No comment' }}</p>
            <p class="meta">By {{ entry.actionBy || 'System' }}</p>
          </div>
        </article>
      }
    </section>
  `,
  styles: [`
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .timeline-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: var(--clr-text-2);
      border: 1px dashed var(--clr-border);
      border-radius: 10px;
      padding: 1rem;
    }

    .timeline-item {
      position: relative;
      display: grid;
      grid-template-columns: 20px 1fr;
      column-gap: 0.85rem;
      min-height: 86px;
    }

    .line {
      position: absolute;
      left: 9px;
      top: 18px;
      bottom: -10px;
      width: 2px;
      background: #cfd8dc;
    }

    .line.hidden {
      display: none;
    }

    .dot {
      width: 18px;
      height: 18px;
      border-radius: 999px;
      margin-top: 2px;
      border: 2px solid #90a4ae;
      background: #fff;
      z-index: 1;
    }

    .dot.active {
      border-color: #1565c0;
      background: #e3f2fd;
    }

    .content {
      border: 1px solid var(--clr-border);
      border-radius: 10px;
      padding: 0.7rem 0.8rem;
      background: #fff;
    }

    header {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      align-items: baseline;
      flex-wrap: wrap;

      h4 {
        margin: 0;
        font-size: 0.88rem;
      }

      .time {
        color: var(--clr-text-2);
        font-size: 0.78rem;
      }
    }

    .comment {
      margin: 0.45rem 0 0;
      font-size: 0.82rem;
      color: var(--clr-text);
    }

    .meta {
      margin: 0.4rem 0 0;
      font-size: 0.75rem;
      color: var(--clr-text-2);
    }
  `],
})
export class PfeTimelineComponent {
  @Input() items: PfeCaseHistoryResponseDto[] = [];
  @Input() currentStatus = '';
}

