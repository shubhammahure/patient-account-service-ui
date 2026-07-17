import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface DischargeDialogData {
  admissionId: number;
}

export interface DischargeDialogResult {
  disposition: string;
  reason: string;
  summary?: string;
}

@Component({
  selector: 'app-discharge-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Discharge Patient</h2>
    <mat-dialog-content>
      <p>Admission #{{ data.admissionId }}</p>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Disposition *</mat-label>
          <mat-select formControlName="disposition">
            <mat-option value="HOME">Home</mat-option>
            <mat-option value="TRANSFER">Transfer</mat-option>
            <mat-option value="HOSPICE">Hospice</mat-option>
            <mat-option value="EXPIRED">Expired</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Reason *</mat-label>
          <input matInput formControlName="reason" />
          @if (form.controls.reason.touched && form.controls.reason.invalid) {
            <mat-error>Reason is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Summary</mat-label>
          <textarea matInput rows="3" formControlName="summary"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">Discharge</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid {
      margin-top: 0.5rem;
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.6rem;
    }

    .full-width {
      grid-column: 1 / -1;
    }
  `],
})
export class DischargeDialogComponent {
  readonly form = new FormBuilder().nonNullable.group({
    disposition: ['HOME', [Validators.required]],
    reason: ['', [Validators.required]],
    summary: [''],
  });

  constructor(
    readonly dialogRef: MatDialogRef<DischargeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: DischargeDialogData
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.dialogRef.close({
      disposition: value.disposition,
      reason: value.reason,
      summary: value.summary || undefined,
    } as DischargeDialogResult);
  }
}

