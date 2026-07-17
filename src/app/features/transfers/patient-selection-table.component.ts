import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import { PatientsStore } from '../../state/patients.store';
import { StatusChipComponent, type StatusTone } from '../../shared/ui/status-chip/status-chip.component';
import { debounceTime, Subject } from 'rxjs';

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

function statusTone(status: string | undefined): StatusTone {
  const map: Record<string, StatusTone> = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DECEASED: 'error',
    MERGED: 'neutral',
    ADMITTED: 'active',
    IN_TRANSFER: 'pending',
    DISCHARGED: 'neutral',
    CANCELLED: 'error',
  };

  return status && map[status] ? map[status] : 'neutral';
}

@Component({
  selector: 'app-patient-selection-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    StatusChipComponent,
  ],
  template: `
    <div class="patient-selection-wrapper">
      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filter-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search Patients</mat-label>
            <input
              matInput
              placeholder="Name, MRN, or ID"
              (keyup)="onSearchChange($event)"
              [value]="searchQuery()">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Patient Status</mat-label>
            <mat-select (selectionChange)="onStatusChange($event.value)" [value]="statusFilter()">
              <mat-option value="">All Statuses</mat-option>
              <mat-option value="ACTIVE">Active</mat-option>
              <mat-option value="INACTIVE">Inactive</mat-option>
              <mat-option value="DECEASED">Deceased</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Admission Status</mat-label>
            <mat-select (selectionChange)="onAdmissionStatusChange($event.value)" [value]="admissionStatusFilter()">
              <mat-option value="">All Admission Status</mat-option>
              <mat-option value="ADMITTED">Admitted</mat-option>
              <mat-option value="IN_TRANSFER">In Transfer</mat-option>
              <mat-option value="DISCHARGED">Discharged</mat-option>
            </mat-select>
          </mat-form-field>

          <button
            mat-stroked-button
            (click)="clearFilters()"
            class="clear-btn">
            <mat-icon>clear_all</mat-icon>
            Clear Filters
          </button>
        </div>

        <div class="selection-info">
          <span *ngIf="selection.selected.length > 0" class="selected-count">
            {{ selection.selected.length }} patient(s) selected
          </span>
          <span *ngIf="selection.selected.length === 0" class="no-selection">
            Select patients to transfer
          </span>
          <button
            *ngIf="selection.selected.length > 0"
            mat-icon-button
            (click)="selection.clear()"
            matTooltip="Deselect All">
            <mat-icon>clear</mat-icon>
          </button>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-wrapper">
        <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSortChange($event)">
          <!-- Checkbox Column -->
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox
                [checked]="selection.hasValue() && isAllSelected()"
                [indeterminate]="selection.hasValue() && !isAllSelected()"
                (change)="$event ? masterToggle() : null">
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row">
              <mat-checkbox
                [checked]="selection.isSelected(row)"
                (change)="$event ? toggleSelection(row) : null">
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- Patient Name Column -->
          <ng-container matColumnDef="fullName">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let row">
              <strong>{{ row.fullName }}</strong>
            </td>
          </ng-container>

          <!-- MRN Column -->
          <ng-container matColumnDef="mrn">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>MRN</th>
            <td mat-cell *matCellDef="let row">
              {{ row.mrn || 'N/A' }}
            </td>
          </ng-container>

          <!-- Patient ID Column -->
          <ng-container matColumnDef="patientId">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Patient ID</th>
            <td mat-cell *matCellDef="let row">
              #{{ row.patientId }}
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let row">
              <app-status-chip [label]="row.status" [tone]="statusTone(row.status)"></app-status-chip>
            </td>
          </ng-container>

          <!-- Admission Status Column -->
          <ng-container matColumnDef="admissionStatus">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Admission</th>
            <td mat-cell *matCellDef="let row">
              <app-status-chip
                *ngIf="row.admissionStatus"
                [label]="row.admissionStatus"
                [tone]="statusTone(row.admissionStatus)">
              </app-status-chip>
              <span *ngIf="!row.admissionStatus" class="no-data">Not Admitted</span>
            </td>
          </ng-container>

          <!-- Current Ward Column -->
          <ng-container matColumnDef="currentWard">
            <th mat-header-cell *matHeaderCellDef>Current Ward</th>
            <td mat-cell *matCellDef="let row">
              {{ row.currentWard || 'N/A' }}
            </td>
          </ng-container>

          <!-- Header Row -->
          <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>

          <!-- Data Rows -->
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns;"
            [class.selected]="selection.isSelected(row)"
            (click)="toggleSelection(row)"
            class="patient-row">
          </tr>

          <!-- No Data Row -->
          <tr *matNoDataRow class="no-data-row">
            <td [colSpan]="displayedColumns.length" class="no-data-cell">
              <div class="empty-state">
                <mat-icon>people_outline</mat-icon>
                <p>{{ isLoading() ? 'Loading patients...' : 'No patients found' }}</p>
                <p class="hint" *ngIf="!isLoading()">Try adjusting your search or filters</p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Paginator -->
        <mat-paginator
          [pageSizeOptions]="[5, 10, 20, 50]"
          [pageSize]="pageSize()"
          [length]="totalElements()"
          (page)="onPageChange($event)"
          [showFirstLastButtons]="true">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .patient-selection-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .filters-section {
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }

    .filter-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        flex-direction: column;

        mat-form-field {
          width: 100%;
        }
      }
    }

    .search-field {
      flex: 1 1 300px;
      min-width: 300px;
    }

    .filter-field {
      flex: 0 1 200px;
      min-width: 150px;
    }

    .clear-btn {
      align-self: center;
      white-space: nowrap;

      mat-icon {
        margin-right: 8px;
      }
    }

    .selection-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-top: 1px solid #e0e0e0;
      font-size: 13px;
      font-weight: 500;

      .selected-count {
        color: #3f51b5;
        font-weight: 600;
      }

      .no-selection {
        color: #999;
      }

      button {
        margin-left: auto;
      }
    }

    .table-wrapper {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    table {
      width: 100%;

      th {
        background-color: #f5f5f5;
        font-weight: 600;
        color: #212121;
        border-bottom: 2px solid #e0e0e0;
      }

      td {
        padding: 16px;
        border-bottom: 1px solid #f0f0f0;
      }
    }

    .patient-row {
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: #f9f9f9;
      }

      &.selected {
        background-color: #e3f2fd;
      }
    }

    .no-data-row {
      height: 300px;

      .no-data-cell {
        padding: 0 !important;
        text-align: center;
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.3;
      }

      p {
        margin: 8px 0;
        font-size: 14px;

        &.hint {
          font-size: 12px;
          color: #bbb;
        }
      }
    }

    .no-data {
      color: #999;
      font-style: italic;
    }

    mat-paginator {
      border-top: 1px solid #e0e0e0;
    }

    ::ng-deep {
      .mat-mdc-header-cell {
        padding: 16px;
      }

      .mat-mdc-paginator {
        background-color: #f9f9f9;
      }
    }
  `],
})
export class PatientSelectionTableComponent implements OnInit {
  @Output() patientsSelected = new EventEmitter<PatientWithAdmission[]>();

