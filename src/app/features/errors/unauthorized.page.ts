import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <section class="error-page">
      <mat-icon>lock</mat-icon>
      <h1>401 - Unauthorized</h1>
      <p>Your session is invalid or expired. Please sign in to continue.</p>
      <a mat-flat-button color="primary" routerLink="/auth/login">Go To Login</a>
    </section>
  `,
  styles: [`
    .error-page {
      min-height: 60vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
      text-align: center;

      mat-icon {
        font-size: 56px;
        width: 56px;
        height: 56px;
        color: #ef6c00;
      }

      h1 {
        margin: 0;
        font-size: 1.5rem;
      }

      p {
        margin: 0;
        color: var(--clr-text-2);
        max-width: 420px;
      }
    }
  `],
})
export class UnauthorizedPageComponent {}

