import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { AuthStore } from '../../state/auth.store';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatCardModule, MatIconModule, PageHeaderComponent],
  template: `
    <app-page-header
      title="Profile"
      subtitle="View account details and access scope"
      icon="account_circle"
      [bordered]="true">
    </app-page-header>

    <mat-card class="profile-card">
      <div class="identity">
        <span class="avatar">{{ avatarInitial() }}</span>
        <div>
          <h3>{{ authStore.username() || 'User' }}</h3>
          <p>Active enterprise healthcare account</p>
        </div>
      </div>

      <div class="meta">
        <div>
          <div class="label">Username</div>
          <div class="value">{{ authStore.username() || '-' }}</div>
        </div>
        <div>
          <div class="label">Roles</div>
          <div class="value">{{ authStore.roles().join(', ') || '-' }}</div>
        </div>
      </div>

      <div class="actions">
        <button mat-stroked-button type="button" disabled>
          <mat-icon>edit</mat-icon>
          Edit Profile (coming soon)
        </button>
      </div>
    </mat-card>
  `,
  styles: [`
    .profile-card {
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: 1rem;
    }

    .identity {
      display: flex;
      align-items: center;
      gap: 0.9rem;

      .avatar {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(21, 101, 192, 0.15);
        color: var(--clr-primary);
        font-weight: 700;
      }

      h3 {
        margin: 0;
      }

      p {
        margin: 0.2rem 0 0;
        color: var(--clr-text-2);
        font-size: 0.85rem;
      }
    }

    .meta {
      margin-top: 1rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 0.8rem;

      .label {
        font-size: 0.74rem;
        text-transform: uppercase;
        color: var(--clr-text-2);
      }

      .value {
        margin-top: 0.2rem;
        font-weight: 600;
      }
    }

    .actions {
      margin-top: 1rem;
    }
  `],
})
export class ProfilePageComponent {
  readonly authStore = inject(AuthStore);

  avatarInitial(): string {
    const name = this.authStore.username();
    return name ? name[0].toUpperCase() : 'U';
  }
}