  private readonly patientsStore = inject(PatientsStore);
  private readonly searchSubject = new Subject<string>();

  readonly displayedColumns = [
    'select',
    'fullName',
    'mrn',
    'patientId',
    'status',
    'admissionStatus',
    'currentWard',
  ];

  readonly searchQuery = signal('');
  readonly statusFilter = signal('');
  readonly admissionStatusFilter = signal('');
  readonly pageSize = signal(10);
  readonly isLoading = this.patientsStore.isLoading;
  readonly totalElements = this.patientsStore.totalElements;

  dataSource = new MatTableDataSource<PatientWithAdmission>([]);
  selection = new SelectionModel<PatientWithAdmission>(true, []);

  ngOnInit(): void {
    this.loadPatients();

    this.searchSubject
      .pipe(debounceTime(300))
      .subscribe((query) => {
        this.searchQuery.set(query);
        this.patientsStore.setFilters(query, this.statusFilter());
      });

    effect(() => {
      const patients = this.patientsStore.rows();
      this.dataSource.data = patients as PatientWithAdmission[];
      this.emitSelectedPatients();
    });

    this.selection.changed.subscribe(() => {
      this.emitSelectedPatients();
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onStatusChange(status: string): void {
    this.statusFilter.set(status);
    this.patientsStore.setFilters(this.searchQuery(), status);
  }

  onAdmissionStatusChange(status: string): void {
    this.admissionStatusFilter.set(status);
  }

  onSortChange(sort: Sort): void {
    const direction = sort.direction as 'asc' | 'desc' | '';
    if (direction) {
      this.patientsStore.setSort(sort.active, direction);
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.patientsStore.setPage(event.pageIndex, event.pageSize);
  }

  masterToggle(): void {
    const filteredData = this.dataSource.filteredData;
    this.isAllSelected()
      ? this.selection.clear()
      : this.selection.select(...filteredData);
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.filteredData.length;
    return numSelected === numRows && numRows > 0;
  }

  toggleSelection(row: PatientWithAdmission): void {
    this.selection.toggle(row);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('');
    this.admissionStatusFilter.set('');
    this.patientsStore.setFilters('', '');
  }

  private loadPatients(): void {
    this.patientsStore.load();
  }

  private emitSelectedPatients(): void {
    this.patientsSelected.emit(this.selection.selected);
  }

  statusTone = statusTone;
}






