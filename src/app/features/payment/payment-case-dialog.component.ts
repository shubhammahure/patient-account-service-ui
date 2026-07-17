import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-payment-case-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>New Payment Case</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Patient ID *</mat-label>
          <input matInput type="number" formControlName="patientId" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Current Step *</mat-label>
          <input matInput formControlName="currentStep" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Total Charges *</mat-label>
          <input matInput type="number" formControlName="totalCharges" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Allowed Amount *</mat-label>
          <input matInput type="number" formControlName="allowedAmount" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Insurance Responsibility *</mat-label>
          <input matInput type="number" formControlName="insuranceResponsibility" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Patient Responsibility *</mat-label>
          <input matInput type="number" formControlName="patientResponsibility" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Case Reference</mat-label>
          <input matInput formControlName="paymentCaseRef" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Due Date</mat-label>
          <input matInput type="date" formControlName="dueDate" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Notes</mat-label>
          <textarea matInput rows="3" formControlName="notes"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="dialogRef.close(null)">Cancel</button>
      <button mat-flat-button color="primary" type="button" [disabled]="form.invalid" (click)="save()">Create</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid {
      margin-top: 0.6rem;
      display: grid;
      grid-template-columns: repeat(2, minmax(200px, 1fr));
      gap: 0.6rem;
      min-width: min(760px, 85vw);
    }

    .full-width {
      grid-column: 1 / -1;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class PaymentCaseDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PaymentCaseDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA, { optional: true }) as { currentStep?: string } | null;
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    patientId: [null as number | null, [Validators.required, Validators.min(1)]],
    currentStep: [this.data?.currentStep ?? 'INTAKE', [Validators.required]],
    totalCharges: [0, [Validators.required, Validators.min(0)]],
    allowedAmount: [0, [Validators.required, Validators.min(0)]],
    insuranceResponsibility: [0, [Validators.required, Validators.min(0)]],
    patientResponsibility: [0, [Validators.required, Validators.min(0)]],
    paymentCaseRef: [''],
    dueDate: [''],
    notes: [''],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.dialogRef.close({
      patientId: Number(value.patientId),
      currentStep: value.currentStep ?? 'INTAKE',
      totalCharges: Number(value.totalCharges),
      allowedAmount: Number(value.allowedAmount),
      insuranceResponsibility: Number(value.insuranceResponsibility),
      patientResponsibility: Number(value.patientResponsibility),
      paymentCaseRef: value.paymentCaseRef || undefined,
      dueDate: value.dueDate || undefined,
      notes: value.notes || undefined,
    });
  }
}

