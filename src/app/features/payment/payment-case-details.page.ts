import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusChipComponent, type StatusTone } from '../../shared/ui/status-chip/status-chip.component';
import { PathToPaymentStore } from '../../state/path-to-payment.store';
import { PaymentMilestoneDialogComponent } from './payment-milestone-dialog.component';
import { PaymentStatusDialogComponent } from './payment-status-dialog.component';
import { PaymentTransactionDialogComponent } from './payment-transaction-dialog.component';

function statusTone(status: string | undefined): StatusTone {
  const map: Record<string, StatusTone> = {
    OPEN: 'pending',
    PENDING: 'pending',
    SETTLED: 'completed',
    CLOSED: 'active',
    OVERDUE: 'error',
    VERIFIED: 'active',
    CLEARED: 'completed',
    BILLED: 'active',
  };

  return status && map[status] ? map[status] : 'neutral';
}

@Component({
  selector: 'app-payment-case-details-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatTabsModule,
    PageHeaderComponent,
    StatusChipComponent,
  ],
  template: `
    <app-page-header
      title="Case Details"
      subtitle="Transactions, Milestones, Outstanding Balance, Statuses, Summary Dashboard, and Timeline.">
      <div class="header-actions">
        <button mat-stroked-button type="button" [routerLink]="['/path-to-payment']">
          <mat-icon>arrow_back</mat-icon>
          Back To Cases
        </button>
        <button mat-stroked-button type="button" (click)="reload()" [disabled]="store.isDetailsLoading() || !caseId">
          <mat-icon>refresh</mat-icon>
          Reload
        </button>
      </div>
    </app-page-header>

    @if (store.error()) {
      <div class="feedback-banner feedback-banner--error" role="alert">
        <mat-icon>error_outline</mat-icon>
        <span>{{ store.error() }}</span>
      </div>
    }

    @if (store.info()) {
      <div class="feedback-banner" role="status">
        <mat-icon>check_circle</mat-icon>
        <span>{{ store.info() }}</span>
      </div>
    }

    @if (store.isDetailsLoading()) {
      <section class="panel">
        <span>Loading case details...</span>
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      </section>
    }

    <section class="summary-grid">
      <mat-card class="summary-card">
        <div class="label">Payment Case</div>
        <div class="value">{{ store.currentCase()?.paymentCaseRef || ('#' + (store.currentCase()?.pathToPaymentCaseId ?? '-')) }}</div>
      </mat-card>
      <mat-card class="summary-card">
        <div class="label">Outstanding Balance</div>
        <div class="value">{{ store.outstandingBalance()?.outstandingBalance ?? store.currentCase()?.outstandingBalance ?? 0 | number:'1.2-2' }}</div>
      </mat-card>
      <mat-card class="summary-card">
        <div class="label">Completed Milestones</div>
        <div class="value">{{ store.caseSummary()?.completedMilestones ?? 0 }} / {{ store.caseSummary()?.totalMilestones ?? 0 }}</div>
      </mat-card>
      <mat-card class="summary-card">
        <div class="label">Transactions</div>
        <div class="value">{{ store.caseSummary()?.totalTransactions ?? store.transactions().length }}</div>
      </mat-card>
    </section>

    <section class="panel progress-panel">
      <div class="progress-head">
        <div>
          <h3>Progress Indicators</h3>
          <p>Milestone completion and workflow status timeline.</p>
        </div>
        <app-status-chip [label]="store.currentCase()?.paymentStatus || 'UNKNOWN'" [tone]="statusTone(store.currentCase()?.paymentStatus)" />
      </div>

      <mat-progress-bar mode="determinate" [value]="milestoneProgress()"></mat-progress-bar>
      <div class="progress-meta">{{ milestoneProgress() | number:'1.0-0' }}% milestone completion</div>
    </section>

    <mat-tab-group animationDuration="0ms">
      <mat-tab label="Case Details">
        <section class="panel details-grid">
          <article class="detail-card">
            <h4>Payment Case</h4>
            <p><strong>Case ID:</strong> {{ store.currentCase()?.pathToPaymentCaseId || '-' }}</p>
            <p><strong>Patient ID:</strong> {{ store.currentCase()?.patientId || '-' }}</p>
            <p><strong>Current Step:</strong> {{ store.currentCase()?.currentStep || '-' }}</p>
            <p><strong>Opened:</strong> {{ store.currentCase()?.openedAt || '-' }}</p>
            <p><strong>Due:</strong> {{ store.currentCase()?.dueDate || '-' }}</p>
          </article>

          <article class="detail-card">
            <h4>Summary Dashboard</h4>
            <p><strong>Total Charges:</strong> {{ store.currentCase()?.totalCharges ?? 0 | number:'1.2-2' }}</p>
            <p><strong>Allowed:</strong> {{ store.currentCase()?.allowedAmount ?? 0 | number:'1.2-2' }}</p>
            <p><strong>Insurance Resp:</strong> {{ store.currentCase()?.insuranceResponsibility ?? 0 | number:'1.2-2' }}</p>
            <p><strong>Patient Resp:</strong> {{ store.currentCase()?.patientResponsibility ?? 0 | number:'1.2-2' }}</p>
            <p><strong>Outstanding:</strong> {{ store.outstandingBalance()?.outstandingBalance ?? 0 | number:'1.2-2' }}</p>
          </article>

          <article class="detail-card">
            <h4>Status Controls</h4>
            <div class="status-line">
              <span>Payment Status</span>
              <app-status-chip [label]="store.currentCase()?.paymentStatus || 'UNKNOWN'" [tone]="statusTone(store.currentCase()?.paymentStatus)" />
            </div>
            <div class="status-line">
              <span>Insurance Status</span>
              <app-status-chip [label]="store.currentCase()?.insuranceStatus || 'UNKNOWN'" [tone]="statusTone(store.currentCase()?.insuranceStatus)" />
            </div>
            <div class="status-line">
              <span>Billing Status</span>
              <app-status-chip [label]="store.currentCase()?.billingStatus || 'UNKNOWN'" [tone]="statusTone(store.currentCase()?.billingStatus)" />
            </div>
            <div class="status-line">
              <span>Financial Clearance</span>
              <app-status-chip [label]="store.currentCase()?.financialClearanceStatus || 'UNKNOWN'" [tone]="statusTone(store.currentCase()?.financialClearanceStatus)" />
            </div>
            <div class="status-actions">
              <button mat-stroked-button (click)="openStatusDialog('payment')" [disabled]="!caseId || store.isActionLoading()">Payment</button>
              <button mat-stroked-button (click)="openStatusDialog('insurance')" [disabled]="!caseId || store.isActionLoading()">Insurance</button>
              <button mat-stroked-button (click)="openStatusDialog('billing')" [disabled]="!caseId || store.isActionLoading()">Billing</button>
              <button mat-stroked-button (click)="openStatusDialog('financial')" [disabled]="!caseId || store.isActionLoading()">Financial</button>
            </div>
          </article>
        </section>
      </mat-tab>

      <mat-tab label="Transactions">
        <section class="panel">
          <div class="section-head">
            <h3>Transactions</h3>
            <button mat-flat-button color="primary" type="button" [disabled]="!caseId || store.isActionLoading()" (click)="openTransactionDialog()">
              <mat-icon>add</mat-icon>
              Record Transaction
            </button>
          </div>

          <table mat-table [dataSource]="store.transactions()" class="data-table">
            <ng-container matColumnDef="paymentTransactionId">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let row">{{ row.paymentTransactionId || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="transactionType">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let row">{{ row.transactionType || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let row">{{ row.amount ?? 0 | number:'1.2-2' }}</td>
            </ng-container>
            <ng-container matColumnDef="referenceNumber">
              <th mat-header-cell *matHeaderCellDef>Reference</th>
              <td mat-cell *matCellDef="let row">{{ row.referenceNumber || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="transactionAt">
              <th mat-header-cell *matHeaderCellDef>At</th>
              <td mat-cell *matCellDef="let row">{{ row.transactionAt || '-' }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="transactionColumns"></tr>
            <tr mat-row *matRowDef="let _row; columns: transactionColumns"></tr>
          </table>
        </section>
      </mat-tab>

      <mat-tab label="Milestones">
        <section class="panel">
          <div class="section-head">
            <h3>Milestones</h3>
            <button mat-flat-button color="primary" type="button" [disabled]="!caseId || store.isActionLoading()" (click)="openMilestoneDialog()">
              <mat-icon>add</mat-icon>
              Add Milestone
            </button>
          </div>

          <table mat-table [dataSource]="store.milestones()" class="data-table">
            <ng-container matColumnDef="sequenceNo">
              <th mat-header-cell *matHeaderCellDef>Seq</th>
              <td mat-cell *matCellDef="let row">{{ row.sequenceNo || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="milestoneCode">
              <th mat-header-cell *matHeaderCellDef>Code</th>
              <td mat-cell *matCellDef="let row">{{ row.milestoneCode || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="milestoneName">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let row">{{ row.milestoneName || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="milestoneStatus">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <app-status-chip [label]="row.milestoneStatus || 'UNKNOWN'" [tone]="statusTone(row.milestoneStatus)" />
              </td>
            </ng-container>
            <ng-container matColumnDef="targetDate">
              <th mat-header-cell *matHeaderCellDef>Target</th>
              <td mat-cell *matCellDef="let row">{{ row.targetDate || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let row">
                <button mat-stroked-button type="button" (click)="openMilestoneDialog(row)">Update</button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="milestoneColumns"></tr>
            <tr mat-row *matRowDef="let _row; columns: milestoneColumns"></tr>
          </table>
        </section>
      </mat-tab>

      <mat-tab label="Outstanding Balance">
        <section class="panel details-grid">
          <article class="detail-card">
            <h4>Outstanding Balance</h4>
            <p><strong>Balance:</strong> {{ store.outstandingBalance()?.outstandingBalance ?? 0 | number:'1.2-2' }}</p>
            <p><strong>Overdue:</strong> {{ store.outstandingBalance()?.overdue ? 'Yes' : 'No' }}</p>
          </article>
          <article class="detail-card">
            <h4>Outstanding Allocation</h4>
            <p><strong>Insurance:</strong> {{ store.currentCase()?.insuranceResponsibility ?? 0 | number:'1.2-2' }}</p>
            <p><strong>Patient:</strong> {{ store.currentCase()?.patientResponsibility ?? 0 | number:'1.2-2' }}</p>
          </article>
        </section>
      </mat-tab>

      <mat-tab label="Status Timeline">
        <section class="panel">
          <h3>Status Timeline</h3>
          <div class="timeline">
            @for (item of timelineItems(); track item.id) {
              <article class="timeline-item">
                <div class="dot"></div>
                <div class="content">
                  <div class="time">{{ item.when }}</div>
                  <div class="title">{{ item.title }}</div>
                  <div class="desc">{{ item.detail }}</div>
                </div>
              </article>
            }
          </div>
        </section>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [`
    .header-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .feedback-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      background: rgba(46, 125, 50, 0.1);
      border: 1px solid rgba(46, 125, 50, 0.2);
      color: #2e7d32;
      margin-bottom: 1rem;
    }

    .feedback-banner--error {
      background: rgba(198, 40, 40, 0.08);
      border-color: rgba(198, 40, 40, 0.2);
      color: #c62828;
    }

    .panel {
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-lg);
      padding: 1rem;
      background: var(--clr-surface);
      box-shadow: var(--shadow-sm);
      margin-bottom: 1rem;
    }

    .summary-grid {
      margin-bottom: 1rem;
      display: grid;
      grid-template-columns: repeat(4, minmax(160px, 1fr));
      gap: 0.75rem;
    }

    .summary-card {
      border: 1px solid var(--clr-border);
      box-shadow: var(--shadow-sm);

      .label {
        font-size: 0.75rem;
        text-transform: uppercase;
        color: var(--clr-text-2);
      }

      .value {
        margin-top: 0.2rem;
        font-size: 1.15rem;
        font-weight: 700;
      }
    }

    .progress-panel {
      .progress-head {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      h3 {
        margin: 0;
      }

      p {
        margin: 0.2rem 0 0;
        color: var(--clr-text-2);
        font-size: 0.82rem;
      }

      .progress-meta {
        margin-top: 0.45rem;
        color: var(--clr-text-2);
        font-size: 0.8rem;
      }
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(220px, 1fr));
      gap: 0.75rem;
    }

    .detail-card {
      border: 1px solid var(--clr-border);
      border-radius: 10px;
      padding: 0.8rem;

      h4 {
        margin: 0 0 0.6rem;
      }

      p {
        margin: 0.3rem 0;
      }
    }

    .status-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      gap: 0.5rem;
    }

    .status-actions {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
      margin-top: 0.75rem;
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .data-table {
      width: 100%;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .timeline-item {
      display: grid;
      grid-template-columns: 14px 1fr;
      gap: 0.7rem;

      .dot {
        margin-top: 6px;
        width: 12px;
        height: 12px;
        border-radius: 999px;
        border: 2px solid #90caf9;
      }

      .content {
        border: 1px solid var(--clr-border);
        border-radius: 10px;
        padding: 0.6rem;

        .time {
          font-size: 0.76rem;
          color: var(--clr-text-2);
        }

        .title {
          margin-top: 0.2rem;
          font-weight: 600;
        }

        .desc {
          margin-top: 0.2rem;
          font-size: 0.82rem;
        }
      }
    }

    @media (max-width: 992px) {
      .summary-grid {
        grid-template-columns: repeat(2, minmax(160px, 1fr));
      }

      .details-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class PaymentCaseDetailsPageComponent implements OnInit {
  readonly store = inject(PathToPaymentStore);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  caseId = 0;

  readonly transactionColumns = ['paymentTransactionId', 'transactionType', 'amount', 'referenceNumber', 'transactionAt'];
  readonly milestoneColumns = ['sequenceNo', 'milestoneCode', 'milestoneName', 'milestoneStatus', 'targetDate', 'actions'];
  readonly statusTone = statusTone;

  readonly milestoneProgress = computed(() => {
    const summary = this.store.caseSummary();
    const total = Number(summary?.totalMilestones ?? 0);
    const completed = Number(summary?.completedMilestones ?? 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  });

  readonly timelineItems = computed(() => {
    const caseInfo = this.store.currentCase();
    const milestones = this.store.milestones();
    const timeline = [
      {
        id: 'opened',
        when: caseInfo?.openedAt || 'N/A',
        title: 'Case Opened',
        detail: `Status ${caseInfo?.paymentStatus || 'UNKNOWN'}`,
      },
      {
        id: 'insurance',
        when: caseInfo?.openedAt || 'N/A',
        title: 'Insurance Status',
        detail: caseInfo?.insuranceStatus || 'UNKNOWN',
      },
      {
        id: 'billing',
        when: caseInfo?.openedAt || 'N/A',
        title: 'Billing Status',
        detail: caseInfo?.billingStatus || 'UNKNOWN',
      },
      {
        id: 'financial',
        when: caseInfo?.openedAt || 'N/A',
        title: 'Financial Clearance',
        detail: caseInfo?.financialClearanceStatus || 'UNKNOWN',
      },
    ];

    for (const milestone of milestones) {
      timeline.push({
        id: `ms-${milestone.paymentMilestoneId ?? milestone.sequenceNo}`,
        when: milestone.completedDate || milestone.targetDate || 'N/A',
        title: `Milestone ${milestone.milestoneCode || '-'}`,
        detail: milestone.milestoneStatus || 'UNKNOWN',
      });
    }

    return timeline;
  });

  async ngOnInit(): Promise<void> {
    const caseIdParam = await firstValueFrom(this.route.paramMap);
    this.caseId = Number(caseIdParam.get('caseId') || 0);
    if (this.caseId > 0) {
      await this.store.loadCaseDetails(this.caseId);
    }
  }

  async reload(): Promise<void> {
    if (this.caseId > 0) {
      await this.store.loadCaseDetails(this.caseId);
    }
  }

  async openTransactionDialog(): Promise<void> {
    if (!this.caseId) {
      return;
    }

    const dialogRef = this.dialog.open(PaymentTransactionDialogComponent, { width: '700px' });
    const payload = await firstValueFrom(dialogRef.afterClosed());
    if (!payload) {
      return;
    }

    await this.store.addTransaction(this.caseId, payload);
  }

  async openMilestoneDialog(row?: { paymentMilestoneId?: number }): Promise<void> {
    if (!this.caseId) {
      return;
    }

    const milestone = row ? this.store.milestones().find((item) => item.paymentMilestoneId === row.paymentMilestoneId) : undefined;
    const dialogRef = this.dialog.open(PaymentMilestoneDialogComponent, {
      width: '760px',
      data: {
        mode: milestone ? 'edit' : 'create',
        milestone,
      },
    });

    const payload = await firstValueFrom(dialogRef.afterClosed());
    if (!payload) {
      return;
    }

    if (milestone?.paymentMilestoneId) {
      await this.store.updateMilestone(this.caseId, milestone.paymentMilestoneId, payload);
      return;
    }

    await this.store.addMilestone(this.caseId, payload);
  }

  async openStatusDialog(target: 'payment' | 'insurance' | 'billing' | 'financial'): Promise<void> {
    if (!this.caseId) {
      return;
    }

    const caseInfo = this.store.currentCase();
    const config = this.getStatusDialogConfig(target, caseInfo);

    const dialogRef = this.dialog.open(PaymentStatusDialogComponent, {
      width: '560px',
      data: config,
    });

    const payload = await firstValueFrom(dialogRef.afterClosed());
    if (!payload) {
      return;
    }

    if (target === 'payment') {
      await this.store.updatePaymentStatus(this.caseId, { paymentStatus: payload.status, notes: payload.notes });
      return;
    }

    if (target === 'insurance') {
      await this.store.updateInsuranceStatus(this.caseId, { insuranceStatus: payload.status, notes: payload.notes });
      return;
    }

    if (target === 'billing') {
      await this.store.updateBillingStatus(this.caseId, { billingStatus: payload.status, notes: payload.notes });
      return;
    }

    await this.store.updateFinancialClearance(this.caseId, { financialClearanceStatus: payload.status, notes: payload.notes });
  }

  private getStatusDialogConfig(target: 'payment' | 'insurance' | 'billing' | 'financial', caseInfo: any): {
    title: string;
    label: string;
    value: string;
    options: string[];
  } {
    if (target === 'payment') {
      return {
        title: 'Update Payment Status',
        label: 'Payment Status',
        value: caseInfo?.paymentStatus || 'OPEN',
        options: ['OPEN', 'PENDING', 'SETTLED', 'CLOSED', 'OVERDUE'],
      };
    }

    if (target === 'insurance') {
      return {
        title: 'Update Insurance Status',
        label: 'Insurance Status',
        value: caseInfo?.insuranceStatus || 'NOT_VERIFIED',
        options: ['NOT_VERIFIED', 'IN_PROGRESS', 'VERIFIED', 'DENIED'],
      };
    }

    if (target === 'billing') {
      return {
        title: 'Update Billing Status',
        label: 'Billing Status',
        value: caseInfo?.billingStatus || 'NOT_BILLED',
        options: ['NOT_BILLED', 'BILLED', 'PARTIALLY_BILLED', 'CLOSED'],
      };
    }

    return {
      title: 'Update Financial Clearance',
      label: 'Financial Clearance',
      value: caseInfo?.financialClearanceStatus || 'NOT_STARTED',
      options: ['NOT_STARTED', 'IN_PROGRESS', 'CLEARED', 'BLOCKED'],
    };
  }
}

