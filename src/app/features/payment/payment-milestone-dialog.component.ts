import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-payment-milestone-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ mode === 'edit' ? 'Update Milestone' : 'Add Milestone' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Milestone Code *</mat-label>
          <input matInput formControlName="milestoneCode" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Milestone Name *</mat-label>
          <input matInput formControlName="milestoneName" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Sequence *</mat-label>
          <input matInput type="number" formControlName="sequenceNo" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="milestoneStatus">
            <mat-option value="PENDING">Pending</mat-option>
            <mat-option value="IN_PROGRESS">In Progress</mat-option>
            <mat-option value="COMPLETED">Completed</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Target Date</mat-label>
          <input matInput type="date" formControlName="targetDate" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Completed Date</mat-label>
          <input matInput type="date" formControlName="completedDate" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="dialogRef.close(null)">Cancel</button>
      <button mat-flat-button color="primary" type="button" [disabled]="form.invalid" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid {
      margin-top: 0.6rem;
      display: grid;
      grid-template-columns: repeat(2, minmax(180px, 1fr));
      gap: 0.6rem;
      min-width: min(680px, 82vw);
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class PaymentMilestoneDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PaymentMilestoneDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as { mode?: 'create' | 'edit'; milestone?: any } | null;
  private readonly fb = inject(FormBuilder);

  readonly mode = this.data?.mode ?? 'create';

  readonly form = this.fb.group({
    milestoneCode: [this.data?.milestone?.milestoneCode ?? '', [Validators.required]],
    milestoneName: [this.data?.milestone?.milestoneName ?? '', [Validators.required]],
    sequenceNo: [this.data?.milestone?.sequenceNo ?? 1, [Validators.required, Validators.min(1)]],
    milestoneStatus: [this.data?.milestone?.milestoneStatus ?? 'PENDING'],
    targetDate: [this.data?.milestone?.targetDate ?? ''],
    completedDate: [this.data?.milestone?.completedDate ?? ''],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.dialogRef.close({
      milestoneCode: value.milestoneCode ?? '',
      milestoneName: value.milestoneName ?? '',
      sequenceNo: Number(value.sequenceNo),
      milestoneStatus: value.milestoneStatus || undefined,
      targetDate: value.targetDate || undefined,
      completedDate: value.completedDate || undefined,
    });
  }
}

