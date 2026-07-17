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
- Generated API layer wired directly into Angular features/stores via `src/app/core/api/generated`.
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
npm run api:generate
```

`npm run api:generate` regenerates:
- API clients/services
- models
- enums
- interfaces

## Container

```powershell
cd C:\Users\ShubhamMahure\Bench_Project\patient-account-service\patient-account-service-ui
copy .env.example .env
docker compose --profile prod up -d --build
```

### Development Container (Angular dev server + proxy)

```powershell
cd C:\Users\ShubhamMahure\Bench_Project\patient-account-service\patient-account-service-ui
copy .env.example .env
docker compose --profile dev up --build
```

### Podman Compatibility

The same compose file is Podman-compatible.

```powershell
cd C:\Users\ShubhamMahure\Bench_Project\patient-account-service\patient-account-service-ui
copy .env.example .env
podman compose --profile prod up -d --build
```

### Rancher Desktop Compatibility

Use Rancher override compose file (`docker-compose.rancher-desktop.yml`) so host aliases resolve in both Moby and containerd modes.

#### Rancher Desktop (Moby engine)

```powershell
cd C:\Users\ShubhamMahure\Bench_Project\patient-account-service\patient-account-service-ui
copy .env.example .env
# Recommended for Rancher Desktop:
# BACKEND_URL=http://host.rancher-desktop.internal:8080
docker compose -f docker-compose.yml -f docker-compose.rancher-desktop.yml --profile dev up --build
docker compose -f docker-compose.yml -f docker-compose.rancher-desktop.yml --profile prod up -d --build
```

#### Rancher Desktop (containerd / nerdctl)

```powershell
cd C:\Users\ShubhamMahure\Bench_Project\patient-account-service\patient-account-service-ui
copy .env.example .env
nerdctl compose -f docker-compose.yml -f docker-compose.rancher-desktop.yml --profile dev up --build
nerdctl compose -f docker-compose.yml -f docker-compose.rancher-desktop.yml --profile prod up -d --build
```

### Environment Variables

Use `.env` (from `.env.example`):

- `BACKEND_URL` (development proxy target used by `npm run start:proxy`)
- `API_UPSTREAM` (nginx reverse proxy upstream in production container)
- `API_BASE_URL` (runtime Angular API base path injected via `env-config.js`)
- `ANGULAR_BUILD_CONFIGURATION` (`production` or `development`)
- `UI_DEV_PORT` / `UI_PROD_PORT`

### Backend Integration Notes

- In development, requests are proxied by Angular (`proxy.generated.json`) to `BACKEND_URL`.
- In production, nginx proxies `/api/*` to `API_UPSTREAM`.
- Runtime env values are injected at container start to `/env-config.js`.
