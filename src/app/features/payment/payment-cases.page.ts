import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusChipComponent, type StatusTone } from '../../shared/ui/status-chip/status-chip.component';
import { PathToPaymentStore } from '../../state/path-to-payment.store';
import { PaymentCaseDialogComponent } from './payment-case-dialog.component';

function toneFromStatus(status: string | undefined): StatusTone {
  const map: Record<string, StatusTone> = {
    OPEN: 'pending',
    PENDING: 'pending',
    SETTLED: 'completed',
    CLOSED: 'active',
    OVERDUE: 'error',
  };

  return status && map[status] ? map[status] : 'neutral';
}

@Component({
  selector: 'app-payment-cases-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
    PageHeaderComponent,
    StatusChipComponent,
  ],
  template: `
    <app-page-header title="Path To Payment" subtitle="Payment Cases, workflow statuses, balances, and financial progress.">
      <div class="header-actions">
        <button mat-flat-button color="primary" type="button" (click)="openCreateDialog()" [disabled]="store.isActionLoading()">
          <mat-icon>add</mat-icon>
          New Case
        </button>
        <button mat-stroked-button type="button" (click)="reload()" [disabled]="store.isListLoading()">
          <mat-icon>refresh</mat-icon>
          Refresh
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

    <section class="dashboard-grid">
      <article class="metric-card">
        <div class="label">Total Cases</div>
        <div class="value">{{ store.dashboard().totalCases }}</div>
      </article>
      <article class="metric-card">
        <div class="label">Open Cases</div>
        <div class="value">{{ store.dashboard().openCases }}</div>
      </article>
      <article class="metric-card">
        <div class="label">Settled/Closed</div>
        <div class="value">{{ store.dashboard().settledCases }}</div>
      </article>
      <article class="metric-card metric-card--highlight">
        <div class="label">Outstanding Balance</div>
        <div class="value">{{ store.dashboard().totalOutstanding | number: '1.2-2' }}</div>
      </article>
    </section>

    <section class="panel filters-panel">
      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Search Case / Patient</mat-label>
        <input matInput [(ngModel)]="searchText" (ngModelChange)="applyLocalFilter()" placeholder="Case ref or patient id" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="status-filter-field">
        <mat-label>Payment Status</mat-label>
        <mat-select [(ngModel)]="statusFilter" (selectionChange)="applyStatusFilter()">
          <mat-option value="">All</mat-option>
          <mat-option value="OPEN">Open</mat-option>
          <mat-option value="PENDING">Pending</mat-option>
          <mat-option value="SETTLED">Settled</mat-option>
          <mat-option value="CLOSED">Closed</mat-option>
          <mat-option value="OVERDUE">Overdue</mat-option>
        </mat-select>
      </mat-form-field>
    </section>

    <section class="panel">
      @if (store.isListLoading()) {
        <div class="loading-block">
          <span>Loading payment cases...</span>
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        </div>
      }

      <table mat-table [dataSource]="filteredRows()" class="cases-table">
        <ng-container matColumnDef="pathToPaymentCaseId">
          <th mat-header-cell *matHeaderCellDef>Case ID</th>
          <td mat-cell *matCellDef="let row">#{{ row.pathToPaymentCaseId }}</td>
        </ng-container>

        <ng-container matColumnDef="paymentCaseRef">
          <th mat-header-cell *matHeaderCellDef>Reference</th>
          <td mat-cell *matCellDef="let row">{{ row.paymentCaseRef || '—' }}</td>
        </ng-container>

        <ng-container matColumnDef="patientId">
          <th mat-header-cell *matHeaderCellDef>Patient ID</th>
          <td mat-cell *matCellDef="let row">{{ row.patientId || '—' }}</td>
        </ng-container>

        <ng-container matColumnDef="paymentStatus">
          <th mat-header-cell *matHeaderCellDef>Payment Status</th>
          <td mat-cell *matCellDef="let row">
            <app-status-chip [label]="row.paymentStatus || 'UNKNOWN'" [tone]="toneFromStatus(row.paymentStatus)" />
          </td>
        </ng-container>

        <ng-container matColumnDef="outstandingBalance">
          <th mat-header-cell *matHeaderCellDef>Outstanding</th>
          <td mat-cell *matCellDef="let row">{{ row.outstandingBalance ?? 0 | number: '1.2-2' }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let row" class="actions-cell">
            <a mat-stroked-button color="primary" [routerLink]="['/path-to-payment', row.pathToPaymentCaseId]">
              <mat-icon>visibility</mat-icon>
              Case Details
            </a>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let _row; columns: columns"></tr>
      </table>

      @if (filteredRows().length === 0 && !store.isListLoading()) {
        <p class="empty-text">
          <mat-icon>search_off</mat-icon>
          No payment cases found.
        </p>
      }
    </section>
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

    .dashboard-grid {
      margin-bottom: 1rem;
      display: grid;
      grid-template-columns: repeat(4, minmax(160px, 1fr));
      gap: 0.75rem;
    }

    .metric-card {
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-lg);
      padding: 0.9rem;
      background: var(--clr-surface);
      box-shadow: var(--shadow-sm);

      .label {
        font-size: 0.75rem;
        color: var(--clr-text-2);
        text-transform: uppercase;
      }

      .value {
        margin-top: 0.25rem;
        font-size: 1.3rem;
        font-weight: 700;
      }
    }

    .metric-card--highlight {
      border-color: #90caf9;
      background: #f2f8ff;
    }

    .panel {
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-lg);
      padding: 1rem;
      background: var(--clr-surface);
      box-shadow: var(--shadow-sm);
      margin-bottom: 1rem;
    }

    .filters-panel {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
    }

    .filter-field {
      min-width: 280px;
      flex: 1;
    }

    .status-filter-field {
      width: 180px;
    }

    .loading-block {
      margin-bottom: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .cases-table {
      width: 100%;
    }

    .actions-cell {
      white-space: nowrap;
    }

    .empty-text {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: var(--clr-text-2);
      margin: 0.8rem 0 0;
    }

    @media (max-width: 992px) {
      .dashboard-grid {
        grid-template-columns: repeat(2, minmax(160px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .status-filter-field {
        width: 100%;
      }
    }
  `],
})
export class PaymentCasesPageComponent implements OnInit {
  readonly store = inject(PathToPaymentStore);
  private readonly dialog = inject(MatDialog);

