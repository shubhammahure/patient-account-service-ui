import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-transfer-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatDividerModule,
  ],
  template: `
    <div class="transfer-form-wrapper">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>Transfer Details</mat-card-title>
          <mat-card-subtitle>
            Configure destination for {{ selectedPatientCount }} patient(s)
          </mat-card-subtitle>
        </mat-card-header>

        <mat-divider></mat-divider>

        <mat-card-content [formGroup]="formGroup">
          <!-- Current Ward Section -->
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon>location_on</mat-icon>
              Current Location
            </h3>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Current Ward/Unit</mat-label>
              <input
                matInput
                formControlName="currentWard"
                placeholder="e.g., ICU, Ward-A, Emergency"
                [readonly]="true">
              <mat-icon matSuffix>apartment</mat-icon>
            </mat-form-field>

            <p class="field-hint">The ward from which patients are being transferred</p>
          </div>

          <mat-divider class="section-divider"></mat-divider>

          <!-- Destination Section -->
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon>arrow_forward</mat-icon>
              Destination
            </h3>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Destination Ward/Unit *</mat-label>
              <input
                matInput
                formControlName="destinationWard"
                placeholder="e.g., ICU-2, Ward-B, Recovery">
              <mat-icon matSuffix
                [class.error]="isFieldInvalid('destinationWard')">
                {{ isFieldInvalid('destinationWard') ? 'error' : 'apartment' }}
              </mat-icon>
              <mat-error *ngIf="getFieldError('destinationWard') === 'required'">
                Destination ward is required
              </mat-error>
              <mat-error *ngIf="getFieldError('destinationWard') === 'minlength'">
                Destination ward must be at least 2 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Department</mat-label>
              <mat-select formControlName="destinationDepartmentId">
                <mat-option value="">Select Department</mat-option>
                <mat-option value="1">Cardiology</mat-option>
                <mat-option value="2">General Medicine</mat-option>
                <mat-option value="3">Surgery</mat-option>
                <mat-option value="4">Orthopedics</mat-option>
                <mat-option value="5">Neurology</mat-option>
                <mat-option value="6">Pediatrics</mat-option>
                <mat-option value="7">Oncology</mat-option>
                <mat-option value="8">Psychiatry</mat-option>
              </mat-select>
              <mat-icon matSuffix
                [class.error]="isFieldInvalid('destinationDepartmentId')">
                {{ isFieldInvalid('destinationDepartmentId') ? 'error' : 'domain' }}
              </mat-icon>
              <mat-error *ngIf="getFieldError('destinationDepartmentId') === 'required'">
                Please select a destination department
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Specific Bed (Optional)</mat-label>
              <input
                matInput
                formControlName="destinationBedId"
                placeholder="e.g., B-101, B-205">
              <mat-icon matSuffix>hotel</mat-icon>
            </mat-form-field>

            <p class="field-hint">Specify the bed number if available, otherwise staff will assign upon arrival</p>
          </div>

          <mat-divider class="section-divider"></mat-divider>

          <!-- Reason Section -->
          <div class="form-section">
            <h3 class="section-title">
              <mat-icon>description</mat-icon>
              Transfer Reason
            </h3>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Reason for Transfer *</mat-label>
              <textarea
                matInput
                formControlName="transferReason"
                placeholder="Explain why these patients are being transferred..."
                rows="4"
                maxlength="255">
              </textarea>
              <mat-hint align="end">
                {{ (formGroup.get('transferReason')?.value || '').length }}/255
              </mat-hint>
              <mat-icon matSuffix
                [class.error]="isFieldInvalid('transferReason')">
                {{ isFieldInvalid('transferReason') ? 'error' : 'description' }}
              </mat-icon>
              <mat-error *ngIf="getFieldError('transferReason') === 'required'">
                Transfer reason is required
              </mat-error>
              <mat-error *ngIf="getFieldError('transferReason') === 'minlength'">
                Please provide a more detailed reason (at least 5 characters)
              </mat-error>
            </mat-form-field>

            <p class="field-hint">This helps with documentation and audit trail</p>
          </div>

          <!-- Summary Section -->
          <div class="summary-section">
            <div class="summary-item">
              <span class="label">Patients to Transfer:</span>
              <span class="value">{{ selectedPatientCount }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Status:</span>
              <span class="value" [class.valid]="formGroup.valid">
                {{ formGroup.valid ? '✓ Ready to Review' : '⚠ Incomplete' }}
              </span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .transfer-form-wrapper {
      padding: 12px 0;
    }

    .form-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    mat-card-header {
      margin-bottom: 16px;

      mat-card-title {
        font-size: 20px;
        font-weight: 500;
        margin-bottom: 8px;
      }

      mat-card-subtitle {
        font-size: 14px;
        color: #666;
      }
    }

    mat-card-content {
      padding: 24px 0;
    }

    .form-section {
      padding: 20px 0;

      &:first-child {
        padding-top: 0;
      }

      &:last-child {
        padding-bottom: 0;
      }
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 20px 0;
      padding: 0;
      font-size: 16px;
      font-weight: 500;
      color: #212121;

      mat-icon {
        color: #3f51b5;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .section-divider {
      margin: 24px 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .field-hint {
      margin: 8px 0 0 0;
      padding: 0 16px 0 0;
      font-size: 12px;
      color: #999;
      line-height: 1.4;
    }

    mat-form-field {
      &.ng-invalid.ng-touched {
        ::ng-deep {
          .mat-mdc-text-field-wrapper {
            background-color: #ffebee;
          }
        }
      }
    }

    .summary-section {
      display: flex;
      gap: 32px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
      margin-top: 24px;

      .summary-item {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .value {
          font-size: 16px;
          font-weight: 600;
          color: #212121;

          &.valid {
            color: #4caf50;
          }
        }
      }
    }

    ::ng-deep {
      .mat-mdc-form-field-error {
        font-size: 12px;
      }

      .mat-mdc-form-field-hint {
        font-size: 12px;
      }

      mat-icon {
        &.error {
          color: #f44336;
        }
      }
    }
  `],
})
export class TransferFormComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  @Input() selectedPatientCount: number = 0;

  ngOnInit(): void {
    if (!this.formGroup) {
      throw new Error('formGroup is required');
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.formGroup.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.formGroup.get(fieldName);
    if (field?.errors) {
      return Object.keys(field.errors)[0];
    }
    return null;
  }
}

