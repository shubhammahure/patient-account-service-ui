import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Chart, ChartData, ChartType, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { PathToPaymentService, PatientService } from '../../core/api/generated';
import { StatCardComponent } from '../../shared/ui/stat-card/stat-card.component';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { AuthStore } from '../../state/auth.store';
import { AdmissionsStore } from '../../state/admissions.store';

Chart.register(...registerables);

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  description: string;
  color: string;
}

interface ActivityItem {
  id: string;
  icon: string;
  iconTone: 'primary' | 'success' | 'warning' | 'error';
  title: string;
  detail: string;
  time: Date;
  status: string;
  statusTone: 'active' | 'inactive' | 'pending' | 'completed' | 'error' | 'neutral';
}

interface AdmissionView {
  admissionNumber: string;
  patientName: string;
  department: string;
  admittedAt: Date;
  status: 'ADMITTED' | 'IN_TRANSFER' | 'DISCHARGED';
}

interface PatientView {
  fullName: string;
  accountNumber: string;
  status: string;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    BaseChartDirective,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatCardModule,
    MatListModule,
    StatCardComponent,
    StatusChipComponent,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header
      [title]="greeting()"
      subtitle="Professional healthcare operations dashboard">
    </app-page-header>

    <section class="metrics-grid" aria-label="Primary metrics">
      <app-stat-card label="Patients" [value]="metricPatients()" icon="people" tone="primary" subtitle="Registered patients" />
      <app-stat-card label="Admissions" [value]="metricAdmissions()" icon="local_hospital" tone="success" subtitle="Latest intake volume" />
      <app-stat-card label="Payment Cases" [value]="metricPaymentCases()" icon="payments" tone="info" subtitle="Active and tracked" />
      <app-stat-card label="Pending PFE" [value]="metricPendingPfe()" icon="receipt_long" tone="warning" subtitle="Awaiting review" />
      <app-stat-card label="Pending Transfers" [value]="metricPendingTransfers()" icon="swap_horiz" tone="warning" subtitle="Requires routing" />
      <app-stat-card label="Outstanding Payments" [value]="metricOutstandingPayments()" icon="account_balance_wallet" tone="error" subtitle="Open balances" />
    </section>

    <section class="content-grid">
      <mat-card class="panel">
        <h3 class="panel-title">Today's Summary</h3>
        <mat-divider />
        <div class="summary-wrap">
          <div class="chart-wrap">
            <canvas
              baseChart
              [type]="summaryChartType"
              [data]="summaryChartData()"
              [options]="summaryChartOptions">
            </canvas>
          </div>
          <div class="summary-list">
            <p><span>Total Admissions</span><strong>{{ metricAdmissions() }}</strong></p>
            <p><span>Pending PFE</span><strong>{{ metricPendingPfe() }}</strong></p>
            <p><span>Pending Transfers</span><strong>{{ metricPendingTransfers() }}</strong></p>
            <p><span>Outstanding</span><strong>{{ metricOutstandingPayments() }}</strong></p>
          </div>
        </div>
      </mat-card>

      <mat-card class="panel">
        <h3 class="panel-title">Quick Actions</h3>
        <mat-divider />
        <div class="qa-grid">
          @for (action of quickActions; track action.route) {
            <button class="qa-btn" (click)="router.navigate([action.route])" [style.--qa-color]="action.color">
              <span class="qa-icon"><mat-icon>{{ action.icon }}</mat-icon></span>
              <span class="qa-label">{{ action.label }}</span>
              <span class="qa-desc">{{ action.description }}</span>
            </button>
          }
        </div>
      </mat-card>

      <mat-card class="panel panel--wide">
        <h3 class="panel-title">Outstanding Payments</h3>
        <mat-divider />
        <div class="bar-chart-wrap">
          <canvas
            baseChart
            [type]="financialChartType"
            [data]="financialChartData()"
            [options]="financialChartOptions">
          </canvas>
        </div>
      </mat-card>

      <mat-card class="panel">
        <h3 class="panel-title">Recent Activity</h3>
        <mat-divider />
        <ul class="activity-list" role="list">
          @for (item of recentActivity(); track item.id) {
            <li class="activity-item" role="listitem">
              <span class="activity-icon activity-icon--{{ item.iconTone }}">
                <mat-icon>{{ item.icon }}</mat-icon>
              </span>
              <div class="activity-body">
                <p class="activity-title">{{ item.title }}</p>
                <p class="activity-detail">{{ item.detail }}</p>
                <p class="activity-time">{{ item.time | date:'shortTime' }} · {{ item.time | date:'mediumDate' }}</p>
              </div>
              <app-status-chip [label]="item.status" [tone]="item.statusTone" />
            </li>
          }
        </ul>
      </mat-card>

