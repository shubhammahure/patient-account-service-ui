import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { PatientSelectionTableComponent } from './patient-selection-table.component';
import { TransferFormComponent } from './transfer-form.component';
import { TransferConfirmationDialogComponent } from './transfer-confirmation-dialog.component';
import { TransferSummaryComponent } from './transfer-summary.component';
import { TransfersStore } from '../../state/transfers.store';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-bulk-transfer-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PageHeaderComponent,
    PatientSelectionTableComponent,
    TransferFormComponent,
    TransferSummaryComponent,
  ],
  template: `
    <app-page-header
      title="Bulk Patient Transfer"
      subtitle="Transfer multiple patients to a destination ward/facility">
      <div class="header-actions">
        <button mat-raised-button color="primary" (click)="resetStepper()" [disabled]="isProcessing()">
          <mat-icon>refresh</mat-icon>
          Reset
        </button>
      </div>
    </app-page-header>

    <mat-stepper #stepper [linear]="true" class="bulk-transfer-stepper">
      <!-- Step 1: Patient Selection -->
      <mat-step label="Select Patients" editable="false">
        <ng-template matStepLabel>
          <span class="step-label">
            <span class="step-number">1</span>
            <span>Select Patients</span>
          </span>
        </ng-template>

        <div class="step-content">
          <app-patient-selection-table
            (patientsSelected)="onPatientsSelected($event)">
          </app-patient-selection-table>

          <div class="step-actions">
            <button
              mat-raised-button
              color="primary"
              (click)="stepper.next()"
              [disabled]="selectedPatients().length === 0 || isProcessing()">
              Next: Transfer Details
            </button>
          </div>
        </div>
      </mat-step>

      <!-- Step 2: Transfer Form -->
      <mat-step [stepControl]="transferFormGroup" editable="false">
        <ng-template matStepLabel>
          <span class="step-label">
            <span class="step-number">2</span>
            <span>Transfer Details</span>
          </span>
        </ng-template>

        <div class="step-content">
          <app-transfer-form
            [formGroup]="transferFormGroup"
            [selectedPatientCount]="selectedPatients().length">
          </app-transfer-form>

          <div class="step-actions">
            <button
              mat-stroked-button
              (click)="stepper.previous()"
              [disabled]="isProcessing()">
              Back
            </button>
            <button
              mat-raised-button
              color="primary"
              (click)="stepper.next()"
              [disabled]="!transferFormGroup.valid || isProcessing()">
              Review Transfer
            </button>
          </div>
        </div>
      </mat-step>

      <!-- Step 3: Review and Confirm -->
      <mat-step editable="false">
        <ng-template matStepLabel>
          <span class="step-label">
            <span class="step-number">3</span>
            <span>Review & Confirm</span>
          </span>
        </ng-template>

        <div class="step-content">
          <app-transfer-summary
            [selectedPatients]="selectedPatients()"
            [transferDetails]="transferFormGroup.value">
          </app-transfer-summary>

          <div class="step-actions">
            <button
              mat-stroked-button
              (click)="stepper.previous()"
              [disabled]="isProcessing()">
              Back
            </button>
            <button
              mat-raised-button
              color="warn"
              (click)="confirmTransfer()"
              [disabled]="!transferFormGroup.valid || isProcessing()">
              <mat-icon *ngIf="!isProcessing()">check_circle</mat-icon>
              <mat-spinner
                *ngIf="isProcessing()"
                diameter="20"
                [style.margin-right.px]="8">
              </mat-spinner>
              {{ isProcessing() ? 'Processing...' : 'Confirm & Transfer' }}
            </button>
          </div>
        </div>
      </mat-step>

      <!-- Step 4: Progress/Results -->
      <mat-step editable="false">
        <ng-template matStepLabel>
          <span class="step-label">
            <span class="step-number">4</span>
            <span>Progress</span>
          </span>
        </ng-template>

        <div class="step-content">
          <div class="progress-section">
            <div class="progress-header">
              <h2>Transfer in Progress</h2>
              <p *ngIf="progressPercentage() < 100">
                Processing {{ currentProgress() }} of {{ selectedPatients().length }} patients...
              </p>
            </div>

            <mat-progress-bar
              mode="determinate"
              [value]="progressPercentage()"
              class="progress-bar">
            </mat-progress-bar>

            <div class="progress-stats">
              <div class="stat">
                <span class="label">Processed:</span>
                <span class="value">{{ currentProgress() }}</span>
              </div>
              <div class="stat">
                <span class="label">Successful:</span>
                <span class="value success">{{ transferResult()?.totalTransferred ?? 0 }}</span>
              </div>
              <div class="stat">
                <span class="label">Failed:</span>
                <span class="value error" *ngIf="transferResult()?.totalFailed! > 0">
                  {{ transferResult()?.totalFailed ?? 0 }}
                </span>
                <span class="value success" *ngIf="!transferResult()?.totalFailed || transferResult()?.totalFailed === 0">
                  0
                </span>
              </div>
            </div>

            <div class="result-section" *ngIf="progressPercentage() === 100">
              <div class="result-header" [class.success]="transferResult()?.totalFailed === 0">
                <mat-icon *ngIf="transferResult()?.totalFailed === 0">check_circle</mat-icon>
                <mat-icon *ngIf="transferResult()?.totalFailed! > 0">warning</mat-icon>
                <h3>
                  {{ transferResult()?.totalFailed === 0 ? 'Transfer Completed Successfully' : 'Transfer Completed with Issues' }}
                </h3>
              </div>
              <p class="batch-id">
                Batch ID: <strong>{{ transferResult()?.transferBatchId }}</strong>
              </p>
              <p *ngIf="transferResult()?.totalFailed! > 0" class="warning-message">
                {{ transferResult()?.totalFailed }} patient(s) could not be transferred. Please check individual records.
              </p>
            </div>
          </div>

          <div class="step-actions" *ngIf="progressPercentage() === 100">
            <button
              mat-raised-button
              color="primary"
              (click)="newTransfer()">
              <mat-icon>add</mat-icon>
              New Transfer
            </button>
            <button
              mat-stroked-button
              [routerLink]="['/admissions']">
              <mat-icon>list</mat-icon>
              View Admissions
            </button>
          </div>
        </div>
      </mat-step>
    </mat-stepper>
  `,
  styles: [`
    :host {
      display: block;
      padding: 24px;
    }

    .bulk-transfer-stepper {
      max-width: 1200px;
      margin: 0 auto;
    }

    .step-label {
      display: flex;
      align-items: center;
      gap: 12px;

      .step-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: rgba(63, 81, 181, 0.12);
        color: #3f51b5;
        font-weight: 600;
        font-size: 14px;
      }
    }

    .step-content {
      padding: 24px 0;
      min-height: 400px;
    }

    .step-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;

      button {
        min-width: 120px;
      }
    }

    .progress-section {
      padding: 24px 0;
    }

    .progress-header {
      margin-bottom: 24px;

      h2 {
        margin: 0;
        color: #212121;
        font-size: 20px;
        font-weight: 500;
      }

      p {
        margin: 8px 0 0;
        color: #666;
        font-size: 14px;
      }
    }

    .progress-bar {
      margin-bottom: 24px;
      height: 8px;
      border-radius: 4px;
    }

    .progress-stats {
      display: flex;
      gap: 32px;
      margin-bottom: 32px;

      .stat {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .label {
          color: #666;
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .value {
          font-size: 24px;
          font-weight: 600;
          color: #212121;

          &.success {
            color: #4caf50;
          }

          &.error {
            color: #f44336;
          }
        }
      }
    }

    .result-section {
      padding: 24px;
      background-color: #f5f5f5;
      border-radius: 8px;
      margin-top: 24px;

      &.success {
        background-color: #e8f5e9;
      }

      .result-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: #f44336;
        }

        &.success mat-icon {
          color: #4caf50;
        }

        h3 {
          margin: 0;
          color: #212121;
          font-size: 16px;
          font-weight: 500;
        }
      }

      .batch-id {
        margin: 12px 0;
        color: #212121;
        font-size: 14px;
      }

      .warning-message {
        margin: 12px 0 0;
        color: #f57c00;
        font-size: 14px;
      }
    }

    ::ng-deep {
      .mat-mdc-stepper-horizontal {
        background: transparent;
      }

      .mat-mdc-stepper-label-state-edit,
      .mat-mdc-stepper-label-state-done {
        .mat-mdc-stepper-label-content {
          opacity: 1 !important;
        }
      }

      .mat-step-label {
        color: #666 !important;

        &.mat-step-label-active {
          color: #3f51b5 !important;
        }
      }
    }

    mat-spinner {
      display: inline-block;
    }
  `],
})
export class BulkTransferPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly transfersStore = inject(TransfersStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly selectedPatients = this.transfersStore.selectedPatients;
  readonly isProcessing = this.transfersStore.isProcessing;
  readonly transferResult = this.transfersStore.transferResult;
  readonly currentProgress = this.transfersStore.currentProgress;

  transferFormGroup!: FormGroup;

  readonly progressPercentage = () => {
    const total = this.selectedPatients().length;
    const current = this.currentProgress();
    return total > 0 ? Math.round((current / total) * 100) : 0;
  };

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.transferFormGroup = this.fb.group({
      currentWard: ['', [Validators.required, Validators.minLength(2)]],
      destinationWard: ['', [Validators.required, Validators.minLength(2)]],
      destinationDepartmentId: ['', Validators.required],
      destinationBedId: [''],
      transferReason: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  onPatientsSelected(patients: any[]): void {
    this.transfersStore.setSelectedPatients(patients);
  }

  async confirmTransfer(): Promise<void> {
    if (!this.transferFormGroup.valid) {
      this.snackBar.open('Please complete all required fields', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(TransferConfirmationDialogComponent, {
      width: '500px',
      data: {
        patientCount: this.selectedPatients().length,
        transferDetails: this.transferFormGroup.value,
      },
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (result) {
      await this.transfersStore.performBulkTransfer(this.transferFormGroup.value);
    }
  }

  resetStepper(): void {
    this.transfersStore.reset();
    this.initializeForm();
  }

  newTransfer(): void {
    this.resetStepper();
  }
}



