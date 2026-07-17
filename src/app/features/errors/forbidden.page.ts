import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="forbidden-shell">
      <mat-card class="forbidden-card">
        <mat-icon class="forbidden-icon" aria-hidden="true">gpp_bad</mat-icon>
        <h1>Access denied</h1>
        <p>You are authenticated but do not have permission to access this page.</p>
        <div class="actions">
          <a mat-flat-button routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            Go to dashboard
          </a>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .forbidden-shell {
      display: grid;
      place-items: center;
      min-height: calc(100vh - 160px);
      padding: 1.5rem;
    }

    .forbidden-card {
      width: min(560px, 100%);
      text-align: center;
      padding: 2rem;
      border-radius: 16px;
      border: 1px solid var(--clr-border);
    }

    .forbidden-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #c62828;
      margin-bottom: 0.75rem;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      color: var(--clr-text);
    }

    p {
      margin: 0.75rem 0 0;
      color: var(--clr-text-2);
    }

    .actions {
      margin-top: 1.5rem;
      display: flex;
      justify-content: center;
    }
  `],
})
export class ForbiddenPageComponent {}

