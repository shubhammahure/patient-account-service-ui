import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusChipComponent, type StatusTone } from '../../shared/ui/status-chip/status-chip.component';
import { AdmissionsStore } from '../../state/admissions.store';
import type { AdmissionSummaryDto } from '../../core/api/generated';

interface TimelineEvent {
  label: string;
  detail: string;
  time: string;
  icon: string;
}

function statusTone(status: string): StatusTone {
  if (status === 'ADMITTED') {
    return 'active';
  }
  if (status === 'IN_TRANSFER') {
    return 'pending';
  }
  if (status === 'DISCHARGED') {
    return 'inactive';
  }
  return 'neutral';
}

@Component({
  selector: 'app-admission-details-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule, PageHeaderComponent, StatusChipComponent],
  template: `
    <app-page-header title="Admission Details" subtitle="Admission profile and patient timeline.">
      <a mat-stroked-button routerLink="/admissions">
        <mat-icon>arrow_back</mat-icon>
        Back
      </a>
    </app-page-header>

    @if (admission()) {
      <div class="grid">
        <mat-card class="panel">
          <h3>Admission Profile</h3>
          <div class="profile-grid">
            <p><span>Admission ID</span><strong>{{ admission()?.admissionId || 'N/A' }}</strong></p>
            <p><span>Admission Number</span><strong>{{ admission()?.admissionNumber || 'N/A' }}</strong></p>
            <p><span>Patient ID</span><strong>{{ admission()?.patientId || 'N/A' }}</strong></p>
            <p><span>Doctor</span><strong>{{ admission()?.doctor || 'N/A' }}</strong></p>
            <p><span>Admission Type</span><strong>{{ admission()?.admissionType || 'N/A' }}</strong></p>
            <p><span>Facility / Department</span><strong>{{ admission()?.facilityId || 'N/A' }} / {{ admission()?.departmentId || 'N/A' }}</strong></p>
            <p><span>Ward / Room</span><strong>{{ admission()?.ward || 'N/A' }} / {{ admission()?.room || 'N/A' }}</strong></p>
            <p><span>Status</span><strong><app-status-chip [label]="status()" [tone]="statusTone(status())" /></strong></p>
          </div>
        </mat-card>

        <mat-card class="panel">
          <h3>Patient Timeline</h3>
          <ul class="timeline">
            @for (event of timeline(); track event.label + event.time) {
              <li>
                <span class="dot"><mat-icon>{{ event.icon }}</mat-icon></span>
                <div>
                  <p class="event-label">{{ event.label }}</p>
                  <p class="event-detail">{{ event.detail }}</p>
                  <p class="event-time">{{ event.time }}</p>
                </div>
              </li>
            }
          </ul>
        </mat-card>
      </div>
    } @else if (store.isLoading()) {
      <p>Loading admission details...</p>
    } @else {
      <p class="error-text">Admission not found.</p>
    }
  `,
  styles: [`
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .panel {
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      background: var(--clr-surface);
      padding: 1rem;
    }

    h3 {
      margin: 0 0 0.75rem;
      font-size: 0.95rem;
      color: var(--clr-text);
    }

    .profile-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.6rem;
    }

    .profile-grid p {
      margin: 0;
      border: 1px solid var(--clr-border);
      border-radius: 8px;
      padding: 0.55rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .profile-grid span {
      font-size: 0.72rem;
      color: var(--clr-text-2);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .profile-grid strong {
      font-size: 0.84rem;
      color: var(--clr-text);
    }

    .timeline {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .timeline li {
      display: flex;
      gap: 0.65rem;
      border-bottom: 1px solid var(--clr-border);
      padding-bottom: 0.6rem;
    }

    .timeline li:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .dot {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(21, 101, 192, 0.12);
      color: #1565c0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .dot mat-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
    }

    .event-label {
      margin: 0;
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--clr-text);
    }

    .event-detail {
      margin: 0.15rem 0 0;
      font-size: 0.76rem;
      color: var(--clr-text-2);
    }

    .event-time {
      margin: 0.15rem 0 0;
      font-size: 0.72rem;
      color: var(--clr-text-3);
    }

    .error-text {
      color: #c62828;
      font-size: 0.82rem;
    }

    @media (max-width: 1024px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class AdmissionDetailsPageComponent implements OnInit {
  readonly store = inject(AdmissionsStore);
  private readonly route = inject(ActivatedRoute);

  readonly admission = signal<AdmissionSummaryDto | null>(null);

  readonly status = computed(() => this.store.resolveStatus(this.admission()?.admissionStatus));
  readonly statusTone = statusTone;

  readonly timeline = computed<TimelineEvent[]>(() => {
    const admission = this.admission();
    if (!admission) {
      return [];
    }

    const events: TimelineEvent[] = [
      {
        label: 'Patient admitted',
        detail: `Admission ${admission.admissionNumber || admission.admissionId || ''} created for patient ${admission.patientId || 'N/A'}.`,
        time: admission.admissionDate || 'N/A',
        icon: 'login',
      },
      {
        label: 'Clinical assignment',
        detail: `Doctor ${admission.doctor || 'N/A'} assigned with ward ${admission.ward || 'N/A'} and room ${admission.room || 'N/A'}.`,
        time: admission.admissionDate || 'N/A',
        icon: 'medical_services',
      },
    ];

    if (this.status() === 'DISCHARGED') {
      events.push({
        label: 'Patient discharged',
        detail: `Disposition: ${admission.disposition || 'N/A'}.`,
        time: admission.dischargeDate || 'N/A',
        icon: 'logout',
      });
    }

    return events;
  });

  async ngOnInit(): Promise<void> {
    const admissionId = Number(this.route.snapshot.paramMap.get('admissionId'));
    if (!admissionId) {
      return;
    }

    const data = await this.store.getById(admissionId);
    this.admission.set(data);
  }
}
