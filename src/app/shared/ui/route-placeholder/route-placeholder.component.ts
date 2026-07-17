import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../page-header/page-header.component';

@Component({
  selector: 'app-route-placeholder',
  standalone: true,
  imports: [MatIconModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header [title]="title" [subtitle]="subtitle"></app-page-header>
    <section class="placeholder-panel" aria-live="polite">
      <mat-icon aria-hidden="true">construction</mat-icon>
      <p>This route is configured and ready for feature implementation.</p>
    </section>
  `,
  styles: [
    `
      .placeholder-panel {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: var(--clr-surface);
        border: 1px solid var(--clr-border);
        border-radius: var(--radius-lg);
        padding: 1.25rem;
        box-shadow: var(--shadow-sm);
        color: var(--clr-text-2);
      }

      .placeholder-panel mat-icon {
        color: var(--clr-primary);
      }
    `,
  ],
})
export class RoutePlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  get title(): string {
    return this.route.snapshot.data['title'] ?? 'Placeholder';
  }

  get subtitle(): string {
    return (
      this.route.snapshot.data['subtitle'] ??
      'This screen is part of the configured routing map.'
    );
  }
}

