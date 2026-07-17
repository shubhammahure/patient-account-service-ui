import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import type { PatientSummaryDto } from '../../core/api/generated';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusChipComponent, type StatusTone } from '../../shared/ui/status-chip/status-chip.component';
import { PatientsStore } from '../../state/patients.store';

interface TimelineEvent {
  title: string;
  detail: string;
  time: string;
  icon: string;
}

function statusTone(status?: string): StatusTone {
  if (status === 'ACTIVE') {
    return 'active';
  }

  if (status === 'DECEASED') {
    return 'error';
  }

  if (status === 'INACTIVE') {
    return 'inactive';
  }

  return 'neutral';
}

@Component({
  selector: 'app-patient-details-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    PageHeaderComponent,
    StatusChipComponent,
  ],
  template: `
    <app-page-header title="Patient Details" subtitle="Profile card and care timeline.">
      <div class="header-actions">
        <a mat-stroked-button routerLink="/patients">
          <mat-icon>arrow_back</mat-icon>
          Back to list
        </a>
        <a mat-flat-button [routerLink]="['/patients', patientId(), 'edit']" [class.disabled-link]="!patientId()">
          <mat-icon>edit</mat-icon>
          Edit Patient
        </a>
      </div>
    </app-page-header>

    @if (patient()) {
      <div class="grid">
        <mat-card class="profile-card">
          <div class="profile-header">
            <div class="avatar">{{ avatarInitial() }}</div>
            <div>
              <h3>{{ fullName() }}</h3>
              <p>Account: {{ patient()?.accountNumber || 'N/A' }}</p>
            </div>
            <app-status-chip [label]="patient()?.status || 'UNKNOWN'" [tone]="statusTone(patient()?.status)" />
          </div>

          <div class="profile-grid">
            <p><span>Patient ID</span><strong>{{ patient()?.patientId || 'N/A' }}</strong></p>
            <p><span>MRN</span><strong>{{ patient()?.mrn || 'N/A' }}</strong></p>
            <p><span>Date of Birth</span><strong>{{ patient()?.dateOfBirth || 'N/A' }}</strong></p>
            <p><span>Gender</span><strong>{{ patient()?.gender || 'N/A' }}</strong></p>
            <p><span>Phone</span><strong>{{ patient()?.phoneNumber || 'N/A' }}</strong></p>
            <p><span>Email</span><strong>{{ patient()?.email || 'N/A' }}</strong></p>
          </div>
        </mat-card>

        <mat-card class="timeline-card">
          <h3>Timeline</h3>
          <ul class="timeline-list">
            @for (event of timeline(); track event.title + event.time) {
              <li>
                <span class="dot"><mat-icon>{{ event.icon }}</mat-icon></span>
                <div>
                  <p class="event-title">{{ event.title }}</p>
                  <p class="event-detail">{{ event.detail }}</p>
                  <p class="event-time">{{ event.time }}</p>
                </div>
              </li>
            }
          </ul>
        </mat-card>
      </div>
    } @else if (patientsStore.isLoading()) {
      <p>Loading patient details...</p>
    } @else {
      <p class="error-text">Patient not found.</p>
    }
  `,
  styles: [`
    .header-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .disabled-link {
      pointer-events: none;
      opacity: 0.5;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .profile-card,
    .timeline-card {
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      background: var(--clr-surface);
      padding: 1rem;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #1565c0;
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      flex-shrink: 0;
    }

    .profile-header h3 {
      margin: 0;
      font-size: 1rem;
      color: var(--clr-text);
    }

    .profile-header p {
      margin: 0.2rem 0 0;
      color: var(--clr-text-2);
      font-size: 0.8rem;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.6rem;
    }

    .profile-grid p {
      margin: 0;
      padding: 0.55rem;
      border: 1px solid var(--clr-border);
      border-radius: 8px;
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
      color: var(--clr-text);
      font-size: 0.84rem;
    }

    .timeline-card h3 {
      margin: 0 0 0.75rem;
      font-size: 0.95rem;
      color: var(--clr-text);
    }

    .timeline-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .timeline-list li {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      border-bottom: 1px solid var(--clr-border);
      padding-bottom: 0.7rem;
    }

    .timeline-list li:last-child {
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
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .event-title {
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

    @media (max-width: 640px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class PatientDetailsPageComponent implements OnInit {
  readonly patientsStore = inject(PatientsStore);
  private readonly route = inject(ActivatedRoute);

  readonly patient = signal<PatientSummaryDto | null>(null);
  readonly patientId = signal(0);
  readonly statusTone = statusTone;

  readonly fullName = computed(() => {
    const p = this.patient();
    return p?.fullName || `${p?.firstName ?? ''} ${p?.lastName ?? ''}`.trim() || 'Unknown Patient';
  });

  readonly timeline = computed<TimelineEvent[]>(() => {
    const p = this.patient();
    if (!p) {
      return [];
    }

    return [
      {
        title: 'Patient registered',
        detail: `${this.fullName()} profile created with account ${p.accountNumber || 'N/A'}`,
        time: 'Today',
        icon: 'person_add',
      },
      {
        title: 'Profile verified',
        detail: `Demographic details and MRN ${p.mrn || 'not provided'} checked`,
        time: 'Today',
        icon: 'fact_check',
      },
      {
        title: 'Current status',
        detail: `Patient status is ${p.status || 'UNKNOWN'}`,
        time: 'Now',
        icon: 'monitor_heart',
      },
    ];
  });

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('patientId'));
    this.patientId.set(id);

    if (!id) {
      return;
    }

    const data = await this.patientsStore.getById(id);
    this.patient.set(data);
  }

  avatarInitial(): string {
    const name = this.fullName();
    return name ? name[0].toUpperCase() : 'P';
  }
}