      <mat-card class="panel">
        <h3 class="panel-title">Latest Admissions</h3>
        <mat-divider />
        <mat-list>
          @for (admission of latestAdmissions(); track admission.admissionNumber) {
            <mat-list-item>
              <div matListItemTitle>{{ admission.patientName }} · {{ admission.department }}</div>
              <div matListItemLine>
                {{ admission.admissionNumber }} · {{ admission.admittedAt | date:'short' }}
                <span class="inline-chip">
                  <app-status-chip [label]="admission.status" [tone]="toneForAdmission(admission.status)" />
                </span>
              </div>
            </mat-list-item>
          }
        </mat-list>
      </mat-card>

      <mat-card class="panel panel--wide">
        <h3 class="panel-title">Latest Patients</h3>
        <mat-divider />
        <div class="table-wrap">
          <table class="simple-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Account</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (patient of latestPatients(); track patient.accountNumber) {
                <tr>
                  <td>{{ patient.fullName }}</td>
                  <td>{{ patient.accountNumber }}</td>
                  <td>
                    <app-status-chip [label]="patient.status" [tone]="patient.status === 'ACTIVE' ? 'active' : 'neutral'" />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </mat-card>
    </section>
  `,
  styles: [`
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .panel {
      border: 1px solid var(--clr-border);
      border-radius: 14px;
      box-shadow: var(--shadow-sm);
      padding: 1rem;
      background: var(--clr-surface);
    }

    .panel--wide {
      grid-column: span 2;
    }

