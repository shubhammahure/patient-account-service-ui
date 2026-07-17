# Enterprise Healthcare Theme

This Angular Material-only theme provides enterprise healthcare styling with:

- Material Design 3 light/dark theme setup
- Primary Blue, Secondary Teal, Success Green, Warning Orange, Error Red tokens
- Typography scale and utility classes
- Spacing scale and responsive utility classes
- Reusable global SCSS files (no Bootstrap)

## Files

- `src/styles.scss`
- `src/styles/_tokens.scss`
- `src/styles/_theme.scss`
- `src/styles/_typography.scss`
- `src/styles/_layout.scss`
- `src/styles/_tables.scss`
- `src/styles/_utilities.scss`

## Token Usage

```scss
color: var(--color-primary);
background: var(--color-surface);
padding: var(--space-4);
font-size: var(--text-sm);
```

## Utility Usage Examples

```html
<div class="d-flex items-center justify-between gap-4 p-4 rounded-md shadow-sm border-base bg-surface">
  <h3 class="h3 text-primary">Patient Summary</h3>
  <span class="text-sm text-muted">Updated now</span>
</div>

<div class="d-none d-md-block">Visible from md and up</div>
<div class="d-md-none">Hidden from md and up</div>
```

## Dark Mode

Dark mode is enabled by adding `dark-theme` class on `<html>`:

```ts
// Example toggle
const isDark = document.documentElement.classList.toggle('dark-theme');
```

## Verification

Run:

```powershell
Set-Location "C:\Users\ShubhamMahure\Bench_Project\patient-account-service\patient-account-service-ui"
npm run build
```

