import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusChipComponent, type StatusTone } from '../../shared/ui/status-chip/status-chip.component';
import { AdmissionsStore } from '../../state/admissions.store';
import { DischargeDialogComponent, type DischargeDialogResult } from './discharge-dialog.component';

function toneForStatus(status: string): StatusTone {
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
  selector: 'app-admissions-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatStepperModule,
    MatTableModule,
    PageHeaderComponent,
    StatusChipComponent,
  ],
  template: `
    <app-page-header title="Admissions" subtitle="Admission list, admit/discharge workflow, and patient timeline access."></app-page-header>

    <section class="stats-grid">
      <mat-card class="stat-card">
        <p class="label">Admitted</p>
        <h3>{{ store.admittedCount() }}</h3>
      </mat-card>
      <mat-card class="stat-card">
        <p class="label">In Transfer</p>
        <h3>{{ store.transferCount() }}</h3>
      </mat-card>
      <mat-card class="stat-card">
        <p class="label">Discharged</p>
        <h3>{{ store.dischargedCount() }}</h3>
      </mat-card>
    </section>

    @if (store.error()) {
      <div class="feedback-banner feedback-banner--error" role="alert">
        <mat-icon>error_outline</mat-icon>
        <span>{{ store.error() }}</span>
      </div>
    }

    <div class="layout-grid">
      <mat-card class="panel list-panel">
        <div class="panel-head">
          <h3>Admission List</h3>
          <div class="list-actions">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Filter</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput [formControl]="filterControl" placeholder="Admission #, patient #, doctor" />
            </mat-form-field>
            <button mat-stroked-button (click)="refresh()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
          </div>
        </div>

        <table mat-table [dataSource]="filteredAdmissions()" class="admission-table">
          <ng-container matColumnDef="admissionId">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let row">{{ row.admissionId }}</td>
          </ng-container>

          <ng-container matColumnDef="patientId">
            <th mat-header-cell *matHeaderCellDef>Patient</th>
            <td mat-cell *matCellDef="let row">#{{ row.patientId || 'N/A' }}</td>
          </ng-container>

          <ng-container matColumnDef="admissionNumber">
            <th mat-header-cell *matHeaderCellDef>Admission #</th>
            <td mat-cell *matCellDef="let row">{{ row.admissionNumber || 'N/A' }}</td>
          </ng-container>

          <ng-container matColumnDef="doctor">
            <th mat-header-cell *matHeaderCellDef>Doctor</th>
            <td mat-cell *matCellDef="let row">{{ row.doctor || 'N/A' }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let row">
              <app-status-chip [label]="resolvedStatus(row.admissionStatus)" [tone]="toneForStatus(resolvedStatus(row.admissionStatus))" />
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let row" class="actions-cell">
              <a mat-icon-button [routerLink]="['/admissions', row.admissionId]" aria-label="Admission details">
                <mat-icon>visibility</mat-icon>
              </a>
              <button mat-icon-button color="primary" (click)="openDischargeDialog(row.admissionId)">
                <mat-icon>logout</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let _row; columns: columns"></tr>
        </table>

        @if (filteredAdmissions().length === 0 && !store.isLoading()) {
          <p class="empty-text"><mat-icon>search_off</mat-icon>No admissions found.</p>
        }
      </mat-card>

      <mat-card class="panel stepper-panel">
        <div class="admit-head">
          <div>
            <h3>Admit Patient</h3>
            <p class="admit-subtitle">Fill core details in 3 short steps. Use presets for faster entry.</p>
          </div>
          <div class="preset-actions">
            <button mat-stroked-button type="button" (click)="applyPreset('INPATIENT')">Inpatient Preset</button>
            <button mat-stroked-button type="button" (click)="applyPreset('EMERGENCY')">Emergency Preset</button>
          </div>
        </div>

        <div class="admit-progress">
          <div class="admit-progress__meta">
            <span>Form Completion</span>
            <strong>{{ stepProgress() }}%</strong>
          </div>
          <mat-progress-bar mode="determinate" [value]="stepProgress()"></mat-progress-bar>
        </div>

        <mat-stepper orientation="vertical" [linear]="true">
          <mat-step [stepControl]="identityForm" label="Patient & Facility">
            <form [formGroup]="identityForm" class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Patient ID *</mat-label>
                <mat-icon matPrefix>person</mat-icon>
                <input matInput type="number" formControlName="patientId" placeholder="e.g. 1001" />
                <mat-hint>Registered patient identifier</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Facility ID *</mat-label>
                <mat-icon matPrefix>business</mat-icon>
                <input matInput type="number" formControlName="facilityId" placeholder="e.g. 1" />
                <mat-hint>Hospital or clinic facility id</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Department ID *</mat-label>
                <mat-icon matPrefix>apartment</mat-icon>
                <input matInput type="number" formControlName="departmentId" placeholder="e.g. 12" />
                <mat-hint>Department where patient is admitted</mat-hint>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Admission Number *</mat-label>
                <mat-icon matPrefix>badge</mat-icon>
                <input matInput formControlName="admissionNumber" placeholder="ADM-2026-001" />
                <button mat-icon-button matSuffix type="button" aria-label="Generate admission number" (click)="generateAdmissionNumber()">
                  <mat-icon>auto_fix_high</mat-icon>
                </button>
              </mat-form-field>
              <div class="step-actions">
                <button mat-flat-button matStepperNext [disabled]="identityForm.invalid">Continue</button>
              </div>
            </form>
          </mat-step>

          <mat-step [stepControl]="clinicalForm" label="Clinical Details">
            <form [formGroup]="clinicalForm" class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Attending Doctor *</mat-label>
                <mat-icon matPrefix>medical_services</mat-icon>
                <input matInput formControlName="doctor" placeholder="Dr. Name" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Admission Type *</mat-label>
                <mat-select formControlName="admissionType">
                  <mat-option value="INPATIENT">Inpatient</mat-option>
                  <mat-option value="OUTPATIENT">Outpatient</mat-option>
                  <mat-option value="EMERGENCY">Emergency</mat-option>
                  <mat-option value="DAY_SURGERY">Day Surgery</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Admission Date/Time *</mat-label>
                <mat-icon matPrefix>event</mat-icon>
                <input matInput type="datetime-local" formControlName="admissionDateLocal" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Reason *</mat-label>
                <mat-icon matPrefix>description</mat-icon>
                <input matInput formControlName="reason" placeholder="Primary clinical reason for admission" />
              </mat-form-field>
              <div class="step-actions">
                <button mat-stroked-button matStepperPrevious>Back</button>
                <button mat-flat-button matStepperNext [disabled]="clinicalForm.invalid">Continue</button>
              </div>
            </form>
          </mat-step>

          <mat-step [stepControl]="locationForm" label="Location & Submit">
            <form [formGroup]="locationForm" class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Ward</mat-label>
                <mat-icon matPrefix>meeting_room</mat-icon>
                <input matInput formControlName="ward" placeholder="e.g. Cardiology A" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Room</mat-label>
                <mat-icon matPrefix>door_front</mat-icon>
                <input matInput formControlName="room" placeholder="e.g. 402" />
              </mat-form-field>
              <div class="review-box full-width">
                <p class="review-title">Review</p>
                <div class="review-grid">
                  <div><span>Patient</span><strong>#{{ identityForm.value.patientId || '-' }}</strong></div>
                  <div><span>Facility</span><strong>#{{ identityForm.value.facilityId || '-' }}</strong></div>
                  <div><span>Department</span><strong>#{{ identityForm.value.departmentId || '-' }}</strong></div>
                  <div><span>Type</span><strong>{{ clinicalForm.value.admissionType || '-' }}</strong></div>
                </div>
              </div>
              <div class="step-actions">
                <button mat-stroked-button matStepperPrevious>Back</button>
                <button mat-flat-button color="primary" [disabled]="!canSubmitAdmit() || store.isLoading()" (click)="submitAdmit()">
                  <mat-icon>{{ store.isLoading() ? 'hourglass_top' : 'login' }}</mat-icon>
                  Admit Patient
                </button>
              </div>
            </form>
          </mat-step>
        </mat-stepper>
      </mat-card>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat-card {
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      padding: 0.9rem;
      background: var(--clr-surface);
    }

    .label {
      margin: 0;
      color: var(--clr-text-2);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: 0.72rem;
    }

    .stat-card h3 {
      margin: 0.35rem 0 0;
      font-size: 1.5rem;
      color: var(--clr-text);
    }

    .feedback-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.7rem 0.9rem;
      border-radius: 10px;
      margin-bottom: 1rem;
    }

    .feedback-banner--error {
      background: rgba(198, 40, 40, 0.08);
      border: 1px solid rgba(198, 40, 40, 0.2);
      color: #c62828;
    }

    .layout-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
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

    .admit-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }

    .admit-subtitle {
      margin: 0.2rem 0 0;
      font-size: 0.8rem;
      color: var(--clr-text-2);
    }

    .preset-actions {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
    }

    .admit-progress {
      margin: 0.2rem 0 0.75rem;
      padding: 0.6rem 0.7rem;
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-md);
      background: var(--clr-surface-2);
    }

    .admit-progress__meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.35rem;
      font-size: 0.78rem;
      color: var(--clr-text-2);
    }

    .panel-head {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      align-items: flex-start;
      margin-bottom: 0.65rem;
    }

    .list-actions {
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .search-field {
      width: 320px;
      max-width: 100%;
    }

    .admission-table {
      width: 100%;
    }

    .actions-cell {
      white-space: nowrap;
    }

    .empty-text {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: center;
      color: var(--clr-text-2);
      padding: 1.25rem;
      margin: 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.6rem;
      margin-top: 0.4rem;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .step-actions {
      display: flex;
      gap: 0.5rem;
      grid-column: 1 / -1;
      margin-top: 0.2rem;
      position: sticky;
      bottom: 0;
      background: var(--clr-surface);
      padding-top: 0.45rem;
    }

    .review-box {
      border: 1px dashed var(--clr-border);
      border-radius: var(--radius-md);
      padding: 0.7rem;
      background: var(--clr-surface-2);
    }

    .review-title {
      margin: 0 0 0.45rem;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--clr-text-2);
      font-weight: 600;
    }

    .review-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.5rem;

      span {
        display: block;
        font-size: 0.74rem;
        color: var(--clr-text-2);
      }

      strong {
        font-size: 0.84rem;
        color: var(--clr-text);
      }
    }

    @media (max-width: 1200px) {
      .layout-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .panel-head,
      .list-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field,
      .form-grid {
        width: 100%;
        grid-template-columns: 1fr;
      }

      .review-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class AdmissionsPageComponent implements OnInit {
  readonly store = inject(AdmissionsStore);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);

  readonly columns = ['admissionId', 'patientId', 'admissionNumber', 'doctor', 'status', 'actions'];
  readonly toneForStatus = toneForStatus;

  readonly filterControl = this.fb.nonNullable.control('');

  readonly identityForm = this.fb.group({
    patientId: [null as number | null, [Validators.required, Validators.min(1)]],
    facilityId: [null as number | null, [Validators.required, Validators.min(1)]],
    departmentId: [null as number | null, [Validators.required, Validators.min(1)]],
    admissionNumber: ['', [Validators.required]],
  });

  readonly clinicalForm = this.fb.nonNullable.group({
    doctor: ['', [Validators.required]],
    admissionType: ['INPATIENT', [Validators.required]],
    admissionDateLocal: [this.nowLocalDateTime(), [Validators.required]],
    reason: ['', [Validators.required]],
  });

  readonly locationForm = this.fb.nonNullable.group({
    ward: [''],
    room: [''],
  });

  readonly filteredAdmissions = computed(() => {
    const term = this.filterControl.value.trim().toLowerCase();
    if (!term) {
      return this.store.rows();
    }

    return this.store.rows().filter((row) => {
      const haystack = [
        row.admissionId,
        row.patientId,
        row.admissionNumber,
        row.doctor,
        row.admissionStatus,
      ]
        .filter((item) => item !== undefined && item !== null)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  });

  readonly stepProgress = computed(() => {
    let completed = 0;
    if (this.identityForm.valid) {
      completed += 1;
    }
    if (this.clinicalForm.valid) {
      completed += 1;
    }
    if (this.locationForm.valid) {
      completed += 1;
    }

    return Math.round((completed / 3) * 100);
  });

  async ngOnInit(): Promise<void> {
    await this.store.loadList();
  }

  resolvedStatus(rawStatus?: string): string {
    return this.store.resolveStatus(rawStatus);
  }

  canSubmitAdmit(): boolean {
    return this.identityForm.valid && this.clinicalForm.valid && this.locationForm.valid;
  }

  generateAdmissionNumber(): void {
    const generated = `ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.identityForm.patchValue({ admissionNumber: generated });
  }

  applyPreset(type: 'INPATIENT' | 'EMERGENCY'): void {
    if (type === 'EMERGENCY') {
      this.clinicalForm.patchValue({
        admissionType: 'EMERGENCY',
        reason: this.clinicalForm.value.reason || 'Emergency intake',
      });
      this.locationForm.patchValue({
        ward: this.locationForm.value.ward || 'Emergency',
      });
      return;
    }

    this.clinicalForm.patchValue({
      admissionType: 'INPATIENT',
      reason: this.clinicalForm.value.reason || 'Inpatient admission',
    });
  }

  async submitAdmit(): Promise<void> {
    if (!this.canSubmitAdmit()) {
      this.identityForm.markAllAsTouched();
      this.clinicalForm.markAllAsTouched();
      return;
    }

    const identity = this.identityForm.getRawValue();
    const clinical = this.clinicalForm.getRawValue();
    const location = this.locationForm.getRawValue();

    if (!identity.patientId || !identity.facilityId || !identity.departmentId) {
      this.identityForm.markAllAsTouched();
      return;
    }

    const admitted = await this.store.admit({
      patientId: Number(identity.patientId),
      facilityId: Number(identity.facilityId),
      departmentId: Number(identity.departmentId),
      admissionNumber: identity.admissionNumber ?? '',
      doctor: clinical.doctor,
      admissionType: clinical.admissionType,
      reason: clinical.reason,
      admissionDate: clinical.admissionDateLocal ? new Date(clinical.admissionDateLocal).toISOString() : new Date().toISOString(),
      ward: location.ward || undefined,
      room: location.room || undefined,
    });

    if (admitted) {
      this.identityForm.reset({ patientId: null, facilityId: null, departmentId: null, admissionNumber: '' });
      this.clinicalForm.reset({ doctor: '', admissionType: 'INPATIENT', admissionDateLocal: this.nowLocalDateTime(), reason: '' });
      this.locationForm.reset({ ward: '', room: '' });
      await this.store.loadList();
    }
  }

  private nowLocalDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  async openDischargeDialog(admissionId?: number): Promise<void> {
    if (!admissionId) {
      return;
    }

    const dialogRef = this.dialog.open(DischargeDialogComponent, {
      width: '460px',
      data: { admissionId },
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    const payload = result as DischargeDialogResult | undefined;
    if (!payload) {
      return;
    }

    const discharged = await this.store.discharge(admissionId, {
      disposition: payload.disposition,
      reason: payload.reason,
      summary: payload.summary,
      dischargeDate: new Date().toISOString(),
    });

    if (discharged) {
      await this.store.loadList();
    }
  }

  async refresh(): Promise<void> {
    await this.store.loadList();
  }
}
