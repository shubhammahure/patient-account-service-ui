import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

interface DialogData {
  patientCount: number;
  transferDetails: {
    currentWard: string;
    destinationWard: string;
    destinationDepartmentId: string;
    transferReason: string;
  };
}

@Component({
  selector: 'app-transfer-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
  ],
  template: `
    <div class="confirmation-dialog">
      <div class="dialog-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2>Confirm Bulk Transfer</h2>
      </div>

      <mat-divider></mat-divider>

      <div class="dialog-content">
        <div class="alert alert-info">
          <mat-icon>info</mat-icon>
          <p>
            You are about to transfer <strong>{{ data.patientCount }} patient(s)</strong>.
            This action will be logged and cannot be undone. Please review the details below.
          </p>
        </div>

        <div class="details-section">
          <div class="detail-group">
            <span class="detail-label">From Ward:</span>
            <span class="detail-value">{{ data.transferDetails.currentWard }}</span>
          </div>

          <div class="detail-group">
            <span class="detail-label">To Ward:</span>
            <span class="detail-value highlight">{{ data.transferDetails.destinationWard }}</span>
          </div>

          <div class="detail-group" *ngIf="data.transferDetails.destinationDepartmentId">
            <span class="detail-label">Department:</span>
            <span class="detail-value">
              {{ getDepartmentName(data.transferDetails.destinationDepartmentId) }}
            </span>
          </div>

          <div class="detail-group">
            <span class="detail-label">Reason:</span>
            <span class="detail-value reason">{{ data.transferDetails.transferReason }}</span>
          </div>
        </div>

        <div class="confirmation-checklist">
          <h3>Before proceeding, please confirm:</h3>
          <div class="checklist-item">
            <mat-icon>check_box</mat-icon>
            <span>All patient information is correct</span>
          </div>
          <div class="checklist-item">
            <mat-icon>check_box</mat-icon>
            <span>Destination ward has capacity for {{ data.patientCount }} patient(s)</span>
          </div>
          <div class="checklist-item">
            <mat-icon>check_box</mat-icon>
            <span>Transfer reason has been documented</span>
          </div>
          <div class="checklist-item">
            <mat-icon>check_box</mat-icon>
            <span>You have appropriate authorization to perform bulk transfers</span>
          </div>
        </div>
      </div>

      <mat-divider></mat-divider>

      <div class="dialog-actions">
        <button
          mat-stroked-button
          (click)="onCancel()">
          Cancel
        </button>
        <button
          mat-raised-button
          color="warn"
          (click)="onConfirm()">
          <mat-icon>check_circle</mat-icon>
          Proceed with Transfer
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .confirmation-dialog {
      width: 100%;
      max-width: 500px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;

      .warning-icon {
        color: #ff9800;
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      h2 {
        margin: 0;
        color: #212121;
        font-size: 20px;
        font-weight: 500;
      }
    }

    .dialog-content {
      padding: 24px;
      max-height: 400px;
      overflow-y: auto;
    }

    .alert {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 20px;

      &.alert-info {
        background-color: #e3f2fd;
        border-left: 4px solid #2196f3;

        mat-icon {
          color: #2196f3;
          flex-shrink: 0;
        }

        p {
          margin: 0;
          color: #1565c0;
          font-size: 14px;
          line-height: 1.5;
        }
      }
    }

    .details-section {
      background-color: #f9f9f9;
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 20px;
      border: 1px solid #e0e0e0;
    }

    .detail-group {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .detail-label {
        font-size: 13px;
        font-weight: 500;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        flex-shrink: 0;
      }

      .detail-value {
        font-size: 14px;
        color: #212121;
        font-weight: 500;
        text-align: right;
        flex: 1;

        &.highlight {
          color: #3f51b5;
          font-weight: 600;
        }

        &.reason {
          color: #666;
          text-align: right;
          max-width: 200px;
          word-break: break-word;
        }
      }
    }

    .confirmation-checklist {
      margin: 20px 0;

      h3 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: #212121;
      }

      .checklist-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
        font-size: 13px;
        color: #666;

        mat-icon {
          color: #4caf50;
          font-size: 20px;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
      }
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding: 16px 24px;

      button {
        min-width: 120px;
      }
    }

    ::ng-deep {
      .mat-mdc-dialog-container {
        padding: 0;
      }
    }
  `],
})
export class TransferConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TransferConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  getDepartmentName(deptId: string): string {
    const departments: Record<string, string> = {
      '1': 'Cardiology',
      '2': 'General Medicine',
      '3': 'Surgery',
      '4': 'Orthopedics',
      '5': 'Neurology',
      '6': 'Pediatrics',
      '7': 'Oncology',
      '8': 'Psychiatry',
    };
    return departments[deptId] || 'Unknown';
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

