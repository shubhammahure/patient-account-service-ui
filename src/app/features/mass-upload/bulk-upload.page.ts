import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { MassUploadStore } from '../../state/mass-upload.store';

@Component({
  selector: 'app-bulk-upload-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTableModule,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header
      title="Bulk Patient Upload"
      subtitle="Upload CSV or Excel files for patient onboarding with row-level validation.">
      <div class="header-actions">
        <button mat-stroked-button type="button" (click)="triggerInput(fileInput, 'csv')" [disabled]="store.isUploading()">
          <mat-icon>description</mat-icon>
          CSV Upload
        </button>
        <button mat-stroked-button type="button" (click)="triggerInput(fileInput, 'excel')" [disabled]="store.isUploading()">
          <mat-icon>table_chart</mat-icon>
          Excel Upload
        </button>
      </div>
    </app-page-header>

    <input
      #fileInput
      type="file"
      class="hidden-input"
      [attr.accept]="acceptFilter"
      (change)="onFileInputChange($event)" />

    <mat-card class="upload-card">
      <div
        class="drop-zone"
        [class.drag-over]="store.isDragOver()"
        [class.disabled]="store.isUploading()"
        tabindex="0"
        role="button"
        (click)="openFilePicker(fileInput)"
        (keydown.enter)="openFilePicker(fileInput)"
        (keydown.space)="openFilePicker(fileInput); $event.preventDefault()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)">
        <mat-icon>cloud_upload</mat-icon>
        <h3>Drag and drop your CSV/Excel file here</h3>
        <p>or click to browse files. Supported formats: .csv, .xls, .xlsx (max {{ store.maxUploadMb() }} MB)</p>
      </div>

      @if (store.selectedFile()) {
        <div class="selected-file">
          <div>
            <div class="label">Selected File</div>
            <div class="name">{{ store.selectedFile()!.name }}</div>
            <div class="meta">{{ store.selectedFile()!.size | number }} bytes</div>
          </div>
          <button mat-button type="button" (click)="store.clearFile()" [disabled]="store.isUploading()">
            <mat-icon>close</mat-icon>
            Clear
          </button>
        </div>
      }

      @if (store.validationMessages().length > 0) {
        <div class="validation-errors">
          <h4>Validation</h4>
          <ul>
            @for (message of store.validationMessages(); track message) {
              <li>{{ message }}</li>
            }
          </ul>
        </div>
      }

      <div class="actions-row">
        <button
          mat-flat-button
          color="primary"
          type="button"
          (click)="upload()"
          [disabled]="!store.canUpload()">
          <mat-icon>upload</mat-icon>
          Upload File
        </button>
      </div>

      @if (store.isUploading() || store.uploadProgress() > 0) {
        <div class="progress-block">
          <div class="progress-header">
            <span>Upload Progress</span>
            <span>{{ store.uploadProgress() }}%</span>
          </div>
          <mat-progress-bar mode="determinate" [value]="store.uploadProgress()"></mat-progress-bar>
        </div>
      }
    </mat-card>

    @if (store.uploadReport()) {
      <mat-card class="report-card">
        <div class="report-head">
          <h3>
            <mat-icon [class.success]="store.isSuccess()" [class.warn]="!store.isSuccess()">
              {{ store.isSuccess() ? 'check_circle' : 'warning' }}
            </mat-icon>
            Upload Report
          </h3>
          <button
            mat-stroked-button
            type="button"
            (click)="downloadErrorReport()"
            [disabled]="store.failedRows().length === 0 || store.isUploading()">
            <mat-icon>download</mat-icon>
            Download Error Report
          </button>
        </div>

        <div class="report-grid">
          <div>
            <div class="label">Batch ID</div>
            <div class="value">{{ store.uploadReport()?.batchId ?? '-' }}</div>
          </div>
          <div>
            <div class="label">Total Rows</div>
            <div class="value">{{ store.totalRows() }}</div>
          </div>
          <div>
            <div class="label">Successful</div>
            <div class="value success">{{ store.successCount() }}</div>
          </div>
          <div>
            <div class="label">Failed</div>
            <div class="value warn">{{ store.failedCount() }}</div>
          </div>
        </div>
      </mat-card>
    }

    @if (store.failedRows().length > 0) {
      <mat-card class="failed-records-card">
        <h3>Failed Records</h3>

        <table mat-table [dataSource]="store.failedRows()" class="failed-table">
          <ng-container matColumnDef="rowNumber">
            <th mat-header-cell *matHeaderCellDef>Row</th>
            <td mat-cell *matCellDef="let row">{{ row.rowNumber ?? '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="field">
            <th mat-header-cell *matHeaderCellDef>Field</th>
            <td mat-cell *matCellDef="let row">{{ row.field || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="value">
            <th mat-header-cell *matHeaderCellDef>Value</th>
            <td mat-cell *matCellDef="let row">{{ row.value || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="reason">
            <th mat-header-cell *matHeaderCellDef>Reason</th>
            <td mat-cell *matCellDef="let row">{{ row.reason }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="failedColumns"></tr>
          <tr mat-row *matRowDef="let _row; columns: failedColumns"></tr>
        </table>
      </mat-card>
    }
  `,
  styles: [`
    :host { display: block; }
    .header-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .hidden-input { display: none; }

    .upload-card, .report-card, .failed-records-card {
      margin-top: 1rem;
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    .upload-card { padding: 1rem; }

    .drop-zone {
      border: 2px dashed #90caf9;
      border-radius: 14px;
      min-height: 190px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: linear-gradient(180deg, #f9fbff 0%, #f4f7ff 100%);
      cursor: pointer;
      transition: all 150ms ease;
      text-align: center;
      padding: 1rem;

      h3 { margin: 0; font-size: 1.1rem; }
      p { margin: 0; color: var(--clr-text-2); font-size: 0.86rem; }
      mat-icon { width: 40px; height: 40px; font-size: 40px; color: #1976d2; }
    }

    .drop-zone.drag-over { border-color: #1565c0; background: #eaf3ff; transform: translateY(-1px); }
    .drop-zone.disabled { cursor: not-allowed; opacity: 0.6; }

    .selected-file {
      margin-top: 1rem;
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: center;
      border: 1px solid #d6e6ff;
      background: #f7fbff;
      border-radius: 10px;
      padding: 0.8rem;

      .label { font-size: 0.74rem; text-transform: uppercase; color: var(--clr-text-2); }
      .name { font-weight: 600; }
      .meta { color: var(--clr-text-2); font-size: 0.78rem; }
    }

    .validation-errors {
      margin-top: 1rem;
      border: 1px solid #ffcdd2;
      background: #ffebee;
      border-radius: 10px;
      padding: 0.75rem;

      h4 { margin: 0 0 0.4rem; color: #c62828; }
      ul { margin: 0; padding-left: 1rem; color: #ad1d1d; }
    }

    .actions-row { margin-top: 1rem; display: flex; justify-content: flex-end; }

    .progress-block {
      margin-top: 1rem;
      .progress-header { display: flex; justify-content: space-between; margin-bottom: 0.35rem; font-size: 0.85rem; }
    }

    .report-card { padding: 1rem; }

    .report-head {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;

      h3 { margin: 0; display: flex; align-items: center; gap: 0.45rem; }
      .success { color: #2e7d32; }
      .warn { color: #ef6c00; }
    }

    .report-grid {
      margin-top: 1rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 0.7rem;

      .label { font-size: 0.75rem; color: var(--clr-text-2); text-transform: uppercase; }
      .value { font-size: 1.15rem; font-weight: 600; }
      .success { color: #2e7d32; }
      .warn { color: #ef6c00; }
    }

    .failed-records-card { padding: 1rem; h3 { margin: 0 0 0.75rem; } }
    .failed-table { width: 100%; }

    @media (max-width: 768px) {
      .selected-file { align-items: flex-start; flex-direction: column; }
      .actions-row { justify-content: stretch; button { width: 100%; } }
    }
  `],
})
export class BulkUploadPageComponent {
  readonly store = inject(MassUploadStore);
  private readonly snackBar = inject(MatSnackBar);

  readonly failedColumns = ['rowNumber', 'field', 'value', 'reason'];

  acceptFilter = '.csv,.xls,.xlsx';

  triggerInput(fileInput: HTMLInputElement, target: 'csv' | 'excel'): void {
    if (this.store.isUploading()) return;
    this.acceptFilter = target === 'csv' ? '.csv' : '.xls,.xlsx';
    fileInput.value = '';
    fileInput.click();
  }

  openFilePicker(fileInput: HTMLInputElement): void {
    if (this.store.isUploading()) return;
    this.acceptFilter = '.csv,.xls,.xlsx';
    fileInput.value = '';
    fileInput.click();
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (file) this.store.selectFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.store.isUploading()) this.store.setDragOver(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.store.setDragOver(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.store.setDragOver(false);
    if (this.store.isUploading()) return;
    const file = event.dataTransfer?.files?.item(0);
    if (file) this.store.selectFile(file);
  }

  async upload(): Promise<void> {
    const success = await this.store.uploadFile();
    const failedCount = this.store.failedCount();
    const message = !success
      ? 'Upload failed. Please verify the file and try again.'
      : failedCount > 0
        ? `Upload completed with ${failedCount} failed record(s).`
        : 'Upload completed successfully.';
    this.snackBar.open(message, 'Close', { duration: 4000 });
  }

  async downloadErrorReport(): Promise<void> {
    await this.store.downloadErrorReport();
  }
}
