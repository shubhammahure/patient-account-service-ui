# Shared UI Component Library

All reusable UI components live in `src/app/shared/ui/`.

## Import

```typescript
// Via barrel (tsconfig alias)
import {
  DataTableComponent,
  SearchBarComponent,
  ConfirmDialogComponent,
  ...
} from '@shared/ui';

// Via service barrel
import { SnackbarService } from '@shared/services';
```

---

## DataTableComponent `<app-data-table>`

Generic Material table with column config, pagination, sort, row click, and action buttons.

```typescript
columns: TableColumn[] = [
  { key: 'id',   header: 'ID',   sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'status', header: 'Status', format: (row) => row.status ?? 'N/A' },
];

actions: TableAction[] = [
  { icon: 'edit',   label: 'Edit',   color: 'primary' },
  { icon: 'delete', label: 'Delete', color: 'warn' },
];
```

```html
<app-data-table
  [columns]="columns"
  [rows]="rows"
  [actions]="actions"
  [loading]="isLoading"
  [totalItems]="totalElements"
  [pageSize]="20"
  (sortChange)="onSort($event)"
  (pageChange)="onPage($event)"
  (actionClicked)="onAction($event)">
</app-data-table>
```

---

## SearchBarComponent `<app-search-bar>`

Debounced search with clear button.

```html
<app-search-bar
  placeholder="Search patients…"
  [fullWidth]="true"
  [debounceMs]="350"
  (searchChange)="applyFilter($event)">
</app-search-bar>
```

---

## ConfirmDialogComponent

```typescript
const data: ConfirmDialogData = {
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  confirmLabel: 'Yes, continue',
  cancelLabel: 'Cancel',
  confirmColor: 'primary',
  icon: 'help_outline',
};

const ref = this.dialog.open(ConfirmDialogComponent, { width: '480px', data });
const confirmed = await firstValueFrom(ref.afterClosed()); // boolean
```

---

## DeleteDialogComponent

```typescript
const data: DeleteDialogData = {
  entityName: 'Patient',
  entityLabel: 'John Doe',
  warningMessage: 'This will also delete related admissions.',
};

const ref = this.dialog.open(DeleteDialogComponent, { width: '440px', data });
const confirmed = await firstValueFrom(ref.afterClosed()); // boolean
```

---

## LoadingSpinnerComponent `<app-loading-spinner>`

```html
<!-- Inline centred spinner -->
<app-loading-spinner message="Loading patients…"></app-loading-spinner>

<!-- Full-panel overlay spinner -->
<div style="position: relative;">
  <app-loading-spinner [overlay]="true" message="Saving…"></app-loading-spinner>
</div>

<!-- Progress bar with message -->
<app-loading-spinner mode="bar" message="Uploading file…"></app-loading-spinner>
```

---

## EmptyStateComponent `<app-empty-state>`

```html
<app-empty-state
  icon="people_off"
  title="No patients found"
  description="Adjust your search filters or register a new patient."
  actionLabel="Register Patient"
  actionIcon="person_add"
  (action)="registerPatient()">
</app-empty-state>
```

---

## ErrorStateComponent `<app-error-state>`

```html
<!-- Full page error -->
<app-error-state
  title="Failed to load"
  message="Could not reach the server. Check your connection."
  (retry)="reload()">
</app-error-state>

<!-- Inline banner error -->
<app-error-state [inline]="true" message="Invalid patient ID." [retryLabel]="''"></app-error-state>
```

---

## NoDataComponent `<app-no-data>`

Place as a table footer or standalone:

```html
@if (rows.length === 0 && !loading) {
  <app-no-data message="No transfer records match your filter."></app-no-data>
}
```

---

## SnackbarService

```typescript
private readonly snack = inject(SnackbarService);

this.snack.success('Patient registered successfully.');
this.snack.error('Upload failed. Please retry.');
this.snack.info('Session expires in 5 minutes.');
this.snack.warning('File size exceeds recommended limit.');
```

---

## ToolbarComponent `<app-toolbar>`

```typescript
actions: ToolbarAction[] = [
  { icon: 'refresh', label: 'Refresh', variant: 'icon' },
  { icon: 'download', label: 'Export CSV', variant: 'stroked' },
  { icon: 'add', label: 'New Case', variant: 'flat', color: 'primary' },
];
```

```html
<app-toolbar
  title="Payment Cases"
  backIcon="arrow_back"
  [actions]="actions"
  (back)="router.back()"
  (actionClick)="onToolbarAction($event)">
</app-toolbar>
```

---

## BreadcrumbComponent `<app-breadcrumb>`

Automatically reads from `BreadcrumbService` — just place in your layout:

```html
<app-breadcrumb></app-breadcrumb>
```

---

## ProfileCardComponent `<app-profile-card>`

```html
<app-profile-card
  name="Dr. Jane Smith"
  role="ADMIN"
  email="jane@hospital.org"
  [showBadge]="true"
  badgeLabel="Active">
</app-profile-card>

<!-- Compact (sidebar menu) -->
<app-profile-card name="Jane Smith" role="BILLING" [compact]="true"></app-profile-card>
```

---

## PageHeaderComponent `<app-page-header>`

```html
<app-page-header
  title="Patients"
  subtitle="Search and manage patient records."
  icon="people"
  [bordered]="true">
  <button mat-flat-button color="primary">New Patient</button>
</app-page-header>
```

---

## StatusBadgeComponent `<app-status-badge>`

```html
<app-status-badge label="Active"   color="success"  variant="soft"     [dot]="true"></app-status-badge>
<app-status-badge label="Overdue"  color="error"    variant="filled"></app-status-badge>
<app-status-badge label="Pending"  color="warning"  variant="outlined"></app-status-badge>
<app-status-badge label="Primary"  color="primary"  size="lg"></app-status-badge>
```

---

## ChipComponent `<app-chip>`

```html
<app-chip label="ADMIN"    color="primary"></app-chip>
<app-chip label="Billing"  color="teal"></app-chip>
<app-chip label="Urgent"   color="error"   icon="priority_high"></app-chip>
<app-chip label="Tag"      color="purple"  [removable]="true" (removed)="removeTag()"></app-chip>
```

---

## Reusable Form Controls (ControlValueAccessor)

```html
<!-- Reactive -->
<form [formGroup]="form">
  <app-text-field     label="First Name *"  formControlName="firstName" prefixIcon="person"></app-text-field>
  <app-text-field     label="Email"         formControlName="email"     type="email"></app-text-field>
  <app-text-field     label="Password"      formControlName="password"  type="password"></app-text-field>
  <app-select-field   label="Priority"      formControlName="priority"  [options]="priorityOptions"></app-select-field>
  <app-date-field     label="Due Date"      formControlName="dueDate"></app-date-field>
  <app-textarea-field label="Notes"         formControlName="notes"     [rows]="4"></app-textarea-field>
</form>
```

```typescript
priorityOptions: SelectOption[] = [
  { label: 'Low',    value: 'LOW' },
  { label: 'Normal', value: 'NORMAL' },
  { label: 'High',   value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];
```

---

## StatusChipComponent `<app-status-chip>` (existing, enhanced)

```html
<app-status-chip label="Active"    tone="active"></app-status-chip>
<app-status-chip label="Inactive"  tone="inactive"></app-status-chip>
<app-status-chip label="Pending"   tone="pending"></app-status-chip>
<app-status-chip label="Done"      tone="completed"></app-status-chip>
<app-status-chip label="Error"     tone="error"></app-status-chip>
<app-status-chip label="Unknown"   tone="neutral"></app-status-chip>
```

