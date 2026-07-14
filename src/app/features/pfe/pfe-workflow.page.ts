import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiFacadeService } from '../../core/services/api-facade.service';

@Component({
  selector: 'app-pfe-workflow-page',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2>PFE Workflow</h2>
    <mat-card class="block">
      <h3>Submit Case</h3>
      <div class="row">
        <mat-form-field><mat-label>Patient ID</mat-label><input matInput type="number" [(ngModel)]="patientId" /></mat-form-field>
        <mat-form-field><mat-label>Comment</mat-label><input matInput [(ngModel)]="comment" /></mat-form-field>
      </div>
      <button mat-flat-button color="primary" type="button" (click)="submit()">Submit</button>
    </mat-card>

    <mat-card class="block">
      <h3>Workflow Action</h3>
      <div class="row">
        <mat-form-field><mat-label>Case ID</mat-label><input matInput type="number" [(ngModel)]="caseId" /></mat-form-field>
        <mat-form-field><mat-label>Comment</mat-label><input matInput [(ngModel)]="actionComment" /></mat-form-field>
      </div>
      <div class="btn-row">
        <button mat-flat-button color="primary" type="button" (click)="review()">Review</button>
        <button mat-flat-button color="primary" type="button" (click)="approve()">Approve</button>
        <button mat-flat-button color="warn" type="button" (click)="reject()">Reject</button>
      </div>
      @if (message()) {
        <p>{{ message() }}</p>
      }
    </mat-card>
  `,
  styles: ['.block{margin-block:1rem}.row{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.75rem;}.btn-row{display:flex;gap:.75rem;}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PfeWorkflowPageComponent {
  private readonly api = inject(ApiFacadeService);
  readonly message = signal('');

  patientId = 0;
  comment = '';
  caseId = 0;
  actionComment = '';

  submit(): void {
    this.api
      .submitPfe({ patientId: this.patientId, comment: this.comment })
      .subscribe({ next: () => this.message.set('PFE submitted'), error: (err) => this.message.set(String(err.message ?? err)) });
  }

  review(): void {
    this.api
      .reviewPfe(this.caseId, { comment: this.actionComment })
      .subscribe({ next: () => this.message.set('PFE moved to review'), error: (err) => this.message.set(String(err.message ?? err)) });
  }

  approve(): void {
    this.api
      .approvePfe(this.caseId, { comment: this.actionComment })
      .subscribe({ next: () => this.message.set('PFE approved'), error: (err) => this.message.set(String(err.message ?? err)) });
  }

  reject(): void {
    this.api
      .rejectPfe(this.caseId, { comment: this.actionComment, denied: false })
      .subscribe({ next: () => this.message.set('PFE rejected'), error: (err) => this.message.set(String(err.message ?? err)) });
  }
}

