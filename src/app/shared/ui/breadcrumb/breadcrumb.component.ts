import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconModule],
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      @for (crumb of breadcrumbs.crumbs(); track crumb.url; let last = $last) {
        @if (!last) {
          <a class="breadcrumb__link" [routerLink]="crumb.url">{{ crumb.label }}</a>
          <mat-icon class="breadcrumb__sep">chevron_right</mat-icon>
        } @else {
          <span class="breadcrumb__current" aria-current="page">{{ crumb.label }}</span>
        }
      }
    </nav>
  `,
  styles: [`
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.15rem;
      font-size: 0.8rem;
    }

    .breadcrumb__link {
      color: var(--clr-text-2);
      text-decoration: none;
      transition: color 150ms;

      &:hover { color: var(--clr-primary); }
    }

    .breadcrumb__sep {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: var(--clr-text-3);
    }

    .breadcrumb__current {
      color: var(--clr-text);
      font-weight: 500;
    }
  `],
})
export class BreadcrumbComponent {
  readonly breadcrumbs = inject(BreadcrumbService);
}

