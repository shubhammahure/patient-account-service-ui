# Patient Account Service UI

Angular 22 standalone frontend for `patient-account-service`, aligned to backend endpoints and DTO field names.

## Implemented

- Standalone Angular architecture with route-based feature slices.
- Zoneless app config (`provideExperimentalZonelessChangeDetection`) and OnPush components.
- Angular Material shell (top bar + side nav) with lightweight styling.
- NgRx SignalStore setup:
  - `AuthStore` for session and roles.
  - `PatientsStore` as core entity state blueprint.
- HTTP interceptors:
  - bearer token
  - 401 refresh retry
  - loading tracking
  - normalized errors
- Backend-aligned pages:
  - Login (`/api/v1/auth/login`)
  - Dashboard
  - Patients
  - Admissions
  - Path to Payment
  - PFE Workflow
- OpenAPI generator wiring (`@openapitools/openapi-generator-cli`).
- Containerization:
  - multi-stage `Dockerfile`
  - `nginx.conf` with SPA fallback
  - `docker-compose.yml`

## Project Structure

```text
src/app/
  core/
	api/
	guards/
	interceptors/
	models/
	services/
  features/
	auth/
	dashboard/
	patients/
	admissions/
	payment/
	pfe/
  layout/
  state/
```

## Local Run

```powershell
cd C:\Users\ShubhamMahure\Bench_Project\patient-account-service\patient-account-service-ui
npm install
npm run start:proxy
```

## Build and Test

```powershell
cd C:\Users\ShubhamMahure\Bench_Project\patient-account-service\patient-account-service-ui
npm run build
npm run test
```

## OpenAPI Client Generation

`openapi/openapi.json` is copied from backend root.

```powershell
cd C:\Users\ShubhamMahure\Bench_Project\patient-account-service\patient-account-service-ui
npm run openapi:clean
npm run openapi:generate
```

## Container

```powershell
cd C:\Users\ShubhamMahure\Bench_Project\patient-account-service\patient-account-service-ui
docker build -t patient-account-service-ui:latest .
docker compose up -d
```

For Podman, equivalent commands are supported using the same Dockerfile/compose syntax.
