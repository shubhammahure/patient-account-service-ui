import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface ToolbarAction {
  icon: string;
  label: string;
  tooltip?: string;
  color?: 'primary' | 'warn' | 'accent' | '';
  disabled?: boolean;
  variant?: 'flat' | 'stroked' | 'icon';
}

@Component({
  selector: 'app-toolbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDividerModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="toolbar" [class.toolbar--border]="bordered">
      @if (title) {
        <div class="toolbar__title">
          @if (backIcon) {
            <button mat-icon-button type="button" (click)="back.emit()" [matTooltip]="backTooltip">
              <mat-icon>{{ backIcon }}</mat-icon>
            </button>
          }
          <span>{{ title }}</span>
        </div>
      }

      <div class="toolbar__spacer"></div>

      <div class="toolbar__actions">
        <ng-content select="[slot='start']"></ng-content>

        @for (action of actions; track action.label) {
          @if (action.variant === 'icon') {
            <button mat-icon-button type="button"
                    [color]="action.color || ''"
                    [disabled]="action.disabled ?? false"
                    [matTooltip]="action.tooltip ?? action.label"
                    (click)="actionClick.emit(action.label)">
              <mat-icon>{{ action.icon }}</mat-icon>
            </button>
          } @else if (action.variant === 'stroked') {
            <button mat-stroked-button type="button"
                    [color]="action.color || ''"
                    [disabled]="action.disabled ?? false"
                    (click)="actionClick.emit(action.label)">
              <mat-icon>{{ action.icon }}</mat-icon>
              {{ action.label }}
            </button>
          } @else {
            <button mat-flat-button type="button"
                    [color]="action.color || 'primary'"
                    [disabled]="action.disabled ?? false"
                    (click)="actionClick.emit(action.label)">
              <mat-icon>{{ action.icon }}</mat-icon>
              {{ action.label }}
            </button>
          }
        }

        <ng-content select="[slot='end']"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .toolbar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      background: var(--clr-surface);
      border-radius: var(--radius-md);
      flex-wrap: wrap;
    }

    .toolbar--border {
      border: 1px solid var(--clr-border);
      box-shadow: var(--shadow-sm);
    }

    .toolbar__title {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--clr-text);
    }

    .toolbar__spacer { flex: 1; }

    .toolbar__actions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
  `],
})
export class ToolbarComponent {
  @Input() title = '';
  @Input() backIcon = '';
  @Input() backTooltip = 'Go back';
  @Input() bordered = true;
  @Input() actions: ToolbarAction[] = [];

  @Output() readonly back = new EventEmitter<void>();
  @Output() readonly actionClick = new EventEmitter<string>();
}

