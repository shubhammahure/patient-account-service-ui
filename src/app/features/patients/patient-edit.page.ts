import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { PatientSummaryDto, PatientUpsertRequestDto } from '../../core/api/generated';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { PatientsStore } from '../../state/patients.store';
import { PatientFormComponent } from './patient-form.component';

@Component({
  selector: 'app-patient-edit-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, PatientFormComponent],
  template: `
    <app-page-header title="Edit Patient" subtitle="Update patient profile information."></app-page-header>

    <section class="panel">
      @if (patient()) {
        <app-patient-form
          [initialValue]="patient()"
          [loading]="patientsStore.isLoading()"
          [mode]="'edit'"
          (submitPatient)="save($event)"
          (cancel)="cancel()">
        </app-patient-form>
      } @else if (patientsStore.isLoading()) {
        <p>Loading patient details...</p>
      } @else {
        <p class="error-text">Patient not found.</p>
      }

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
      color: #c62828;
      font-size: 0.82rem;
    }
  `],
})
export class PatientEditPageComponent implements OnInit {
  readonly patientsStore = inject(PatientsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly patient = signal<PatientSummaryDto | null>(null);
  private patientId = 0;

  async ngOnInit(): Promise<void> {
    this.patientId = Number(this.route.snapshot.paramMap.get('patientId'));
    if (!this.patientId) {
      return;
    }

    const data = await this.patientsStore.getById(this.patientId);
    this.patient.set(data);
  }

  async save(payload: PatientUpsertRequestDto): Promise<void> {
    if (!this.patientId) {
      return;
    }

    const updated = await this.patientsStore.update(this.patientId, payload);
    if (updated) {
      await this.router.navigate(['/patients', this.patientId]);
    }
  }

  cancel(): void {
    void this.router.navigate(['/patients', this.patientId]);
  }
}
