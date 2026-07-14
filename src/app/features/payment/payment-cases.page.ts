import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiFacadeService } from '../../core/services/api-facade.service';

@Component({
  selector: 'app-payment-cases-page',
  standalone: true,
  imports: [AsyncPipe, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2>Path to Payment</h2>

    <mat-card class="block">
      <h3>Create Case</h3>
      <div class="row">
        <mat-form-field><mat-label>Patient ID</mat-label><input matInput type="number" [(ngModel)]="patientId" /></mat-form-field>
        <mat-form-field><mat-label>Current Step</mat-label><input matInput [(ngModel)]="currentStep" /></mat-form-field>
        <mat-form-field><mat-label>Total Charges</mat-label><input matInput type="number" [(ngModel)]="totalCharges" /></mat-form-field>
        <mat-form-field><mat-label>Allowed Amount</mat-label><input matInput type="number" [(ngModel)]="allowedAmount" /></mat-form-field>
        <mat-form-field><mat-label>Insurance Responsibility</mat-label><input matInput type="number" [(ngModel)]="insuranceResponsibility" /></mat-form-field>
        <mat-form-field><mat-label>Patient Responsibility</mat-label><input matInput type="number" [(ngModel)]="patientResponsibility" /></mat-form-field>
      </div>
      <button mat-flat-button color="primary" type="button" (click)="createCase()">Create Payment Case</button>
      @if (message()) {
        <p>{{ message() }}</p>
      }
    </mat-card>

    <mat-card class="block">
      <h3>Latest Cases</h3>
      <ul>
        @for (row of cases$ | async; track row.pathToPaymentCaseId) {
          <li>#{{ row.pathToPaymentCaseId }} - {{ row.paymentCaseRef || '-' }} - {{ row.paymentStatus || '-' }}</li>
        }
      </ul>
    </mat-card>
  `,
  styles: ['.block{margin-block:1rem}.row{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.75rem;}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentCasesPageComponent {
  private readonly api = inject(ApiFacadeService);
  readonly message = signal('');

  patientId = 0;
  currentStep = 'INTAKE';
  totalCharges = 0;
  allowedAmount = 0;
  insuranceResponsibility = 0;
  patientResponsibility = 0;

  readonly cases$ = this.api.listPaymentCases().pipe(map((response) => response.content));

  createCase(): void {
    this.api
      .createPaymentCase({
        patientId: this.patientId,
        currentStep: this.currentStep,
        totalCharges: this.totalCharges,
        allowedAmount: this.allowedAmount,
        insuranceResponsibility: this.insuranceResponsibility,
        patientResponsibility: this.patientResponsibility,
      })
      .subscribe({ next: () => this.message.set('Payment case created'), error: (err) => this.message.set(String(err.message ?? err)) });
  }
}


