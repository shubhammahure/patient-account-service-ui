import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-payment-transaction-dialog',
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
    <h2 mat-dialog-title>Record Transaction</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Type *</mat-label>
          <mat-select formControlName="transactionType">
            <mat-option value="PAYMENT">Payment</mat-option>
            <mat-option value="ADJUSTMENT">Adjustment</mat-option>
            <mat-option value="REFUND">Refund</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Amount *</mat-label>
          <input matInput type="number" formControlName="amount" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Currency</mat-label>
          <input matInput formControlName="currencyCode" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Reference Number</mat-label>
          <input matInput formControlName="referenceNumber" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Source System</mat-label>
          <input matInput formControlName="sourceSystem" />
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
      min-width: min(640px, 82vw);
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
export class PaymentTransactionDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PaymentTransactionDialogComponent>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    transactionType: ['PAYMENT', [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    currencyCode: ['USD'],
    referenceNumber: [''],
    sourceSystem: ['UI'],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.dialogRef.close({
      transactionType: value.transactionType ?? 'PAYMENT',
      amount: Number(value.amount),
      currencyCode: value.currencyCode || undefined,
      referenceNumber: value.referenceNumber || undefined,
      sourceSystem: value.sourceSystem || undefined,
    });
  }
}

