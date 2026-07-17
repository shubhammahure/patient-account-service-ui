import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface PfeApprovalDialogData {
  title: string;
  description: string;
  confirmLabel: string;
  caseId: number;
  initialComment?: string;
}

@Component({
  selector: 'app-pfe-approval-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.description }}</p>
      <p><strong>Case ID:</strong> {{ data.caseId }}</p>

      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Comment</mat-label>
          <textarea matInput rows="4" formControlName="comment" placeholder="Add action note for audit history"></textarea>
          <mat-error *ngIf="form.controls.comment.hasError('required')">Comment is required.</mat-error>
          <mat-error *ngIf="form.controls.comment.hasError('maxlength')">Maximum 2000 characters allowed.</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="dialogRef.close(null)">Cancel</button>
      <button mat-flat-button color="primary" type="button" [disabled]="form.invalid" (click)="confirm()">
        {{ data.confirmLabel }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form {
      margin-top: 0.6rem;
    }

    .full-width {
      width: 100%;
    }
  `],
})
export class PfeApprovalDialogComponent {
  readonly data = inject<PfeApprovalDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<PfeApprovalDialogComponent>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    comment: [this.data.initialComment ?? '', [Validators.required, Validators.maxLength(2000)]],
  });

  confirm(): void {
    if (this.form.invalid) {
      return;
    }

    this.dialogRef.close(this.form.controls.comment.value?.trim() ?? '');
  }
}