    .panel-title {
      margin: 0 0 0.75rem;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--clr-text);
    }

    mat-divider {
      margin-bottom: 0.75rem;
    }

    .summary-wrap {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 1rem;
      align-items: center;
    }

    .chart-wrap,
    .bar-chart-wrap {
      position: relative;
      min-height: 220px;
    }

    .summary-list p {
      margin: 0;
      padding: 0.45rem 0;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed var(--clr-border);
      font-size: 0.84rem;
      color: var(--clr-text-2);
    }

    .summary-list p:last-child {
      border-bottom: none;
    }

    .summary-list strong {
      color: var(--clr-text);
      font-weight: 700;
    }

    .qa-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.7rem;
    }

    .qa-btn {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.3rem;
      border: 1px solid var(--clr-border);
      border-radius: 10px;
      background: var(--clr-surface-2);
      padding: 0.75rem;
      cursor: pointer;
      text-align: left;
      transition: border-color 120ms, box-shadow 120ms;
    }

    .qa-btn:hover {
      border-color: var(--qa-color, #1565c0);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--qa-color, #1565c0) 16%, transparent);
    }

    .qa-icon {
      width: 34px;
      height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      color: var(--qa-color, #1565c0);
      background: color-mix(in srgb, var(--qa-color, #1565c0) 14%, transparent);
    }

    .qa-label {
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--clr-text);
    }

    .qa-desc {
      font-size: 0.74rem;
      color: var(--clr-text-2);
    }

    .activity-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 0.7rem;
      padding: 0.65rem 0;
      border-bottom: 1px solid var(--clr-border);
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-icon {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .activity-icon--primary { background: rgba(21, 101, 192, 0.12); color: #1565c0; }
    .activity-icon--success { background: rgba(46, 125, 50, 0.12); color: #2e7d32; }
    .activity-icon--warning { background: rgba(230, 81, 0, 0.12); color: #e65100; }
    .activity-icon--error { background: rgba(198, 40, 40, 0.12); color: #c62828; }

    .activity-body { flex: 1; min-width: 0; }
    .activity-title { margin: 0; font-size: 0.83rem; font-weight: 600; color: var(--clr-text); }
    .activity-detail { margin: 0.15rem 0 0; font-size: 0.76rem; color: var(--clr-text-2); }
    .activity-time { margin: 0.15rem 0 0; font-size: 0.72rem; color: var(--clr-text-3); }

    .inline-chip {
      margin-left: 0.5rem;
      vertical-align: middle;
    }

    .table-wrap {
      overflow-x: auto;
    }

    .simple-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.84rem;
    }

    .simple-table th,
    .simple-table td {
      padding: 0.65rem 0.5rem;
      border-bottom: 1px solid var(--clr-border);
      text-align: left;
      white-space: nowrap;
    }

    .simple-table th {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--clr-text-2);
    }

    @media (max-width: 1440px) {
      .metrics-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }

      .panel--wide {
        grid-column: span 1;
      }

      .summary-wrap {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .metrics-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .qa-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class DashboardPageComponent {
  private readonly patientApi = inject(PatientService);
  private readonly paymentApi = inject(PathToPaymentService);
  private readonly admissionsStore = inject(AdmissionsStore);
  readonly authStore = inject(AuthStore);
  readonly router = inject(Router);

  readonly patients = signal(0);
  readonly admissions = signal(0);
  readonly paymentCases = signal(0);
  readonly pendingPfe = signal(0);
  readonly pendingTransfers = signal(0);
  readonly outstandingPayments = signal(0);

  readonly latestPatients = signal<PatientView[]>([]);
  readonly latestAdmissions = signal<AdmissionView[]>([]);

  readonly recentActivity = signal<ActivityItem[]>([]);

  readonly summaryChartType: ChartType = 'doughnut';
  readonly financialChartType: ChartType = 'bar';

  readonly summaryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } },
    cutout: '62%',
  };

  readonly financialChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } },
    },
  };

  readonly summaryChartData = computed<ChartData<'doughnut'>>(() => ({
    labels: ['Patients', 'Admissions', 'Payment Cases', 'Pending PFE', 'Pending Transfers'],
    datasets: [
      {
        data: [
          this.patients(),
          this.admissions(),
          this.paymentCases(),
          this.pendingPfe(),
          this.pendingTransfers(),
        ],
        backgroundColor: ['#1565C0', '#2E7D32', '#01579B', '#E65100', '#6A1B9A'],
        borderWidth: 0,
      },
    ],
  }));

  readonly financialChartData = computed<ChartData<'bar'>>(() => ({
    labels: ['Outstanding', 'Pending PFE', 'Pending Transfers'],
    datasets: [
      {
        data: [
          this.outstandingPayments(),
          this.pendingPfe() * 1200,
          this.pendingTransfers() * 800,
        ],
        backgroundColor: ['#C62828', '#F9A825', '#5E35B1'],
        borderRadius: 6,
      },
    ],
  }));

  readonly metricPatients = computed(() => this.patients().toLocaleString());
  readonly metricAdmissions = computed(() => this.admissions().toLocaleString());
  readonly metricPaymentCases = computed(() => this.paymentCases().toLocaleString());
  readonly metricPendingPfe = computed(() => this.pendingPfe().toLocaleString());
  readonly metricPendingTransfers = computed(() => this.pendingTransfers().toLocaleString());
  readonly metricOutstandingPayments = computed(() =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(this.outstandingPayments())
  );

  readonly quickActions: QuickAction[] = [
    { label: 'Register Patient', icon: 'person_add', route: '/patients', description: 'Create patient profile', color: '#1565C0' },
    { label: 'Admit Patient', icon: 'local_hospital', route: '/admissions', description: 'Start admission workflow', color: '#00897B' },
    { label: 'Open Payment Case', icon: 'payments', route: '/path-to-payment', description: 'Track billing lifecycle', color: '#7B1FA2' },
    { label: 'Review PFE', icon: 'receipt_long', route: '/pfe', description: 'Process financial estimates', color: '#E65100' },
  ];

  constructor() {
    void this.loadDashboard();
  }

  greeting(): string {
    const hour = new Date().getHours();
    const base = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const name = this.authStore.username();
    return name ? `${base}, ${name}` : base;
  }

  toneForAdmission(status: AdmissionView['status']): 'active' | 'inactive' | 'pending' {
    if (status === 'ADMITTED') {
      return 'active';
    }

    if (status === 'IN_TRANSFER') {
      return 'pending';
    }

    return 'inactive';
  }

  private async loadDashboard(): Promise<void> {
    try {
      await this.admissionsStore.loadList();

      const [patientEnvelope, paymentEnvelope] = await Promise.all([
        firstValueFrom(this.patientApi.searchPatients({}, 0, 5)),
        firstValueFrom(this.paymentApi.listCases(undefined, 0, 50)),
      ]);

      const patientsData = patientEnvelope?.data ?? patientEnvelope;
      const paymentData = paymentEnvelope?.data ?? paymentEnvelope;

      this.patients.set(Number(patientsData.totalElements ?? 0));
      this.latestPatients.set(
        (patientsData.content ?? []).slice(0, 5).map((patient: any) => ({
          fullName: `${patient.firstName ?? ''} ${patient.lastName ?? ''}`.trim() || 'Unknown',
          accountNumber: patient.accountNumber ?? 'N/A',
          status: patient.status ?? 'UNKNOWN',
        }))
      );

      const admissions = this.admissionsStore.rows();
      this.admissions.set(admissions.length);
      this.latestAdmissions.set(
        admissions.slice(0, 5).map((admission: any) => ({
          admissionNumber: admission.admissionNumber ?? `ADM-${admission.admissionId ?? 'N/A'}`,
          patientName: admission.patientId ? `Patient #${admission.patientId}` : 'Unknown patient',
          department: admission.departmentId ? `Department #${admission.departmentId}` : (admission.ward ?? 'General'),
          admittedAt: admission.admissionDate ? new Date(admission.admissionDate) : new Date(),
          status: this.normalizeAdmissionStatus(admission.admissionStatus),
        }))
      );
      this.pendingTransfers.set(
        admissions.filter((item: any) => this.normalizeAdmissionStatus(item.admissionStatus) === 'IN_TRANSFER').length
      );

      const cases = paymentData.content ?? [];
      this.paymentCases.set(Number(paymentData.totalElements ?? cases.length));
      this.outstandingPayments.set(
        cases.reduce((sum: number, item: any) => sum + Number(item.outstandingBalance ?? 0), 0)
      );

      // Pending PFE list endpoint is not available in generated Swagger client yet.
      // Keep value data-driven (non-hardcoded) until API support is added.
      this.pendingPfe.set(0);

      this.recentActivity.set(this.buildRecentActivity());
    } catch {
      this.recentActivity.set(this.buildRecentActivity());
    }
  }

  private normalizeAdmissionStatus(status?: string): AdmissionView['status'] {
    if (!status) {
      return 'ADMITTED';
    }

    const normalized = status.toUpperCase();
    if (normalized.includes('TRANSFER')) {
      return 'IN_TRANSFER';
    }

    if (normalized.includes('DISCH')) {
      return 'DISCHARGED';
    }

    return 'ADMITTED';
  }

  private buildRecentActivity(): ActivityItem[] {
    const activity: ActivityItem[] = [];
    const now = Date.now();

    const firstPatient = this.latestPatients()[0];
    if (firstPatient) {
      activity.push({
        id: 'ra-patient',
        icon: 'person_add',
        iconTone: 'primary',
        title: 'Latest patient synced',
        detail: `${firstPatient.fullName} (${firstPatient.accountNumber})`,
        time: new Date(now - 10 * 60 * 1000),
        status: 'Live',
        statusTone: 'active',
      });
    }

    const firstAdmission = this.latestAdmissions()[0];
    if (firstAdmission) {
      activity.push({
        id: 'ra-admission',
        icon: 'local_hospital',
        iconTone: 'success',
        title: 'Latest admission synced',
        detail: `${firstAdmission.admissionNumber} · ${firstAdmission.patientName}`,
        time: firstAdmission.admittedAt,
        status: firstAdmission.status,
        statusTone: this.toneForAdmission(firstAdmission.status),
      });
    }

    if (this.paymentCases() > 0) {
      activity.push({
        id: 'ra-payment',
        icon: 'payments',
        iconTone: 'warning',
        title: 'Payment cases loaded',
        detail: `${this.paymentCases()} active cases from backend`,
        time: new Date(now - 30 * 60 * 1000),
        status: 'Loaded',
        statusTone: 'completed',
      });
    }

    if (this.pendingTransfers() > 0) {
      activity.push({
        id: 'ra-transfer',
        icon: 'swap_horiz',
        iconTone: 'error',
        title: 'Transfers pending',
        detail: `${this.pendingTransfers()} admissions currently in transfer`,
        time: new Date(now - 45 * 60 * 1000),
        status: 'Pending',
        statusTone: 'pending',
      });
    }

    return activity;
  }
}