  readonly columns = ['pathToPaymentCaseId', 'paymentCaseRef', 'patientId', 'paymentStatus', 'outstandingBalance', 'actions'];
  readonly toneFromStatus = toneFromStatus;

  searchText = '';
  statusFilter = '';

  readonly filteredRows = signal(this.store.rows());

  async ngOnInit(): Promise<void> {
    await this.store.loadCases();
    this.applyLocalFilter();
  }

  async reload(): Promise<void> {
    await this.store.loadCases(this.statusFilter || undefined);
    this.applyLocalFilter();
  }

  async applyStatusFilter(): Promise<void> {
    await this.store.loadCases(this.statusFilter || undefined);
    this.applyLocalFilter();
  }

  applyLocalFilter(): void {
    const query = this.searchText.trim().toLowerCase();
    const rows = this.store.rows();

    if (!query) {
      this.filteredRows.set(rows);
      return;
    }

    this.filteredRows.set(rows.filter((row) => {
      const ref = String(row.paymentCaseRef ?? '').toLowerCase();
      const patientId = String(row.patientId ?? '').toLowerCase();
      const caseId = String(row.pathToPaymentCaseId ?? '').toLowerCase();
      return ref.includes(query) || patientId.includes(query) || caseId.includes(query);
    }));
  }

  async openCreateDialog(): Promise<void> {
    const dialogRef = this.dialog.open(PaymentCaseDialogComponent, {
      width: '860px',
      data: { currentStep: 'INTAKE' },
    });

    const payload = await firstValueFrom(dialogRef.afterClosed());
    if (!payload) {
      return;
    }

    const created = await this.store.createCase(payload);
    if (created) {
      this.searchText = '';
      this.applyLocalFilter();
    }
  }
}
