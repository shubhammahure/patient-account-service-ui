import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiFacadeService } from '../../core/services/api-facade.service';

@Component({
  selector: 'app-admissions-page',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2>Admissions</h2>
    <mat-card class="block">
      <h3>Admit Patient</h3>
      <div class="row">
        <mat-form-field><mat-label>Patient ID</mat-label><input matInput type="number" [(ngModel)]="patientId" /></mat-form-field>
        <mat-form-field><mat-label>Facility ID</mat-label><input matInput type="number" [(ngModel)]="facilityId" /></mat-form-field>
        <mat-form-field><mat-label>Department ID</mat-label><input matInput type="number" [(ngModel)]="departmentId" /></mat-form-field>
        <mat-form-field><mat-label>Admission Number</mat-label><input matInput [(ngModel)]="admissionNumber" /></mat-form-field>
        <mat-form-field><mat-label>Doctor</mat-label><input matInput [(ngModel)]="doctor" /></mat-form-field>
      </div>
      <button mat-flat-button color="primary" type="button" (click)="admit()">Admit</button>
    </mat-card>

    <mat-card class="block">
      <h3>Discharge</h3>
      <div class="row">
        <mat-form-field><mat-label>Admission ID</mat-label><input matInput type="number" [(ngModel)]="admissionId" /></mat-form-field>
        <mat-form-field><mat-label>Reason</mat-label><input matInput [(ngModel)]="reason" /></mat-form-field>
        <mat-form-field><mat-label>Disposition</mat-label><input matInput [(ngModel)]="disposition" /></mat-form-field>
      </div>
      <button mat-flat-button color="primary" type="button" (click)="discharge()">Discharge</button>
    </mat-card>

    @if (message()) {
      <p>{{ message() }}</p>
    }
  `,
  styles: ['.block{margin-block:1rem}.row{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.75rem;}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdmissionsPageComponent {
  private readonly api = inject(ApiFacadeService);

  readonly message = signal('');
  patientId = 0;
  facilityId = 0;
  departmentId = 0;
  admissionNumber = '';
  doctor = '';

  admissionId = 0;
  reason = '';
  disposition = 'HOME';

  admit(): void {
    this.api
      .admitPatient({
        patientId: this.patientId,
        facilityId: this.facilityId,
        departmentId: this.departmentId,
        admissionNumber: this.admissionNumber,
        admissionType: 'INPATIENT',
        doctor: this.doctor,
        admissionDate: new Date().toISOString(),
        reason: 'Portal admit flow',
      })
      .subscribe({ next: () => this.message.set('Admit request submitted'), error: (err) => this.message.set(String(err.message ?? err)) });
  }

  discharge(): void {
    this.api
      .dischargePatient(this.admissionId, {
        dischargeDate: new Date().toISOString(),
        reason: this.reason,
        disposition: this.disposition,
      })
      .subscribe({ next: () => this.message.set('Discharge request submitted'), error: (err) => this.message.set(String(err.message ?? err)) });
  }
}

