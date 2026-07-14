import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { PatientsStore } from '../../state/patients.store';

@Component({
  selector: 'app-patients-page',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
  ],
  template: `
    <h2>Patients</h2>

    <mat-card class="block">
      <h3>Search</h3>
      <div class="row">
        <mat-form-field appearance="outline">
          <mat-label>Search</mat-label>
          <input matInput [(ngModel)]="search" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="status">
            <mat-option value="">All</mat-option>
            <mat-option value="ACTIVE">Active</mat-option>
            <mat-option value="INACTIVE">Inactive</mat-option>
            <mat-option value="DECEASED">Deceased</mat-option>
            <mat-option value="MERGED">Merged</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-flat-button color="primary" type="button" (click)="load()">Search</button>
      </div>
    </mat-card>

    <mat-card class="block">
      <h3>Register Patient</h3>
      <div class="row">
        <mat-form-field appearance="outline"><mat-label>Account Number</mat-label><input matInput [(ngModel)]="accountNumber" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>First Name</mat-label><input matInput [(ngModel)]="firstName" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Last Name</mat-label><input matInput [(ngModel)]="lastName" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>DOB</mat-label><input matInput type="date" [(ngModel)]="dateOfBirth" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Gender</mat-label><input matInput [(ngModel)]="gender" /></mat-form-field>
      </div>
      <button mat-flat-button color="primary" type="button" (click)="createPatient()">Create</button>
      @if (patientsStore.error()) {
        <p class="error">{{ patientsStore.error() }}</p>
      }
    </mat-card>

    <mat-card class="block">
      <h3>Result</h3>
      <table mat-table [dataSource]="patientsStore.rows()">
        <ng-container matColumnDef="patientId">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let row">{{ row.patientId }}</td>
        </ng-container>
        <ng-container matColumnDef="fullName">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let row">{{ row.fullName || ((row.firstName || '') + ' ' + (row.lastName || '')) }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let row">{{ row.status || '-' }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    </mat-card>
  `,
  styles: [
    `
      .block { margin-block: 1rem; }
      .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; align-items: start; }
      .error { color: #b00020; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientsPageComponent {
  readonly patientsStore = inject<any>(PatientsStore);
  readonly displayedColumns = ['patientId', 'fullName', 'status'];

  search = '';
  status = '';

  accountNumber = '';
  firstName = '';
  lastName = '';
  dateOfBirth = '';
  gender = 'MALE';

  async load(): Promise<void> {
    this.patientsStore.setFilters(this.search, this.status);
    await this.patientsStore.load();
  }

  async createPatient(): Promise<void> {
    await this.patientsStore.create({
      accountNumber: this.accountNumber,
      firstName: this.firstName,
      lastName: this.lastName,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
    });
  }
}


