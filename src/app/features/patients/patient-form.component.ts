import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import type { PatientSummaryDto, PatientUpsertRequestDto } from '../../core/api/generated';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
      <mat-form-field appearance="outline">
        <mat-label>Account Number *</mat-label>
        <input matInput formControlName="accountNumber" />
        @if (form.controls.accountNumber.touched && form.controls.accountNumber.invalid) {
          <mat-error>Account number is required</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>MRN</mat-label>
        <input matInput formControlName="mrn" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>First Name *</mat-label>
        <input matInput formControlName="firstName" />
        @if (form.controls.firstName.touched && form.controls.firstName.invalid) {
          <mat-error>First name is required</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Last Name *</mat-label>
        <input matInput formControlName="lastName" />
        @if (form.controls.lastName.touched && form.controls.lastName.invalid) {
          <mat-error>Last name is required</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Date of Birth *</mat-label>
        <input matInput type="date" formControlName="dateOfBirth" />
        @if (form.controls.dateOfBirth.touched && form.controls.dateOfBirth.invalid) {
          <mat-error>Date of birth is required</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Gender *</mat-label>
        <mat-select formControlName="gender">
          <mat-option value="MALE">Male</mat-option>
          <mat-option value="FEMALE">Female</mat-option>
          <mat-option value="OTHER">Other</mat-option>
          <mat-option value="UNKNOWN">Unknown</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Phone Number</mat-label>
        <input matInput formControlName="phoneNumber" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" />
        @if (form.controls.email.touched && form.controls.email.invalid) {
          <mat-error>Enter a valid email</mat-error>
        }
      </mat-form-field>

      <div class="actions">
        <button mat-flat-button type="submit" [disabled]="form.invalid || loading">
          <mat-icon>{{ loading ? 'hourglass_top' : 'save' }}</mat-icon>
          {{ submitLabel() }}
        </button>
        <button mat-stroked-button type="button" (click)="cancel.emit()">Cancel</button>
      </div>
    </form>
  `,
  styles: [`
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 0.75rem;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      grid-column: 1 / -1;
      margin-top: 0.25rem;
    }
  `],
})
export class PatientFormComponent {
  @Input() set initialValue(value: PatientSummaryDto | null) {
    if (!value) {
      return;
    }

    this.form.patchValue({
      accountNumber: value.accountNumber ?? '',
      mrn: value.mrn ?? '',
      firstName: value.firstName ?? '',
      lastName: value.lastName ?? '',
      dateOfBirth: value.dateOfBirth ?? '',
      gender: value.gender ?? 'UNKNOWN',
      phoneNumber: value.phoneNumber ?? '',
      email: value.email ?? '',
    });
  }

  @Input() loading = false;
  @Input() mode: 'create' | 'edit' = 'create';

  @Output() submitPatient = new EventEmitter<PatientUpsertRequestDto>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = new FormBuilder();

  readonly form = this.fb.nonNullable.group({
    accountNumber: ['', [Validators.required]],
    mrn: [''],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    dateOfBirth: ['', [Validators.required]],
    gender: ['UNKNOWN', [Validators.required]],
    phoneNumber: [''],
    email: ['', [Validators.email]],
  });

  readonly submitLabel = computed(() => (this.mode === 'create' ? 'Register Patient' : 'Save Changes'));

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.submitPatient.emit({
      accountNumber: value.accountNumber,
      mrn: value.mrn || undefined,
      firstName: value.firstName,
      lastName: value.lastName,
      dateOfBirth: value.dateOfBirth,
      gender: value.gender,
      phoneNumber: value.phoneNumber || undefined,
      email: value.email || undefined,
    });
  }
}
