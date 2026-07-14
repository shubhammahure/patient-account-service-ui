import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthStore } from '../../state/auth.store';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <main class="login-wrap">
      <mat-card>
        <h1>Sign In</h1>
        <p>Use your hospital portal credentials.</p>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Username</mat-label>
          <input matInput [(ngModel)]="username" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Password</mat-label>
          <input matInput type="password" [(ngModel)]="password" />
        </mat-form-field>

        @if (authStore.error()) {
          <p class="error">{{ authStore.error() }}</p>
        }

        <button mat-flat-button color="primary" type="button" (click)="signIn()" [disabled]="authStore.isLoading()">
          {{ authStore.isLoading() ? 'Signing in...' : 'Sign In' }}
        </button>
      </mat-card>
    </main>
  `,
  styles: [
    `
      .login-wrap { min-height: 100vh; display: grid; place-items: center; }
      mat-card { width: min(420px, 92vw); padding: 1.25rem; display: grid; gap: 0.75rem; }
      .full { width: 100%; }
      .error { color: #b00020; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly router = inject(Router);
  readonly authStore = inject<any>(AuthStore);

  username = signal('admin');
  password = signal('Admin@123');

  async signIn(): Promise<void> {
    await this.authStore.login(this.username(), this.password());
    if (this.authStore.isAuthenticated()) {
      await this.router.navigateByUrl('/dashboard');
    }
  }
}


