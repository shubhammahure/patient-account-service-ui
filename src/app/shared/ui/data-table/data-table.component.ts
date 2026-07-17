import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  sortable?: boolean;
  /** Optional custom renderer passed via ng-content slot match */
  cellTemplate?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (row: T) => string;
}

export interface TableAction<T = Record<string, unknown>> {
  icon: string;
  label: string;
  color?: 'primary' | 'warn' | 'accent' | '';
  disabled?: (row: T) => boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  template: `
    @if (loading) {
      <mat-progress-bar mode="indeterminate" class="table-loading-bar"></mat-progress-bar>
    }

    <div class="table-wrapper" [class.table-wrapper--scrollable]="scrollable">
      <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSort($event)"
             class="data-table" [class.data-table--striped]="striped">

        @for (col of columns; track col.key) {
          <ng-container [matColumnDef]="col.key">
            <th mat-header-cell *matHeaderCellDef
                [mat-sort-header]="col.sortable ? col.key : ''"
                [disabled]="!col.sortable"
                [style.width]="col.width || 'auto'"
                [class.cell--center]="col.align === 'center'"
                [class.cell--right]="col.align === 'right'">
              {{ col.header }}
            </th>
            <td mat-cell *matCellDef="let row"
                [class.cell--center]="col.align === 'center'"
                [class.cell--right]="col.align === 'right'">
              {{ col.format ? col.format(row) : row[col.key] }}
            </td>
          </ng-container>
        }

        @if (actions.length > 0) {
          <ng-container matColumnDef="_actions">
            <th mat-header-cell *matHeaderCellDef class="cell--actions">Actions</th>
            <td mat-cell *matCellDef="let row" class="cell--actions">
              @for (action of actions; track action.label) {
                <button mat-icon-button
                        [color]="action.color || ''"
                        [matTooltip]="action.label"
                        [disabled]="action.disabled ? action.disabled(row) : false"
                        (click)="actionClicked.emit({ action: action.label, row })">
                  <mat-icon>{{ action.icon }}</mat-icon>
                </button>
              }
            </td>
          </ng-container>
        }

        <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: stickyHeader"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"
            [class.row--clickable]="rowClickable"
            (click)="rowClickable && rowClick.emit(row)"></tr>

        <tr *matNoDataRow>
          <td [colSpan]="displayedColumns.length" class="no-data-cell">
            <div class="no-data">
              <mat-icon>search_off</mat-icon>
              <span>{{ noDataText }}</span>
            </div>
          </td>
        </tr>
      </table>
    </div>

    @if (showPaginator) {
      <mat-paginator
        [length]="totalItems"
        [pageSize]="pageSize"
        [pageIndex]="pageIndex"
        [pageSizeOptions]="pageSizeOptions"
        (page)="onPage($event)"
        [showFirstLastButtons]="true">
      </mat-paginator>
    }
  `,
  styles: [`
    :host { display: block; }

    .table-loading-bar { margin-bottom: 2px; }

    .table-wrapper {
      overflow-x: auto;
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-lg);
      background: var(--clr-surface);
      box-shadow: var(--shadow-sm);
    }

    .table-wrapper--scrollable { max-height: 520px; overflow-y: auto; }

    .data-table { width: 100%; }

    .data-table--striped tr:nth-child(even) td { background: var(--clr-surface-2); }

    th.mat-header-cell {
      background: var(--clr-surface-2);
      color: var(--clr-text-2);
      font-size: 0.74rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    td.mat-cell { font-size: 0.875rem; color: var(--clr-text); }

    th.mat-header-cell, td.mat-cell { padding: 0.6rem 0.85rem !important; }

    .cell--center { text-align: center !important; }
    .cell--right  { text-align: right  !important; }
    .cell--actions { white-space: nowrap; width: 1%; }

    .row--clickable { cursor: pointer; }
    .row--clickable:hover td { background: rgba(21, 101, 192, 0.04); }

    .no-data-cell { text-align: center; }
    .no-data {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 2rem;
      color: var(--clr-text-2);
    }
    .no-data mat-icon { font-size: 20px; }
  `],
})
export class DataTableComponent<T extends Record<string, unknown> = Record<string, unknown>> implements OnInit {
  @Input() columns: TableColumn<T>[] = [];
  @Input() actions: TableAction<T>[] = [];
  @Input() loading = false;
  @Input() striped = true;
  @Input() stickyHeader = true;
  @Input() scrollable = false;
  @Input() rowClickable = false;
  @Input() showPaginator = true;
  @Input() totalItems = 0;
  @Input() pageSize = 20;
  @Input() pageIndex = 0;
  @Input() pageSizeOptions = [10, 20, 50, 100];
  @Input() noDataText = 'No records found.';

  @Input() set rows(data: T[]) {
    this.dataSource.data = data;
  }

  @Output() readonly sortChange = new EventEmitter<Sort>();
  @Output() readonly pageChange = new EventEmitter<PageEvent>();
  @Output() readonly rowClick = new EventEmitter<T>();
  @Output() readonly actionClicked = new EventEmitter<{ action: string; row: T }>();

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  readonly dataSource = new MatTableDataSource<T>();

  get displayedColumns(): string[] {
    const cols = this.columns.map((c) => c.key);
    return this.actions.length ? [...cols, '_actions'] : cols;
  }

  ngOnInit(): void {}

  onSort(sort: Sort): void {
    this.sortChange.emit(sort);
  }

  onPage(event: PageEvent): void {
    this.pageChange.emit(event);
  }
}


