import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatSlideToggleModule, MatIconModule, PageHeaderComponent],
  template: `
    <app-page-header
      title="Settings"
      subtitle="System and application preferences"
      icon="settings"
      [bordered]="true">
    </app-page-header>

    <mat-card class="settings-card">
      <h3>
        <mat-icon>tune</mat-icon>
        Application Preferences
      </h3>

      <div class="pref-row">
        <div>
          <div class="title">Compact Density</div>
          <div class="desc">Reduce spacing for dense healthcare data screens.</div>
        </div>
        <mat-slide-toggle disabled></mat-slide-toggle>
      </div>

      <div class="pref-row">
        <div>
          <div class="title">Enable Alert Sounds</div>
          <div class="desc">Play alert sounds for critical notifications.</div>
        </div>
        <mat-slide-toggle disabled></mat-slide-toggle>
      </div>
    </mat-card>
  `,
  styles: [`
    .settings-card {
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: 1rem;

      h3 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
    }

    .pref-row {
      margin-top: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.8rem;
      border: 1px solid var(--clr-border);
      border-radius: 10px;
      padding: 0.75rem;

      .title {
        font-weight: 600;
      }

      .desc {
        margin-top: 0.2rem;
        color: var(--clr-text-2);
        font-size: 0.82rem;
      }
    }
  `],
})
export class SettingsPageComponent {}

