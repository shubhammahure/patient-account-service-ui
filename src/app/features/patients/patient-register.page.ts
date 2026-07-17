import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { PatientUpsertRequestDto } from '../../core/api/generated';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { PatientsStore } from '../../state/patients.store';
import { PatientFormComponent } from './patient-form.component';

@Component({
  selector: 'app-patient-register-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, PatientFormComponent],
  template: `
    <app-page-header title="Register Patient" subtitle="Create a new patient record with validation."></app-page-header>

    <section class="panel">
      <app-patient-form
        [loading]="patientsStore.isLoading()"
        [mode]="'create'"
        (submitPatient)="create($event)"
        (cancel)="cancel()">
      </app-patient-form>

      @if (patientsStore.error()) {
        <p class="error-text">{{ patientsStore.error() }}</p>
      }
    </section>
  `,
  styles: [`
    .panel {
      background: var(--clr-surface);
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: 1rem;
    }

    .error-text {
      margin: 0.75rem 0 0;
      color: #c62828;
      font-size: 0.82rem;
    }
  `],
})
export class PatientRegisterPageComponent {
  readonly patientsStore = inject(PatientsStore);
  private readonly router = inject(Router);

  async create(payload: PatientUpsertRequestDto): Promise<void> {
    const created = await this.patientsStore.create(payload);
    if (created) {
      await this.router.navigate(['/patients']);
    }
  }

  cancel(): void {
    void this.router.navigate(['/patients']);
  }
}
