# Bulk Transfer Feature

This module provides a comprehensive bulk patient transfer workflow with a step-by-step wizard interface.

## Overview

The Bulk Transfer feature allows medical staff to transfer multiple patients from one ward/facility to another in a single transactional operation. The workflow includes:

1. **Patient Selection** - Search, filter, and select multiple patients
2. **Transfer Details** - Specify source/destination wards and transfer reason
3. **Review & Confirm** - Review transfer summary before execution
4. **Progress Tracking** - Monitor transfer progress with real-time updates

## Components

### `BulkTransferPageComponent`
Main page component that orchestrates the entire bulk transfer workflow.

**Features:**
- Material Stepper with 4 steps
- Linear workflow validation
- Progress indicator with percentage
- Result summary and batch ID tracking
- Reset and new transfer actions

**Usage:**
```typescript
import { BulkTransferPageComponent } from './bulk-transfer.page';
// Lazy loaded via routes
```

### `PatientSelectionTableComponent`
Interactive table for selecting patients with advanced filtering capabilities.

**Features:**
- Search by name, MRN, or patient ID
- Filter by patient status (Active, Inactive, Deceased)
- Filter by admission status (Admitted, In Transfer, Discharged)
- Multi-select with select all/deselect all functionality
- Pagination with configurable page size
- Sorting by any column
- Real-time selection count

**Inputs:**
- None (uses PatientsStore internally)

**Outputs:**
- `patientsSelected: EventEmitter<PatientWithAdmission[]>` - Emits when selection changes

### `TransferFormComponent`
Form for entering transfer details with validation.

**Features:**
- Current ward display (read-only)
- Destination ward input (required)
- Department selector
- Optional bed assignment
- Transfer reason with character limit
- Form validation with error messages
- Visual feedback for invalid fields

**Inputs:**
- `formGroup: FormGroup` - Form control group
- `selectedPatientCount: number` - Number of selected patients

### `TransferConfirmationDialogComponent`
Modal dialog to confirm before executing bulk transfer.

**Features:**
- Summary of transfer details
- Patient count confirmation
- Pre-transfer checklist
- Ward capacity reminder
- Authorization confirmation
- Cancel/Confirm actions

**Dialog Data:**
```typescript
{
  patientCount: number;
  transferDetails: {
    currentWard: string;
    destinationWard: string;
    destinationDepartmentId: string;
    transferReason: string;
  };
}
```

### `TransferSummaryComponent`
Displays a comprehensive summary of the transfer before confirmation.

**Features:**
- Transfer configuration display
- Patient list with details
- Status indicators for each patient
- MRN and ward information
- Transfer statistics
- Confirmation note

**Inputs:**
- `selectedPatients: PatientWithAdmission[]` - Array of selected patients
- `transferDetails: TransferDetails` - Transfer configuration details

## State Management

### `TransfersStore`
Angular service managing the bulk transfer state.

**State:**
- `selectedPatients` - Array of selected patients
- `isProcessing` - Boolean indicating if transfer is in progress
- `transferResult` - Result object with batch ID and counts
- `currentProgress` - Number of patients processed

**Methods:**
- `setSelectedPatients(patients)` - Update selected patients
- `performBulkTransfer(request)` - Execute bulk transfer API call
- `reset()` - Clear all state

## Data Models

```typescript
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

interface TransferRequest {
  currentWard: string;
  destinationWard: string;
  destinationDepartmentId: string;
  destinationBedId?: string;
  transferReason: string;
}

interface TransferResult {
  transferBatchId: number;
  status: string;
  totalRequested: number;
  totalTransferred: number;
  totalFailed: number;
}
```

## Usage Example

The component is lazy-loaded via the routing configuration:

```typescript
{
  path: 'transfers',
  canActivate: [roleGuard],
  data: { roles: ['ADMIN', 'DOCTOR', 'REGISTRAR'] },
  loadComponent: () =>
    import('./features/transfers/bulk-transfer.page').then(
      (m) => m.BulkTransferPageComponent
    ),
}
```

Navigate to `/transfers` to access the bulk transfer workflow.

## API Integration

### Backend Endpoint

The component integrates with:
- `POST /api/v1/transfers/bulk` - Execute bulk patient transfer

**Request Payload:**
```json
{
  "patientIds": [101, 102, 103],
  "currentWard": "ICU",
  "destinationWard": "Ward-B",
  "destinationDepartmentId": "1",
  "destinationBedId": "B-101",
  "transferReason": "Patient recovery and bed optimization"
}
```

**Response:**
```json
{
  "timestamp": "2026-07-13T18:20:00Z",
  "success": true,
  "message": "Bulk transfer completed successfully",
  "data": {
    "transferBatchId": 901,
    "status": "COMPLETED",
    "totalRequested": 3,
    "totalTransferred": 3,
    "totalFailed": 0
  }
}
```

## Material Components Used

- MatStepperModule - Step-by-step workflow
- MatFormFieldModule - Form inputs
- MatInputModule - Text input fields
- MatSelectModule - Dropdown selections
- MatButtonModule - Action buttons
- MatIconModule - Icons throughout UI
- MatTableModule - Patient selection table
- MatCheckboxModule - Multi-select checkboxes
- MatPaginatorModule - Table pagination
- MatSortModule - Column sorting
- MatProgressBarModule - Progress indicator
- MatProgressSpinnerModule - Loading spinner
- MatDialogModule - Confirmation dialog
- MatCardModule - Card containers
- MatDividerModule - Visual separators
- MatChipsModule - Status chips
- MatTooltipModule - Helpful tooltips

## Styling

All components use Angular Material theming and include:
- Responsive design with media queries
- Accessibility features (ARIA labels, keyboard navigation)
- Custom status colors based on patient/admission status
- Material Design color palette
- Smooth transitions and animations

## Key Features

1. **Advanced Search & Filter**
   - Real-time search with debouncing
   - Multiple filter options
   - Clear filters button

2. **Flexible Selection**
   - Select/deselect individual patients
   - Select all visible patients
   - Deselect all
   - Multi-select across pages

3. **Step-by-Step Wizard**
   - Linear workflow with validation
   - Ability to go back and edit
   - Step indicators with icons
   - Progress tracking

4. **Comprehensive Confirmation**
   - Detailed transfer summary
   - Patient list review
   - Department and bed assignment
   - Transfer reason confirmation

5. **Real-time Progress**
   - Progress bar with percentage
   - Patient processing count
   - Success/failure statistics
   - Batch ID tracking

6. **Error Handling**
   - Form validation with error messages
   - API error handling
   - User-friendly notifications via snack bar

## File Structure

```
src/app/features/transfers/
├── bulk-transfer.page.ts
├── patient-selection-table.component.ts
├── transfer-form.component.ts
├── transfer-confirmation-dialog.component.ts
├── transfer-summary.component.ts
└── README.md

src/app/state/
└── transfers.store.ts
```

## Development Notes

- All components are standalone and use OnPush change detection for performance
- State is managed via signals and a reactive store
- Material Design guidelines are followed throughout
- Components are fully responsive and work on mobile devices
- Form validation is implemented at the component and field level
- API calls are simulated in the store; replace with actual HTTP calls as needed

## Future Enhancements

- Support for scheduled transfers (defer transfer to a specific time)
- Batch transfer history and audit trail
- Transfer templates for common scenarios
- Email notifications to destination ward staff
- Real-time capacity checking
- Integration with bed management system
- Custom transfer reason templates

