# Patient Module

This module implements complete patient management using Swagger-aligned API clients from `src/app/core/api/generated`.

## Pages

- `patients.page.ts` - Patient List, Search, Server Filtering, Sorting, Pagination, CSV Export, Delete Dialog
- `patient-details.page.ts` - Patient Details with Profile Card and Timeline
- `patient-register.page.ts` - Register Patient with form validation
- `patient-edit.page.ts` - Edit Patient with form validation

## Components

- `patient-form.component.ts` - shared reactive form for register/edit
- `patient-delete-dialog.component.ts` - confirmation dialog for delete

## Store

- `src/app/state/patients.store.ts` handles server-side query state and CRUD operations.

## API Methods Used

- `searchPatients`
- `getPatient`
- `registerPatient`
- `updatePatient`
- `deletePatient`

