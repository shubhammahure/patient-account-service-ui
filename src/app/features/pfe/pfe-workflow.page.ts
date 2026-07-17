import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { firstValueFrom } from 'rxjs';
import { PfeWorkflowStore } from '../../state/pfe-workflow.store';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { PfeApprovalDialogComponent } from './pfe-approval-dialog.component';
import { PfeTimelineComponent } from './pfe-timeline.component';

const WORKFLOW_STEPS = ['SUBMITTED', 'REVIEW', 'APPROVED', 'REJECTED', 'DENIED'] as const;

type WorkflowStep = typeof WORKFLOW_STEPS[number];

@Component({
  selector: 'app-pfe-workflow-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    PageHeaderComponent,
    PfeTimelineComponent,
  ],
  template: `
    <app-page-header title="PFE Workflow" subtitle="Submit, review, approve, reject, and track audit history."></app-page-header>

    @if (store.error()) {
      <div class="feedback-banner feedback-banner--error" role="alert">
        <mat-icon>error_outline</mat-icon>
        <span>{{ store.error() }}</span>
      </div>
    }

    @if (store.info()) {
      <div class="feedback-banner" role="status">
        <mat-icon>check_circle</mat-icon>
        <span>{{ store.info() }}</span>
      </div>
    }

    <section class="status-grid">
      <mat-card class="panel">
        <div class="panel-header">
          <h3><mat-icon>account_tree</mat-icon> Workflow Status</h3>
          <span class="status-pill" [class.terminal]="isTerminalStatus()">{{ store.workflowStatus() }}</span>
        </div>

        <mat-stepper [selectedIndex]="statusStepIndex()" linear="false">
          @for (step of workflowSteps; track step) {
            <mat-step [label]="step"></mat-step>
          }
        </mat-stepper>
      </mat-card>

      <mat-card class="panel summary-card">
        <h3><mat-icon>analytics</mat-icon> Snapshot</h3>
        <div class="summary-grid">
          <div>
            <div class="label">Case ID</div>
            <div class="value">{{ store.currentCase()?.pfeCaseId ?? store.selectedCaseId() ?? '-' }}</div>
          </div>
          <div>
            <div class="label">Status</div>
            <div class="value">{{ store.workflowStatus() }}</div>
          </div>
          <div>
            <div class="label">Transitions</div>
            <div class="value">{{ store.history().length }}</div>
          </div>
          <div>
            <div class="label">Comments</div>
            <div class="value">{{ store.commentsCount() }}</div>
          </div>
        </div>
      </mat-card>
    </section>

    <mat-tab-group class="module-tabs" animationDuration="0ms">
      <mat-tab label="Submit">
        <mat-card class="panel">
          <h3><mat-icon>note_add</mat-icon> Submit</h3>

          <form [formGroup]="submitForm" class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Patient ID *</mat-label>
              <input matInput type="number" formControlName="patientId" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Admission ID</mat-label>
              <input matInput type="number" formControlName="admissionId" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Case Reference</mat-label>
              <input matInput formControlName="caseReference" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Priority</mat-label>
              <mat-select formControlName="priority">
                <mat-option value="LOW">Low</mat-option>
                <mat-option value="NORMAL">Normal</mat-option>
                <mat-option value="HIGH">High</mat-option>
                <mat-option value="URGENT">Urgent</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Owner User</mat-label>
              <input matInput formControlName="ownerUser" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Comment *</mat-label>
              <textarea matInput rows="3" formControlName="comment"></textarea>
            </mat-form-field>
          </form>

          <div class="actions">
            <button mat-stroked-button type="button" (click)="submitForm.reset(defaultSubmitForm)">Reset</button>
            <button mat-flat-button color="primary" type="button" [disabled]="submitForm.invalid || store.isActionInProgress()" (click)="submit()">
              <mat-icon>send</mat-icon>
              Submit Case
            </button>
          </div>
        </mat-card>
      </mat-tab>

      <mat-tab label="Review">
        <mat-card class="panel">
          <h3><mat-icon>rate_review</mat-icon> Review</h3>
          <form [formGroup]="actionForm" class="form-grid single-col">
            <mat-form-field appearance="outline">
              <mat-label>Case ID *</mat-label>
              <input matInput type="number" formControlName="caseId" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Review Comment *</mat-label>
              <textarea matInput rows="3" formControlName="comment"></textarea>
            </mat-form-field>
          </form>
          <div class="actions">
            <button mat-flat-button color="primary" type="button" [disabled]="actionForm.invalid || store.isActionInProgress()" (click)="review()">
              Move To Review
            </button>
          </div>
        </mat-card>
      </mat-tab>

      <mat-tab label="Approve">
        <mat-card class="panel">
          <h3><mat-icon>task_alt</mat-icon> Approve</h3>
          <p class="hint">Approval opens a dialog and stores the comment in audit history.</p>
          <form [formGroup]="caseIdForm" class="form-grid single-col">
            <mat-form-field appearance="outline">
              <mat-label>Case ID *</mat-label>
              <input matInput type="number" formControlName="caseId" />
            </mat-form-field>
          </form>
          <div class="actions">
            <button mat-flat-button color="primary" type="button" [disabled]="caseIdForm.invalid || store.isActionInProgress()" (click)="approve()">
              <mat-icon>check_circle</mat-icon>
              Approval Dialog
            </button>
          </div>
        </mat-card>
      </mat-tab>

      <mat-tab label="Reject">
        <mat-card class="panel">
          <h3><mat-icon>gpp_bad</mat-icon> Reject / Deny</h3>
          <form [formGroup]="caseIdForm" class="form-grid single-col">
            <mat-form-field appearance="outline">
              <mat-label>Case ID *</mat-label>
              <input matInput type="number" formControlName="caseId" />
            </mat-form-field>
          </form>

          <div class="actions">
            <button mat-stroked-button class="warn-btn" type="button" [disabled]="caseIdForm.invalid || store.isActionInProgress()" (click)="reject(false)">
              <mat-icon>cancel</mat-icon>
              Reject
            </button>
            <button mat-flat-button color="warn" type="button" [disabled]="caseIdForm.invalid || store.isActionInProgress()" (click)="reject(true)">
              <mat-icon>block</mat-icon>
              Deny
            </button>
          </div>
        </mat-card>
      </mat-tab>

      <mat-tab label="History">
        <section class="history-layout">
          <mat-card class="panel">
            <h3><mat-icon>history</mat-icon> Timeline</h3>
            <form [formGroup]="historyForm" class="history-controls">
              <mat-form-field appearance="outline">
                <mat-label>Case ID *</mat-label>
                <input matInput type="number" formControlName="caseId" />
              </mat-form-field>
              <button mat-flat-button color="primary" type="button" [disabled]="historyForm.invalid || store.isLoading()" (click)="loadHistory()">
                Load History
              </button>
            </form>
            <app-pfe-timeline [items]="store.history()" [currentStatus]="store.workflowStatus()"></app-pfe-timeline>
          </mat-card>

          <mat-card class="panel">
            <h3><mat-icon>comment</mat-icon> Comments</h3>
            @if (commentItems().length === 0) {
              <p class="hint">No comments available for this case.</p>
            }
            @for (item of commentItems(); track item.historyId ?? $index) {
              <article class="comment-item">
                <div class="comment-meta">{{ item.actionBy || 'System' }} - {{ item.actionAt | date: 'medium' }}</div>
                <div>{{ item.comment }}</div>
              </article>
            }
          </mat-card>
        </section>

        <mat-card class="panel table-panel">
          <h3><mat-icon>table_view</mat-icon> Audit History</h3>
          <table mat-table [dataSource]="store.history()" class="history-table">
            <ng-container matColumnDef="actionAt">
              <th mat-header-cell *matHeaderCellDef>At</th>
              <td mat-cell *matCellDef="let row">{{ row.actionAt | date: 'short' }}</td>
            </ng-container>
            <ng-container matColumnDef="fromStatus">
              <th mat-header-cell *matHeaderCellDef>From</th>
              <td mat-cell *matCellDef="let row">{{ row.fromStatus || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="toStatus">
              <th mat-header-cell *matHeaderCellDef>To</th>
              <td mat-cell *matCellDef="let row">{{ row.toStatus || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="actionBy">
              <th mat-header-cell *matHeaderCellDef>By</th>
              <td mat-cell *matCellDef="let row">{{ row.actionBy || '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="comment">
              <th mat-header-cell *matHeaderCellDef>Comment</th>
              <td mat-cell *matCellDef="let row">{{ row.comment || '-' }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="auditColumns"></tr>
            <tr mat-row *matRowDef="let _row; columns: auditColumns"></tr>
          </table>
        </mat-card>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [`
    .feedback-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      background: rgba(46, 125, 50, 0.1);
      border: 1px solid rgba(46, 125, 50, 0.2);
      color: #2e7d32;
      font-size: 0.88rem;
      margin-bottom: 1rem;
    }

    .feedback-banner--error {
      background: rgba(198, 40, 40, 0.08);
      border-color: rgba(198, 40, 40, 0.2);
      color: #c62828;
    }

    .status-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .panel {
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    h3 {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      margin: 0 0 0.8rem;
      font-size: 1rem;
      font-weight: 600;
    }

    .status-pill {
      padding: 0.3rem 0.65rem;
      border-radius: 999px;
      border: 1px solid #90caf9;
      font-size: 0.78rem;
      font-weight: 600;
      color: #1565c0;
      background: #e3f2fd;
    }

    .status-pill.terminal {
      border-color: #ffd180;
      background: #fff8e1;
      color: #ef6c00;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(120px, 1fr));
      gap: 0.8rem;
    }

    .label {
      font-size: 0.74rem;
      text-transform: uppercase;
      color: var(--clr-text-2);
    }

    .value {
      font-size: 1.05rem;
      font-weight: 600;
    }

    .module-tabs {
      margin-top: 1rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(220px, 1fr));
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .form-grid.single-col {
      grid-template-columns: minmax(220px, 430px);
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .actions {
      display: flex;
      gap: 0.6rem;
      justify-content: flex-end;
      flex-wrap: wrap;
      margin-top: 0.5rem;
    }

    .warn-btn {
      border-color: #ef6c00;
      color: #ef6c00;
    }

    .hint {
      margin: 0 0 0.8rem;
      color: var(--clr-text-2);
      font-size: 0.82rem;
    }

    .history-layout {
      margin-top: 1rem;
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 1rem;
    }

    .history-controls {
      display: flex;
      gap: 0.6rem;
      align-items: flex-start;
      margin-bottom: 0.8rem;
      flex-wrap: wrap;
    }

    .comment-item {
      border: 1px solid var(--clr-border);
      border-radius: 10px;
      padding: 0.7rem;
      margin-bottom: 0.55rem;
    }

    .comment-meta {
      color: var(--clr-text-2);
      font-size: 0.76rem;
      margin-bottom: 0.35rem;
    }

    .table-panel {
      margin-top: 1rem;
    }

    .history-table {
      width: 100%;
    }

    @media (max-width: 992px) {
      .status-grid,
      .history-layout {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .actions {
        justify-content: stretch;
      }

      .actions button {
        width: 100%;
      }
    }
  `],
})
export class PfeWorkflowPageComponent {
  readonly store = inject(PfeWorkflowStore);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);

  readonly workflowSteps = WORKFLOW_STEPS;
  readonly auditColumns = ['actionAt', 'fromStatus', 'toStatus', 'actionBy', 'comment'];

  readonly defaultSubmitForm = {
    patientId: null as number | null,
    admissionId: null as number | null,
    caseReference: '',
    priority: 'NORMAL',
    ownerUser: '',
    comment: '',
  };

  readonly submitForm = this.fb.group({
    patientId: [this.defaultSubmitForm.patientId, [Validators.required, Validators.min(1)]],
    admissionId: [this.defaultSubmitForm.admissionId],
    caseReference: [this.defaultSubmitForm.caseReference],
    priority: [this.defaultSubmitForm.priority],
    ownerUser: [this.defaultSubmitForm.ownerUser],
    comment: [this.defaultSubmitForm.comment, [Validators.required, Validators.maxLength(2000)]],
  });

  readonly actionForm = this.fb.group({
    caseId: [null as number | null, [Validators.required, Validators.min(1)]],
    comment: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  readonly caseIdForm = this.fb.group({
    caseId: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  readonly historyForm = this.fb.group({
    caseId: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  readonly commentItems = computed(() => this.store.history().filter((item) => !!item.comment));

  readonly statusStepIndex = computed(() => {
    const status = (this.store.workflowStatus() || '').toUpperCase() as WorkflowStep;
    const index = WORKFLOW_STEPS.indexOf(status);
    return index >= 0 ? index : 0;
  });

  readonly isTerminalStatus = computed(() => {
    const status = this.store.workflowStatus().toUpperCase();
    return status === 'APPROVED' || status === 'REJECTED' || status === 'DENIED';
  });

  async submit(): Promise<void> {
    if (this.submitForm.invalid) {
      this.submitForm.markAllAsTouched();
      return;
    }

    const value = this.submitForm.getRawValue();
    const success = await this.store.submit({
      patientId: Number(value.patientId),
      admissionId: value.admissionId ? Number(value.admissionId) : undefined,
      caseReference: value.caseReference || undefined,
      priority: value.priority || undefined,
      ownerUser: value.ownerUser || undefined,
      comment: value.comment || '',
    });

    if (success) {
      const caseId = this.store.currentCase()?.pfeCaseId ?? null;
      this.historyForm.patchValue({ caseId });
      this.caseIdForm.patchValue({ caseId });
      this.actionForm.patchValue({ caseId, comment: '' });
    }
  }

  async review(): Promise<void> {
    if (this.actionForm.invalid) {
      this.actionForm.markAllAsTouched();
      return;
    }

    const value = this.actionForm.getRawValue();
    const caseId = Number(value.caseId);
    await this.store.review(caseId, { comment: value.comment || '' });
    this.historyForm.patchValue({ caseId });
  }

  async approve(): Promise<void> {
    const caseId = Number(this.caseIdForm.controls.caseId.value);
    if (!caseId || caseId <= 0) {
      this.caseIdForm.markAllAsTouched();
      return;
    }

    const dialogRef = this.dialog.open(PfeApprovalDialogComponent, {
      width: '520px',
      data: {
        title: 'Approve PFE Case',
        description: 'Confirm approval and add a comment for the workflow audit trail.',
        confirmLabel: 'Approve',
        caseId,
      },
    });

    const comment = await firstValueFrom(dialogRef.afterClosed());
    if (!comment) {
      return;
    }

    await this.store.approve(caseId, { comment });
    this.historyForm.patchValue({ caseId });
  }

  async reject(denied: boolean): Promise<void> {
    const caseId = Number(this.caseIdForm.controls.caseId.value);
    if (!caseId || caseId <= 0) {
      this.caseIdForm.markAllAsTouched();
      return;
    }

    const dialogRef = this.dialog.open(PfeApprovalDialogComponent, {
      width: '520px',
      data: {
        title: denied ? 'Deny PFE Case' : 'Reject PFE Case',
        description: denied
          ? 'Denying marks the case as terminal. Add the denial reason.'
          : 'Rejecting returns case with feedback. Add rejection comment.',
        confirmLabel: denied ? 'Deny' : 'Reject',
        caseId,
      },
    });

    const comment = await firstValueFrom(dialogRef.afterClosed());
    if (!comment) {
      return;
    }

    await this.store.reject(caseId, { comment, denied });
    this.historyForm.patchValue({ caseId });
  }

  async loadHistory(): Promise<void> {
    if (this.historyForm.invalid) {
      this.historyForm.markAllAsTouched();
      return;
    }

    const caseId = Number(this.historyForm.controls.caseId.value);
    await this.store.loadHistory(caseId);
  }
}
