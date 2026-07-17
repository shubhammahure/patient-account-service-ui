import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="profile-card" [class.profile-card--compact]="compact">
      <div class="profile-card__avatar" [class.profile-card__avatar--lg]="!compact">
        @if (avatarUrl) {
          <img [src]="avatarUrl" [alt]="name" />
        } @else {
          <span class="profile-card__initials">{{ initials }}</span>
        }
      </div>

      <div class="profile-card__body">
        <div class="profile-card__name">{{ name }}</div>
        @if (role) {
          <div class="profile-card__role">{{ role }}</div>
        }
        @if (email && !compact) {
          <div class="profile-card__email">{{ email }}</div>
        }
      </div>

      @if (showBadge) {
        <span class="profile-card__badge" [title]="badgeTooltip">{{ badgeLabel }}</span>
      }

      <ng-content />
    </div>
  `,
  styles: [`
    .profile-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      background: var(--clr-surface);
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .profile-card--compact {
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-md);
      gap: 0.5rem;
    }

    .profile-card__avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(21, 101, 192, 0.12);
      color: var(--clr-primary);
      font-weight: 700;
      font-size: 0.85rem;
      flex-shrink: 0;
      overflow: hidden;

      img { width: 100%; height: 100%; object-fit: cover; }
    }

    .profile-card__avatar--lg {
      width: 48px;
      height: 48px;
      font-size: 1rem;
    }

    .profile-card__body { flex: 1; min-width: 0; }

    .profile-card__name {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--clr-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .profile-card__role {
      font-size: 0.78rem;
      color: var(--clr-text-2);
      margin-top: 1px;
    }

    .profile-card__email {
      font-size: 0.76rem;
      color: var(--clr-text-3);
      margin-top: 2px;
    }

    .profile-card__badge {
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      background: rgba(21, 101, 192, 0.12);
      color: var(--clr-primary);
      font-size: 0.72rem;
      font-weight: 600;
      white-space: nowrap;
    }
  `],
})
export class ProfileCardComponent {
  @Input() name = '';
  @Input() role = '';
  @Input() email = '';
  @Input() avatarUrl = '';
  @Input() compact = false;
  @Input() showBadge = false;
  @Input() badgeLabel = '';
  @Input() badgeTooltip = '';

  get initials(): string {
    return this.name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}

