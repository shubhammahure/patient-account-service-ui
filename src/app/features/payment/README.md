# Path To Payment Module

Complete frontend module for payment workflow management using Angular Material and generated Swagger APIs.

## Implemented pages

- `Payment Cases` (`/path-to-payment`)
- `Case Details` (`/path-to-payment/:caseId`)
- `Transactions` (tab)
- `Milestones` (tab)
- `Outstanding Balance` (tab)
- `Summary Dashboard` (cards)
- `Status Timeline` (tab)

## Status management

- `Payment Status` update dialog
- `Insurance Status` update dialog
- `Billing Status` update dialog
- `Financial Clearance` update dialog

## UI capabilities

- Material tables for cases, transactions, milestones
- Dialog-driven create/update actions
- Progress indicators for loading and milestone completion
- Status chips for workflow state visibility

## Files

- `src/app/features/payment/payment-cases.page.ts`
- `src/app/features/payment/payment-case-details.page.ts`
- `src/app/features/payment/payment-case-dialog.component.ts`
- `src/app/features/payment/payment-transaction-dialog.component.ts`
- `src/app/features/payment/payment-milestone-dialog.component.ts`
- `src/app/features/payment/payment-status-dialog.component.ts`
- `src/app/state/path-to-payment.store.ts`
- `src/app/core/api/generated/index.ts`

## APIs consumed

- `GET /api/v1/payment-cases`
- `POST /api/v1/payment-cases`
- `GET /api/v1/payment-cases/{caseId}`
- `GET /api/v1/payment-cases/{caseId}/summary`
- `GET /api/v1/payment-cases/{caseId}/outstanding-balance`
- `GET /api/v1/payment-cases/{caseId}/transactions`
- `POST /api/v1/payment-cases/{caseId}/transactions`
- `GET /api/v1/payment-cases/{caseId}/milestones`
- `POST /api/v1/payment-cases/{caseId}/milestones`
- `PUT /api/v1/payment-cases/{caseId}/milestones/{milestoneId}`
- `PATCH /api/v1/payment-cases/{caseId}/payment-status`
- `PATCH /api/v1/payment-cases/{caseId}/insurance-status`
- `PATCH /api/v1/payment-cases/{caseId}/billing-status`
- `PATCH /api/v1/payment-cases/{caseId}/financial-clearance`

## Manual smoke test

1. Open `/path-to-payment` and verify dashboard metrics + cases table.
2. Create a new case from `New Case` dialog.
3. Open case details from `Case Details` action.
4. Record transaction and confirm table refresh.
5. Add/update milestones and check completion progress bar.
6. Update payment/insurance/billing/financial statuses via dialogs.
7. Verify outstanding balance and status timeline tabs.

