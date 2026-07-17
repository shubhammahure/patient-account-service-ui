import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

interface PatientWithAdmission {
  patientId: number;
  fullName: string;
  mrn?: string;
  status: string;
  admissionId?: number;
  admissionStatus?: string;
  currentWard?: string;
  facilityCode?: string;
}

interface TransferDetails {
  currentWard: string;
  destinationWard: string;
  destinationDepartmentId: string;
  destinationBedId?: string;
  transferReason: string;
}

@Component({
  selector: 'app-transfer-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule,
    MatChipsModule,
  ],
  template: `
    <div class="transfer-summary-wrapper">
      <!-- Transfer Details Card -->
      <mat-card class="summary-card">
        <mat-card-header>
          <mat-card-title>Transfer Configuration</mat-card-title>
        </mat-card-header>

        <mat-divider></mat-divider>

        <mat-card-content class="summary-content">
          <div class="detail-row">
            <div class="detail-item">
              <mat-icon class="detail-icon">location_on</mat-icon>
              <div class="detail-info">
                <span class="detail-label">From:</span>
                <span class="detail-value">{{ transferDetails.currentWard }}</span>
              </div>
            </div>

            <div class="arrow">
              <mat-icon>arrow_forward</mat-icon>
            </div>

            <div class="detail-item">
              <mat-icon class="detail-icon">apartment</mat-icon>
              <div class="detail-info">
                <span class="detail-label">To:</span>
                <span class="detail-value">{{ transferDetails.destinationWard }}</span>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="detail-section">
            <div class="detail-grid">
              <div class="grid-item">
                <span class="label">Department:</span>
                <span class="value">{{ getDepartmentName() }}</span>
              </div>
              <div class="grid-item" *ngIf="transferDetails.destinationBedId">
                <span class="label">Specific Bed:</span>
                <span class="value">{{ transferDetails.destinationBedId }}</span>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="reason-section">
            <span class="label">Transfer Reason:</span>
            <p class="reason-text">{{ transferDetails.transferReason }}</p>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Patients Summary Card -->
      <mat-card class="summary-card">
        <mat-card-header>
          <mat-card-title>Patients to Transfer ({{ selectedPatients.length }})</mat-card-title>
        </mat-card-header>

        <mat-divider></mat-divider>

        <mat-card-content class="summary-content">
          <div class="patients-list">
            <div *ngFor="let patient of selectedPatients; let i = index" class="patient-item">
              <div class="patient-header">
                <span class="patient-number">{{ i + 1 }}</span>
                <div class="patient-info">
                  <span class="patient-name">{{ patient.fullName }}</span>
                  <span class="patient-meta">ID: #{{ patient.patientId }}</span>
                </div>
              </div>
              <div class="patient-details">
                <div class="detail-chip">
                  <span class="chip-label">MRN:</span>
                  <span class="chip-value">{{ patient.mrn || 'N/A' }}</span>
                </div>
                <div class="detail-chip">
                  <span class="chip-label">Status:</span>
                  <mat-chip-set>
                    <mat-chip [ngClass]="'status-' + patient.status">
                      {{ patient.status }}
                    </mat-chip>
                  </mat-chip-set>
                </div>
                <div class="detail-chip" *ngIf="patient.currentWard">
                  <span class="chip-label">Current Ward:</span>
                  <span class="chip-value">{{ patient.currentWard }}</span>
                </div>
              </div>
              <mat-divider *ngIf="i < selectedPatients.length - 1" class="patient-divider"></mat-divider>
            </div>
          </div>

          <div class="patients-summary">
            <div class="summary-stat">
              <span class="stat-label">Total Patients:</span>
              <span class="stat-value">{{ selectedPatients.length }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Summary Stats Card -->
      <mat-card class="summary-card">
        <mat-card-header>
          <mat-card-title>Transfer Summary</mat-card-title>
        </mat-card-header>

        <mat-divider></mat-divider>

        <mat-card-content class="summary-content">
          <div class="stats-grid">
            <div class="stat-card">
              <mat-icon>people</mat-icon>
              <span class="stat-title">Patients</span>
              <span class="stat-number">{{ selectedPatients.length }}</span>
            </div>

            <div class="stat-card">
              <mat-icon>location_on</mat-icon>
              <span class="stat-title">Source Ward</span>
              <span class="stat-detail">{{ transferDetails.currentWard }}</span>
            </div>

            <div class="stat-card">
              <mat-icon>apartment</mat-icon>
              <span class="stat-title">Destination Ward</span>
              <span class="stat-detail">{{ transferDetails.destinationWard }}</span>
            </div>

            <div class="stat-card">
              <mat-icon>info</mat-icon>
              <span class="stat-title">Transfer Type</span>
              <span class="stat-detail">Bulk Transfer</span>
            </div>
          </div>

          <div class="confirmation-note">
            <mat-icon>check_circle</mat-icon>
            <p>Please review the details above. Click "Confirm & Transfer" to proceed with the bulk transfer.</p>
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

    .transfer-summary-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .summary-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    mat-card-header {
      margin-bottom: 12px;

      mat-card-title {
        font-size: 18px;
        font-weight: 500;
        margin: 0;
      }
    }

    mat-card-content {
      padding-top: 16px;
      padding-bottom: 16px;

      &.summary-content {
        padding: 16px 0;
      }
    }

    .summary-content {
      padding: 0;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 16px;
      background-color: #f9f9f9;
      border-radius: 8px;

      .detail-item {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;

        .detail-icon {
          color: #3f51b5;
          font-size: 28px;
          width: 28px;
          height: 28px;
        }

        .detail-info {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .detail-label {
            font-size: 12px;
            color: #999;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .detail-value {
            font-size: 16px;
            color: #212121;
            font-weight: 600;
          }
        }
      }

      .arrow {
        display: flex;
        align-items: center;
        color: #3f51b5;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
    }

    .divider {
      height: 1px;
      background-color: #e0e0e0;
      margin: 16px 0;
    }

    .detail-section {
      padding: 0 16px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }

      .grid-item {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .label {
          font-size: 12px;
          color: #999;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .value {
          font-size: 14px;
          color: #212121;
          font-weight: 600;
        }
      }
    }

    .reason-section {
      padding: 16px;
      background-color: #f0f7ff;
      border-left: 4px solid #3f51b5;
      border-radius: 4px;

      .label {
        font-size: 12px;
        color: #1565c0;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: block;
        margin-bottom: 8px;
      }

      .reason-text {
        margin: 0;
        color: #1565c0;
        font-size: 14px;
        line-height: 1.6;
      }
    }

    .patients-list {
      max-height: 400px;
      overflow-y: auto;
      padding: 0 16px;
    }

    .patient-item {
      padding: 12px 0;

      &:first-child {
        padding-top: 0;
      }

      &:last-child {
        padding-bottom: 0;
      }
    }

    .patient-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .patient-number {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #e3f2fd;
        color: #1565c0;
        font-weight: 600;
        font-size: 13px;
        flex-shrink: 0;
      }

      .patient-info {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .patient-name {
          font-size: 14px;
          font-weight: 600;
          color: #212121;
        }

        .patient-meta {
          font-size: 12px;
          color: #999;
        }
      }
    }

    .patient-details {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-left: 44px;
    }

    .detail-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      font-size: 12px;

      .chip-label {
        color: #999;
        font-weight: 500;
      }

      .chip-value {
        color: #212121;
        font-weight: 600;
      }
    }

    .patient-divider {
      margin: 12px 0;
    }

    .patients-summary {
      padding: 16px;
      background-color: #f9f9f9;
      border-radius: 8px;
      margin-top: 16px;

      .summary-stat {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .stat-label {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 600;
          color: #3f51b5;
        }
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .stat-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        background-color: #f9f9f9;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        text-align: center;

        mat-icon {
          align-self: center;
          color: #3f51b5;
          font-size: 28px;
          width: 28px;
          height: 28px;
        }

        .stat-title {
          font-size: 12px;
          color: #999;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-number {
          font-size: 28px;
          font-weight: 600;
          color: #3f51b5;
        }

        .stat-detail {
          font-size: 13px;
          color: #212121;
          font-weight: 500;
        }
      }
    }

    .confirmation-note {
      display: flex;
      gap: 12px;
      padding: 16px;
      background-color: #e8f5e9;
      border-left: 4px solid #4caf50;
      border-radius: 4px;

      mat-icon {
        color: #4caf50;
        flex-shrink: 0;
      }

      p {
        margin: 0;
        color: #2e7d32;
        font-size: 13px;
        line-height: 1.5;
      }
    }

    ::ng-deep {
      .mat-mdc-chip {
        &.status-ACTIVE {
          background-color: #c8e6c9 !important;
          color: #1b5e20 !important;
        }

        &.status-INACTIVE {
          background-color: #bdbdbd !important;
          color: #424242 !important;
        }

        &.status-DECEASED {
          background-color: #ffcdd2 !important;
          color: #c62828 !important;
        }

        &.status-MERGED {
          background-color: #fff9c4 !important;
          color: #f57f17 !important;
        }

        &.status-ADMITTED {
          background-color: #c8e6c9 !important;
          color: #1b5e20 !important;
        }

        &.status-IN_TRANSFER {
          background-color: #fff3e0 !important;
          color: #e65100 !important;
        }

        &.status-DISCHARGED {
          background-color: #e0e0e0 !important;
          color: #424242 !important;
        }
      }
    }
  `],
})
export class TransferSummaryComponent {
  @Input() selectedPatients: PatientWithAdmission[] = [];
  @Input() transferDetails!: TransferDetails;

  getDepartmentName(): string {
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
    return this.transferDetails?.destinationDepartmentId
      ? departments[this.transferDetails.destinationDepartmentId] || 'Unknown'
      : 'Not Selected';
  }
}

