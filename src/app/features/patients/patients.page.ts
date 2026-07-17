import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusChipComponent, type StatusTone } from '../../shared/ui/status-chip/status-chip.component';
import { PatientDeleteDialogComponent } from './patient-delete-dialog.component';
import { PatientsStore } from '../../state/patients.store';

function statusTone(status: string | undefined): StatusTone {
  const map: Record<string, StatusTone> = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DECEASED: 'error',
    MERGED: 'neutral',
  };

  return (status && map[status]) ? map[status] : 'neutral';
}

@Component({
  selector: 'app-patients-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    PageHeaderComponent,
    StatusChipComponent,
  ],
  template: `
    <app-page-header title="Patient List" subtitle="Search, sort, filter and manage patient records.">
      <div class="header-actions">
        <a mat-flat-button routerLink="/patients/register">
          <mat-icon>person_add</mat-icon>
          Register Patient
        </a>
        <button mat-stroked-button (click)="exportCsv()" [disabled]="patientsStore.rows().length === 0">
          <mat-icon>download</mat-icon>
          Export CSV
        </button>
      </div>
    </app-page-header>

    <section class="filter-bar">
      <mat-form-field appearance="outline" class="field-search">
        <mat-label>Search Patient</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput placeholder="Name, MRN, account, phone" [(ngModel)]="searchText" (ngModelChange)="onSearchInput()" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="field-status">
        <mat-label>Status</mat-label>
        <mat-select [(ngModel)]="statusFilter" (selectionChange)="applyFilters()">
          <mat-option value="">All</mat-option>
          <mat-option value="ACTIVE">Active</mat-option>
          <mat-option value="INACTIVE">Inactive</mat-option>
          <mat-option value="DECEASED">Deceased</mat-option>
          <mat-option value="MERGED">Merged</mat-option>
        </mat-select>
      </mat-form-field>

      <button mat-flat-button (click)="applyFilters()">
        <mat-icon>filter_alt</mat-icon>
        Apply
      </button>
    </section>

    <section class="panel">
      @if (patientsStore.error()) {
        <p class="error-text">{{ patientsStore.error() }}</p>
      }

      <table mat-table [dataSource]="patientsStore.rows()" matSort (matSortChange)="onSort($event)" class="patient-table">
        <ng-container matColumnDef="patientId">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="patientId">ID</th>
          <td mat-cell *matCellDef="let row">{{ row.patientId }}</td>
        </ng-container>

        <ng-container matColumnDef="fullName">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="lastName">Patient</th>
          <td mat-cell *matCellDef="let row">
            {{ row.fullName || ((row.firstName || '') + ' ' + (row.lastName || '')).trim() || 'Unknown' }}
          </td>
        </ng-container>

        <ng-container matColumnDef="accountNumber">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="accountNumber">Account</th>
          <td mat-cell *matCellDef="let row">{{ row.accountNumber || '—' }}</td>
        </ng-container>

        <ng-container matColumnDef="mrn">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="mrn">MRN</th>
          <td mat-cell *matCellDef="let row">{{ row.mrn || '—' }}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef mat-sort-header="status">Status</th>
          <td mat-cell *matCellDef="let row">
            <app-status-chip [label]="row.status || 'UNKNOWN'" [tone]="statusTone(row.status)" />
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let row" class="actions-cell">
            <a mat-icon-button [routerLink]="['/patients', row.patientId]" aria-label="View details">
              <mat-icon>visibility</mat-icon>
            </a>
            <a mat-icon-button [routerLink]="['/patients', row.patientId, 'edit']" aria-label="Edit patient">
              <mat-icon>edit</mat-icon>
            </a>
            <button mat-icon-button color="warn" (click)="confirmDelete(row.patientId, row.fullName)" aria-label="Delete patient">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let _row; columns: columns"></tr>
      </table>

      @if (patientsStore.rows().length === 0 && !patientsStore.isLoading()) {
        <p class="empty-text">
          <mat-icon>search_off</mat-icon>
          No patients found for current filters.
        </p>
      }

      <mat-paginator
        [length]="patientsStore.totalElements()"
        [pageIndex]="patientsStore.query().pageIndex"
        [pageSize]="patientsStore.query().pageSize"
        [pageSizeOptions]="[5, 10, 20, 50]"
        (page)="onPage($event)">
      </mat-paginator>
    </section>
  `,
  styles: [`
    .header-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-bar {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
      align-items: flex-start;
    }

    .field-search {
      flex: 1;
      min-width: 220px;
    }

    .field-status {
      width: 180px;
    }

    .panel {
      background: var(--clr-surface);
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-lg);
      padding: 1rem;
      box-shadow: var(--shadow-sm);
    }

    .patient-table {
      width: 100%;
    }

    .actions-cell {
      white-space: nowrap;
    }

    .error-text {
      color: #c62828;
      margin: 0 0 0.75rem;
      font-size: 0.82rem;
    }

    .empty-text {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
      color: var(--clr-text-2);
      padding: 1.5rem;
    }

    @media (max-width: 768px) {
      .field-status {
        width: 100%;
      }
    }
  `],
})
export class PatientsPageComponent implements OnInit {
  readonly patientsStore = inject(PatientsStore);
  private readonly dialog = inject(MatDialog);

  readonly columns = ['patientId', 'fullName', 'accountNumber', 'mrn', 'status', 'actions'];
  readonly statusTone = statusTone;

  searchText = '';
  statusFilter = '';
  private searchDebounceHandle?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    this.searchText = this.patientsStore.query().search;
    this.statusFilter = this.patientsStore.query().status;
    await this.patientsStore.load();
  }

  onSearchInput(): void {
    if (this.searchDebounceHandle) {
      clearTimeout(this.searchDebounceHandle);
    }

    this.searchDebounceHandle = setTimeout(() => {
      void this.applyFilters();
    }, 350);
  }

  async applyFilters(): Promise<void> {
    this.patientsStore.setFilters(this.searchText, this.statusFilter);
    await this.patientsStore.load();
  }

  async onSort(sort: Sort): Promise<void> {
    const direction = (sort.direction || 'desc') as 'asc' | 'desc';
    this.patientsStore.setSort(sort.active || 'createdAt', direction);
    await this.patientsStore.load();
  }

  async onPage(event: PageEvent): Promise<void> {
    this.patientsStore.setPage(event.pageIndex, event.pageSize);
    await this.patientsStore.load();
  }

  async confirmDelete(patientId?: number, fullName?: string): Promise<void> {
    if (!patientId) {
      return;
    }

    const dialogRef = this.dialog.open(PatientDeleteDialogComponent, {
      width: '420px',
      data: { patientName: fullName || `Patient #${patientId}` },
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) {
      return;
    }

    const deleted = await this.patientsStore.remove(patientId);
    if (deleted) {
      await this.patientsStore.load();
    }
  }

  exportCsv(): void {
    const rows = this.patientsStore.rows();
    if (rows.length === 0) {
      return;
    }

    const headers = ['Patient ID', 'Full Name', 'Account Number', 'MRN', 'Status', 'Date Of Birth'];
    const lines = rows.map((row) => [
      row.patientId ?? '',
      row.fullName || `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim(),
      row.accountNumber ?? '',
      row.mrn ?? '',
      row.status ?? '',
      row.dateOfBirth ?? '',
    ]);

    const csv = [headers, ...lines]
      .map((line) => line.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'patients.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
