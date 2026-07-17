import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { AuthStore } from '../../state/auth.store';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-login-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatTabsModule,
    MatSelectModule,
  ],
  template: `
    <div class="auth-shell">
      <div class="auth-container">
        <section class="hero-panel" aria-label="HealthPortal highlights">
          <div class="hero-content">
            <div class="hero-brand">
              <div class="hero-logo" aria-hidden="true">
                <svg viewBox="0 0 96 96" role="img" aria-label="Medical app logo illustration">
                  <defs>
                    <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#156fe8"/>
                      <stop offset="100%" stop-color="#00a7c8"/>
                    </linearGradient>
                  </defs>
                  <rect x="8" y="8" width="80" height="80" rx="22" fill="url(#heroGrad)"/>
                  <path
                    d="M48 22c9 0 16 7 16 16v2h2c6 0 10 4 10 10s-4 10-10 10h-2v2c0 9-7 16-16 16s-16-7-16-16v-2h-2c-6 0-10-4-10-10s4-10 10-10h2v-2c0-9 7-16 16-16Z"
                    fill="rgba(255,255,255,.18)"/>
                  <path d="M44 30h8v14h14v8H52v14h-8V52H30v-8h14V30Z" fill="#fff"/>
                </svg>
              </div>
              <div>
                <p class="hero-kicker">Trusted healthcare access</p>
                <h1>HealthPortal</h1>
              </div>
            </div>

            <div class="hero-illustration">
              <img src="assets/images/abc.svg" alt="Patient safety logo" />
            </div>
          </div>
        </section>

        <section class="form-panel">
          <mat-card class="auth-card">
            @if (bannerMessage()) {
              <div class="banner" [class.banner--error]="bannerTone() === 'error'" role="alert">
                <mat-icon>{{ bannerTone() === 'error' ? 'error_outline' : 'info' }}</mat-icon>
                <span>{{ bannerMessage() }}</span>
              </div>
            }

            <mat-tab-group [selectedIndex]="selectedTab()" (selectedIndexChange)="selectedTab.set($event)">
              <mat-tab label="Login">
                <form [formGroup]="loginForm" (ngSubmit)="signIn()" class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Username</mat-label>
                    <input matInput formControlName="username" autocomplete="username"/>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Password</mat-label>
                    <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password"
                           autocomplete="current-password"/>
                    <button mat-icon-button matSuffix type="button" (click)="showPassword.update(v => !v)"
                            [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
                      <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                  </mat-form-field>

                  <mat-checkbox formControlName="rememberMe">Remember me</mat-checkbox>

                  <button mat-flat-button type="submit" [disabled]="loginForm.invalid || authStore.isLoading()">
                    <mat-icon>{{ authStore.isLoading() ? 'hourglass_top' : 'login' }}</mat-icon>
                    Sign In
                  </button>
                </form>
              </mat-tab>

              <mat-tab label="Register">
                <form [formGroup]="registerForm" (ngSubmit)="signUp()" class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Username</mat-label>
                    <input matInput formControlName="username" autocomplete="username"/>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email" autocomplete="email"/>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Password</mat-label>
                    <input matInput [type]="showRegisterPassword() ? 'text' : 'password'" formControlName="password"
                           autocomplete="new-password"/>
                    <button mat-icon-button matSuffix type="button" (click)="showRegisterPassword.update(v => !v)">
                      <mat-icon>{{ showRegisterPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Confirm Password</mat-label>
                    <input matInput [type]="showRegisterPassword() ? 'text' : 'password'"
                           formControlName="confirmPassword" autocomplete="new-password"/>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Primary Role</mat-label>
                    <mat-select formControlName="role">
                      <mat-option value="ADMIN">Admin</mat-option>
                      <mat-option value="DOCTOR">Doctor</mat-option>
                      <mat-option value="REGISTRAR">Registrar</mat-option>
                      <mat-option value="BILLING">Billing</mat-option>
                      <mat-option value="PFE_REVIEWER">PFE Reviewer</mat-option>
                    </mat-select>
                  </mat-form-field>

                  @if (registerForm.hasError('passwordsMismatch') && registerForm.touched) {
                    <p class="inline-error">Passwords do not match.</p>
                  }

                  <button mat-flat-button type="submit" [disabled]="registerForm.invalid || authStore.isLoading()">
                    <mat-icon>{{ authStore.isLoading() ? 'hourglass_top' : 'person_add' }}</mat-icon>
                    Create account
                  </button>
                </form>
              </mat-tab>
            </mat-tab-group>
          </mat-card>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .auth-shell {
      min-height: 100vh;
      position: relative;
      isolation: isolate;
      padding: 1.25rem;
      background:
        radial-gradient(circle at 18% 18%, rgba(21, 111, 232, 0.12), transparent 28%),
        radial-gradient(circle at 82% 12%, rgba(0, 167, 200, 0.12), transparent 24%),
        radial-gradient(circle at 78% 82%, rgba(252, 246, 238, 0.92), transparent 28%),
        linear-gradient(135deg, #f8fbff 0%, #eaf3ff 42%, #d8e7fb 100%);
    }

    .auth-shell::before {
      content: '';
      position: absolute;
      inset: -10%;
      background:
        radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.95) 0, rgba(255, 255, 255, 0.55) 14%, transparent 35%),
        radial-gradient(circle at 80% 18%, rgba(21, 111, 232, 0.18) 0, rgba(21, 111, 232, 0.07) 18%, transparent 38%),
        radial-gradient(circle at 85% 80%, rgba(0, 167, 200, 0.14) 0, rgba(0, 167, 200, 0.06) 16%, transparent 34%),
        radial-gradient(circle at 15% 82%, rgba(252, 246, 238, 0.95) 0, rgba(252, 246, 238, 0.45) 20%, transparent 40%);
      pointer-events: none;
      z-index: -1;
      filter: blur(12px);
      transform: scale(1.03);
    }

    .auth-container {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: minmax(320px, 1fr) minmax(420px, 560px);
      gap: 1.25rem;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 2.5rem);
      max-width: 1120px;
      margin-inline: auto;
    }

    .hero-panel,
    .form-panel {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    .hero-panel {
      justify-content: flex-end;
      padding: 0;
    }

    .hero-content {
      width: min(100%, 500px);
      display: grid;
      gap: 1rem;
      justify-items: start;
    }

    .hero-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0;
      color: #0f2441;
    }

    .hero-illustration {
      width: min(100%, 420px);
      border-radius: 0;
      overflow: visible;
      box-shadow: none;
      border: none;
      background: transparent;
    }

    .hero-illustration img {
      display: block;
      width: 100%;
      height: auto;
      max-height: 324px;
      object-fit: contain;
      filter: drop-shadow(0 12px 32px rgba(21, 111, 232, 0.18));
    }

    .hero-logo {
      width: 58px;
      height: 58px;
      border-radius: 18px;
      box-shadow:
        0 20px 40px rgba(21, 111, 232, 0.18),
        0 1px 0 rgba(255, 255, 255, 0.85) inset;
      backdrop-filter: blur(10px);
      overflow: hidden;
      flex: 0 0 58px;
    }

    .hero-logo svg {
      display: block;
      width: 100%;
      height: 100%;
    }

    .hero-kicker {
      margin: 0 0 0.15rem;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-primary);
    }

    .hero-brand h1 {
      margin: 0;
      font-size: 2rem;
      line-height: 1;
    }

    .form-panel { justify-content: flex-start; padding: 0; margin-top: 0; }

    .auth-card {
      width: 100%;
      min-height: 500px;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      border-radius: 24px;
      border: 1px solid rgba(205, 220, 245, 0.95);
      padding: 1.25rem;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 249, 255, 0.96) 100%);
      box-shadow:
        0 24px 60px rgba(16, 35, 63, 0.18),
        0 2px 0 rgba(255, 255, 255, 0.85) inset,
        0 -1px 0 rgba(16, 35, 63, 0.04) inset;
      backdrop-filter: blur(16px);
      color: var(--clr-text);
      transform: translateY(-2px);
    }

    .auth-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, transparent 30%),
        linear-gradient(315deg, rgba(21, 111, 232, 0.05), transparent 35%);
      pointer-events: none;
    }

    .auth-card::after {
      content: '';
      position: absolute;
      inset: auto 12px 12px auto;
      width: 180px;
      height: 180px;
      background: radial-gradient(circle, rgba(21, 111, 232, 0.12), transparent 70%);
      pointer-events: none;
      filter: blur(8px);
    }

    .auth-card :host ::ng-deep .mat-mdc-tab-group,
    .auth-card :host ::ng-deep .mat-mdc-tab-body-content {
      color: var(--clr-text);
    }

    .auth-card :host ::ng-deep .mat-mdc-tab-group {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }

    .auth-card :host ::ng-deep .mat-mdc-tab-body-wrapper {
      flex: 1;
      min-height: 0;
    }

    .auth-card :host ::ng-deep .mat-mdc-tab-header {
      border-bottom: 1px solid rgba(205, 220, 245, 0.9);
    }

    .auth-card :host ::ng-deep .mat-mdc-tab-labels {
      background: rgba(243, 247, 255, 0.7);
      border-radius: 14px;
      padding: 0.15rem;
    }

    .auth-card :host ::ng-deep .mat-mdc-tab,
    .auth-card :host ::ng-deep .mdc-tab__text-label {
      color: var(--clr-text-2);
      font-weight: 600;
    }

    .auth-card :host ::ng-deep .mdc-tab--active .mdc-tab__text-label {
      color: var(--color-primary);
    }

    .auth-card :host ::ng-deep .mat-mdc-tab-body-content {
      min-height: 320px;
      padding-top: 0.75rem;
      display: flex;
    }

    .auth-card :host ::ng-deep .mat-mdc-form-field {
      background: rgba(248, 251, 255, 0.95);
      border-radius: 14px;
    }

    .auth-card :host ::ng-deep .mat-mdc-text-field-wrapper {
      background: rgba(248, 251, 255, 0.95);
    }

    .auth-card :host ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      padding-bottom: 0;
    }

    .auth-card :host ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__leading,
    .auth-card :host ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__notch,
    .auth-card :host ::ng-deep .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__trailing {
      border-color: rgba(178, 198, 232, 0.95);
    }

    .auth-card :host ::ng-deep .mdc-text-field--focused:not(.mdc-text-field--disabled) .mdc-notched-outline__leading,
    .auth-card :host ::ng-deep .mdc-text-field--focused:not(.mdc-text-field--disabled) .mdc-notched-outline__notch,
    .auth-card :host ::ng-deep .mdc-text-field--focused:not(.mdc-text-field--disabled) .mdc-notched-outline__trailing {
      border-color: var(--color-primary) !important;
    }

    .auth-card :host ::ng-deep .mat-mdc-input-element {
      color: var(--clr-text);
    }

    .auth-card :host ::ng-deep .mat-mdc-select-value,
    .auth-card :host ::ng-deep .mat-mdc-select-arrow {
      color: var(--clr-text);
    }

    .banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-radius: 8px;
      padding: 0.55rem 0.75rem;
      margin-bottom: 1rem;
      background: rgba(1, 87, 155, 0.1);
      color: #01579b;
      border: 1px solid rgba(1, 87, 155, 0.2);
    }

    .banner--error {
      background: rgba(198, 40, 40, 0.08);
      border-color: rgba(198, 40, 40, 0.2);
      color: #c62828;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.65rem;
      padding-top: 1rem;
      position: relative;
      z-index: 1;
      min-height: 360px;
      width: 100%;
      align-content: start;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    mat-form-field {
      grid-column: 1 / -1;
    }

    .inline-error {
      grid-column: 1 / -1;
      margin: 0;
      font-size: 0.8rem;
      color: #c62828;
    }

    button[mat-flat-button] {
      margin-top: auto;
      border-radius: 12px;
      box-shadow:
        0 10px 22px rgba(21, 111, 232, 0.18),
        0 1px 0 rgba(255, 255, 255, 0.2) inset;
      background-image: linear-gradient(135deg, #156fe8 0%, #0a4fb3 100%);
    }

    button[mat-flat-button]:hover:not(:disabled) {
      box-shadow:
        0 14px 28px rgba(21, 111, 232, 0.24),
        0 1px 0 rgba(255, 255, 255, 0.18) inset;
      transform: translateY(-1px);
    }

    button[mat-flat-button]:active:not(:disabled) {
      transform: translateY(1px) scale(0.99);
      box-shadow:
        0 6px 14px rgba(21, 111, 232, 0.18),
        0 1px 0 rgba(255, 255, 255, 0.16) inset;
    }

    @media (max-width: 960px) {
      .auth-container {
        grid-template-columns: 1fr;
        gap: 0.45rem;
        max-width: 620px;
        min-height: auto;
      }

      .hero-panel,
      .form-panel {
        justify-content: center;
      }

      .hero-content {
        justify-items: center;
      }

      .hero-brand {
        justify-content: center;
      }
    }

    @media (max-width: 600px) {
      .auth-shell {
        padding: 0.75rem;
      }

      .auth-container {
        gap: 0.35rem;
        min-height: auto;
      }

      .hero-panel,
      .form-panel {
        padding: 0;
        justify-content: center;
      }


      .auth-card {
        padding: 1rem;
        border-radius: 20px;
        width: 100%;
        min-height: 460px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class LoginPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  readonly authStore = inject(AuthStore);

  readonly selectedTab = signal(0);
  readonly showPassword = signal(false);
  readonly showRegisterPassword = signal(false);

  readonly loginForm = this.fb.nonNullable.group({
    username: ['admin', [Validators.required]],
    password: ['Admin@12345', [Validators.required]],
    rememberMe: [true],
  });

  readonly registerForm = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      role: ['REGISTRAR', [Validators.required]],
    },
    { validators: passwordsMatchValidator }
  );

  readonly bannerTone = computed<'info' | 'error'>(() => {
    if (this.authStore.error()) {
      return 'error';
    }
    return 'info';
  });

  readonly bannerMessage = computed(() => {
    if (this.authStore.error()) {
      return this.authStore.error();
    }

    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'session-expired') {
      return 'Your session expired due to inactivity. Please sign in again.';
    }

    if (reason === 'unauthorized') {
      return 'Please sign in to continue.';
    }

    return '';
  });

  constructor() {
    if (this.route.snapshot.routeConfig?.path === 'register') {
      this.selectedTab.set(1);
    }
  }

  async signIn(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password, rememberMe } = this.loginForm.getRawValue();
    await this.authStore.login(username, password, rememberMe);

    if (this.authStore.isAuthenticated()) {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
      await this.router.navigateByUrl(returnUrl);
    }
  }

  async signUp(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { username, email, password, role } = this.registerForm.getRawValue();

    try {
      await this.authStore.register({ username, email, password, roles: [role] });
      if (!this.authStore.error()) {
        this.loginForm.patchValue({ username, password });
        this.selectedTab.set(0);
      }
    } catch {
      // AuthStore.error signal is already populated for the UI banner.
    }
  }
}
