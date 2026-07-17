/**
 * Shared UI barrel — import everything from here:
 *
 *   import { DataTableComponent, SearchBarComponent, ... } from '@shared/ui';
 *
 * (Requires a tsconfig path alias  "@shared/ui": ["src/app/shared/ui/index.ts"])
 */

// ── Layout ────────────────────────────────────────────────────────────
export { PageHeaderComponent }     from './page-header/page-header.component';
export { ToolbarComponent }        from './toolbar/toolbar.component';
export { BreadcrumbComponent }     from './breadcrumb/breadcrumb.component';

// ── Data display ──────────────────────────────────────────────────────
export { DataTableComponent }      from './data-table/data-table.component';
export type { TableColumn, TableAction } from './data-table/data-table.component';
export { StatCardComponent }       from './stat-card/stat-card.component';
export type { StatCardTone }       from './stat-card/stat-card.component';

// ── Status indicators ─────────────────────────────────────────────────
export { StatusChipComponent }     from './status-chip/status-chip.component';
export type { StatusTone }         from './status-chip/status-chip.component';
export { StatusBadgeComponent }    from './status-badge/status-badge.component';
export type { BadgeVariant, BadgeSize } from './status-badge/status-badge.component';
export { ChipComponent }           from './chip/chip.component';
export type { ChipColor }          from './chip/chip.component';

// ── User ──────────────────────────────────────────────────────────────
export { ProfileCardComponent }    from './profile-card/profile-card.component';

// ── Search / Filters ──────────────────────────────────────────────────
export { SearchBarComponent }      from './search-bar/search-bar.component';

// ── States ────────────────────────────────────────────────────────────
export { EmptyStateComponent }     from './empty-state/empty-state.component';
export { ErrorStateComponent }     from './error-state/error-state.component';
export { NoDataComponent }         from './no-data/no-data.component';
export { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';

// ── Dialogs ───────────────────────────────────────────────────────────
export { ConfirmDialogComponent }  from './confirm-dialog/confirm-dialog.component';
export type { ConfirmDialogData }  from './confirm-dialog/confirm-dialog.component';
export { DeleteDialogComponent }   from './delete-dialog/delete-dialog.component';
export type { DeleteDialogData }   from './delete-dialog/delete-dialog.component';

// ── Form controls ─────────────────────────────────────────────────────
export { TextFieldComponent }      from './form-controls/form-controls.component';
export { SelectFieldComponent }    from './form-controls/form-controls.component';
export { DateFieldComponent }      from './form-controls/form-controls.component';
export { TextareaFieldComponent }  from './form-controls/form-controls.component';
export type { SelectOption }       from './form-controls/form-controls.component';

