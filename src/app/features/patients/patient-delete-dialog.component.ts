import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface PatientDeleteDialogData {
  patientName: string;
}

@Component({
  selector: 'app-patient-delete-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Delete patient</h2>
    <mat-dialog-content>
      Are you sure you want to delete <strong>{{ data.patientName }}</strong>? This action cannot be undone.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close(false)">Cancel</button>
      <button mat-flat-button color="warn" (click)="dialogRef.close(true)">Delete</button>
    </mat-dialog-actions>
  `,
})
export class PatientDeleteDialogComponent {
  constructor(
    readonly dialogRef: MatDialogRef<PatientDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: PatientDeleteDialogData
  ) {}
}

