import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'primary' | 'warn' | 'accent' */
  confirmColor?: string;
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="dialog-header">
      @if (data.icon) {
        <mat-icon class="dialog-icon" [class.dialog-icon--warn]="data.confirmColor === 'warn'">
          {{ data.icon }}
        </mat-icon>
      }
      <h2 mat-dialog-title class="dialog-title">{{ data.title }}</h2>
    </div>

    <mat-dialog-content>
      <p class="dialog-message">{{ data.message }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="ref.close(false)">
        {{ data.cancelLabel ?? 'Cancel' }}
      </button>
      <button mat-flat-button type="button"
              [color]="data.confirmColor ?? 'primary'"
              (click)="ref.close(true)">
        {{ data.confirmLabel ?? 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 1.5rem 0;
    }

    .dialog-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--clr-primary);
    }

    .dialog-icon--warn { color: var(--clr-error); }

    .dialog-title { margin: 0; font-size: 1.1rem; font-weight: 600; }

    .dialog-message { margin: 0; color: var(--clr-text-2); line-height: 1.6; }

    mat-dialog-actions button { min-width: 90px; }
  `],
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<ConfirmDialogComponent>);
}

