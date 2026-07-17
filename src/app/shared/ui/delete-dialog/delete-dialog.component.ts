import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface DeleteDialogData {
  entityName: string;
  entityLabel?: string;
  warningMessage?: string;
}

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="dialog-header">
      <span class="delete-icon"><mat-icon>delete_forever</mat-icon></span>
      <h2 mat-dialog-title>Delete {{ data.entityName }}</h2>
    </div>

    <mat-dialog-content>
      <p>
        Are you sure you want to permanently delete
        <strong>{{ data.entityLabel ?? data.entityName }}</strong>?
        This action cannot be undone.
      </p>
      @if (data.warningMessage) {
        <p class="warning-note">
          <mat-icon>warning_amber</mat-icon>
          {{ data.warningMessage }}
        </p>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="ref.close(false)">Cancel</button>
      <button mat-flat-button color="warn" type="button" (click)="ref.close(true)">Delete</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 1.5rem 0;
    }

    .delete-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--clr-error);
    }

    h2[mat-dialog-title] { margin: 0; font-size: 1.1rem; font-weight: 600; }

    p { margin: 0; color: var(--clr-text-2); line-height: 1.6; }

    .warning-note {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-top: 0.75rem;
      padding: 0.6rem 0.8rem;
      background: rgba(230, 81, 0, 0.08);
      border: 1px solid rgba(230, 81, 0, 0.22);
      border-radius: var(--radius-sm);
      color: var(--clr-warning);
      font-size: 0.84rem;

      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
  `],
})
export class DeleteDialogComponent {
  readonly data = inject<DeleteDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<DeleteDialogComponent>);
}

