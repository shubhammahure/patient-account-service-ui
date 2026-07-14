import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <h2>Operations Dashboard</h2>
    <div class="grid">
      <mat-card>
        <h3>Backend Integration</h3>
        <p>Auth, Patients, Admissions, Payment Cases, and PFE workflows are wired.</p>
      </mat-card>
      <mat-card>
        <h3>Next</h3>
        <p>Add richer charts and table drill-down actions after API smoke validation.</p>
      </mat-card>
    </div>
  `,
  styles: [`.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {}

