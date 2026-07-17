# PFE Workflow Module

This module implements the complete Patient Financial Estimate workflow UI with Angular Material and Swagger-generated APIs.

## Implemented screens

- Submit
- Review
- Approve (with confirmation dialog)
- Reject / Deny
- History (timeline + audit table)
- Comments stream
- Workflow status stepper and summary cards

## Key files

- `src/app/features/pfe/pfe-workflow.page.ts`
- `src/app/features/pfe/pfe-approval-dialog.component.ts`
- `src/app/features/pfe/pfe-timeline.component.ts`
- `src/app/state/pfe-workflow.store.ts`
- `src/app/core/api/generated/index.ts`

## API endpoints consumed

- `POST /api/v1/pfe/workflow/submit`
- `POST /api/v1/pfe/workflow/{caseId}/review`
- `POST /api/v1/pfe/workflow/{caseId}/approve`
- `POST /api/v1/pfe/workflow/{caseId}/reject`
- `GET /api/v1/pfe/workflow/{caseId}/history`

## Manual smoke test checklist

1. Submit a new case from the **Submit** tab.
2. Move case to **Review** from the **Review** tab.
3. Approve case from **Approve** tab and verify dialog comment is saved.
4. Reject or deny case from **Reject** tab.
5. Open **History** tab and verify timeline, comments, and audit table are updated.

