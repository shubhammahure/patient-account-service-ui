# Patient Account Service UI - Backend Alignment Task Plan

## Verdict

The provided `feprompt.md` is directionally strong, but it is **not fully aligned** with backend reality yet.

Main issue: some OpenAPI examples and field names differ from actual DTO/controller contracts.

## Critical alignment corrections (must do first)

1. Use canonical auth paths only:
   - `POST /api/v1/auth/login`
   - `POST /api/v1/auth/token/refresh`
   - `GET /api/v1/auth/me`
   - Do not use legacy duplicates `/login`, `/register`, `/token/refresh` in UI flows.
2. Fix request payloads to backend DTO fields:
   - Patient create/update uses `gender`, `phoneNumber`, `accountNumber` (required), not `genderCode`/`phone`.
   - Admission admit uses `facilityId`, `departmentId`, `bedId`, `admissionDate`, `admissionNumber`, `doctor`.
   - Discharge uses `dischargeDate` (not `dischargedAt`).
   - PFE submit requires `comment`; do not rely on `estimatedAmount`/`currencyCode` examples.
3. Role handling:
   - Read roles from `/api/v1/auth/me` (`ROLE_ADMIN`, `ROLE_REGISTRAR`, etc.).
   - Gate navigation/actions by role in UI.
4. Patient search query:
   - Send flat query params for `@ModelAttribute` criteria (`search`, `status`, `mrn`, etc.), plus paging/sort params.
5. CORS/dev proxy:
   - Prefer Angular dev proxy for local development to avoid browser CORS friction.

---

## Full frontend execution checklist

### Phase 0 - Foundation
- [ ] Create Angular 22 app in `patient-account-service-ui/` using standalone APIs only.
- [ ] Enable zoneless setup and OnPush defaults.
- [ ] Add Angular Material theme (clean enterprise style, minimal animation).
- [ ] Add SCSS architecture: `styles/_tokens.scss`, `styles/_theme.scss`, `styles/_layout.scss`, `styles/_tables.scss`.

### Phase 1 - API contract hardening
- [ ] Keep `openapi.json` in `patient-account-service-ui/openapi/openapi.json`.
- [ ] Add generator script (`@openapitools/openapi-generator-cli`) for TS Angular client output.
- [ ] Post-generation patch task for known schema/example drift (documented mapping file).
- [ ] Add typed API facade layer (`core/api-facade/*`) to hide generated client quirks.

### Phase 2 - App shell and security
- [ ] Build layout shell: sidebar, topbar, content region, route outlet.
- [ ] Implement auth signal store: token/refresh token/profile/roles.
- [ ] Add HTTP interceptor chain:
  - [ ] Bearer token injection
  - [ ] 401 refresh + retry once
  - [ ] global API error normalization
  - [ ] request loading indicator
- [ ] Implement route guards (auth + role guard).

### Phase 3 - Feature modules (Standalone feature slices)
- [ ] Dashboard:
  - [ ] health status widget (`/api/v1/health`)
  - [ ] recent patients and payment cases summary
- [ ] Patients:
  - [ ] search table with pagination/sort
  - [ ] register patient form (correct payload)
  - [ ] edit + soft delete flows
  - [ ] bulk upload (`multipart/form-data`)
- [ ] Admissions:
  - [ ] admit form
  - [ ] discharge form
  - [ ] admission detail lookup
- [ ] Path to Payment:
  - [ ] case list/create
  - [ ] transaction list/create
  - [ ] milestone list/create/update
  - [ ] status patch actions (payment/insurance/financial-clearance/billing)
- [ ] PFE Workflow:
  - [ ] submit
  - [ ] review/approve/reject
  - [ ] history timeline

### Phase 4 - State management
- [ ] Use NgRx SignalStore by domain:
  - [ ] `auth.store.ts`
  - [ ] `patients.store.ts`
  - [ ] `admissions.store.ts`
  - [ ] `payment-cases.store.ts`
  - [ ] `pfe.store.ts`
- [ ] Keep server data cache strategy explicit (query params in state + last request metadata).
- [ ] Implement optimistic updates only for safe local edits; otherwise server-truth updates.

### Phase 5 - UX and reliability
- [ ] Error banner + field-level API validation display (`details[]`).
- [ ] Skeleton loading states (table and form).
- [ ] Empty states and retry actions.
- [ ] Accessibility pass (focus order, ARIA labels, color contrast).

### Phase 6 - Containerization and local deployment
- [ ] Multi-stage `Dockerfile`:
  - [ ] Build in Node image
  - [ ] Serve with nginx alpine
  - [ ] non-root runtime user
- [ ] `nginx.conf`:
  - [ ] SPA fallback to `index.html`
  - [ ] cache static assets
- [ ] `docker-compose.yml`:
  - [ ] frontend service
  - [ ] configurable backend URL env
  - [ ] same network as backend containers for local podman/rancher usage

### Phase 7 - Quality gates
- [ ] Unit tests for stores/facades/interceptors.
- [ ] API contract tests with mock responses from OpenAPI examples + corrected payload snapshots.
- [ ] E2E smoke suite: login -> patient create -> admission -> payment case -> PFE transition.
- [ ] CI pipeline: lint, test, build, container build.

---

## Backend-correct payload cheatsheet (for frontend devs)

### Register Patient (`POST /api/v1/patients`)
Required: `accountNumber`, `firstName`, `lastName`, `dateOfBirth`, `gender`
Optional: `mrn`, `middleName`, `phoneNumber`, `email`, `ssnLast4`, `status`, `statusReason`

### Admit Patient (`POST /api/v1/admissions/admit`)
Required: `patientId`, `facilityId`, `departmentId`, `admissionNumber`, `admissionType`, `doctor`, `admissionDate`, `reason`
Optional: `bedId`, `ward`, `room`

### Discharge (`POST /api/v1/admissions/{admissionId}/discharge`)
Required: `dischargeDate`, `reason`, `disposition`
Optional: `summary`

### Submit PFE (`POST /api/v1/pfe/workflow/submit`)
Required: `patientId`, `comment`
Optional: `admissionId`, `caseReference`, `workflowStage`, `priority`, `ownerUser`

---

## Suggested first sprint scope (10 working days)

- [ ] App shell + auth + interceptors + guards
- [ ] Dashboard
- [ ] Patients search/create
- [ ] Admissions admit/discharge
- [ ] Containerization files + local compose run
- [ ] Smoke E2E for login and patient creation

This scope gives a usable hospital-portal baseline and de-risks backend integration early.

