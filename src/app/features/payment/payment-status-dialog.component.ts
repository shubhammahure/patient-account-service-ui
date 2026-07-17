import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface PaymentStatusDialogData {
  title: string;
  label: string;
  value: string;
  options: string[];
}

@Component({
  selector: 'app-payment-status-dialog',
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
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>{{ data.label }}</mat-label>
          <mat-select formControlName="status">
            @for (option of data.options; track option) {
              <mat-option [value]="option">{{ option }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Notes</mat-label>
          <textarea matInput rows="3" formControlName="notes"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="dialogRef.close(null)">Cancel</button>
      <button mat-flat-button color="primary" type="button" [disabled]="form.invalid" (click)="save()">Update</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid {
      margin-top: 0.6rem;
      min-width: min(540px, 80vw);
      display: grid;
      gap: 0.6rem;
    }

    .full-width {
      width: 100%;
    }
  `],
})
export class PaymentStatusDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PaymentStatusDialogComponent>);
  readonly data = inject<PaymentStatusDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    status: [this.data.value || this.data.options[0] || '', [Validators.required]],
    notes: [''],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.dialogRef.close({
      status: value.status || '',
      notes: value.notes || undefined,
    });
  }
}

