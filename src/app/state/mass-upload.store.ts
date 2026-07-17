import { computed, inject } from '@angular/core';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  type ApiEnvelope,
  type FailedPatientUploadRecordDto,
  type UploadPatientsResponseDto,
  PatientService,
} from '../core/api/generated';

export interface FailedRecordRow {
  rowNumber: number | null;
  field: string;
  value: string;
  reason: string;
}

const ALLOWED_EXTENSIONS = ['csv', 'xls', 'xlsx'];
const MAX_UPLOAD_SIZE_MB = 10;

interface MassUploadState {
  selectedFile: File | null;
  isDragOver: boolean;
  isUploading: boolean;
  uploadProgress: number;
  uploadReport: UploadPatientsResponseDto | null;
  validationMessages: string[];
}

export const MassUploadStore = signalStore(
  { providedIn: 'root' },

  withState<MassUploadState>({
    selectedFile: null,
    isDragOver: false,
    isUploading: false,
    uploadProgress: 0,
    uploadReport: null,
    validationMessages: [],
  }),

  withComputed((store) => ({
    canUpload: computed(() =>
      !!store.selectedFile() && !store.isUploading() && store.validationMessages().length === 0
    ),

    failedRows: computed((): FailedRecordRow[] => {
      const records = store.uploadReport()?.failedRecords ?? [];
      return records.map((r: FailedPatientUploadRecordDto) => ({
        rowNumber: r.rowNumber ?? null,
        field: r.field ?? '-',
        value: r.value ?? '-',
        reason: r.message ?? r.reason ?? 'Validation failed',
      }));
    }),

    hasReport: computed(() => !!store.uploadReport()),
    isSuccess: computed(() => {
      const report = store.uploadReport();
      return !!report && (report.failedCount ?? 0) === 0;
    }),
    totalRows: computed(() => store.uploadReport()?.totalRows ?? 0),
    successCount: computed(() => store.uploadReport()?.successCount ?? 0),
    failedCount: computed(() => store.uploadReport()?.failedCount ?? 0),
    maxUploadMb: computed(() => MAX_UPLOAD_SIZE_MB),
  })),

  withMethods((store) => {
    const patientService = inject(PatientService);

    function validateFile(file: File): string[] {
      const messages: string[] = [];
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        messages.push('Unsupported file type. Use CSV, XLS, or XLSX only.');
      }
      if (file.size === 0) {
        messages.push('File is empty.');
      }
      if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
        messages.push(`File exceeds ${MAX_UPLOAD_SIZE_MB} MB limit.`);
      }
      return messages;
    }

    function extractPayload(
      body: ApiEnvelope<UploadPatientsResponseDto> | UploadPatientsResponseDto | null
    ): UploadPatientsResponseDto {
      if (!body) return { totalRows: 0, successCount: 0, failedCount: 0, failedRecords: [] };
      if ('data' in body && body.data) return body.data;
      return body as UploadPatientsResponseDto;
    }

    function buildErrorCsv(rows: FailedRecordRow[]): string {
      const headers = ['Row Number', 'Field', 'Value', 'Reason'];
      const records = rows.map((r) => [r.rowNumber ?? '', r.field, r.value, r.reason]);
      return [headers, ...records]
        .map((line) => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n');
    }

    function downloadBlob(blob: Blob, name: string): void {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = name;
      anchor.click();
      URL.revokeObjectURL(url);
    }

    return {
      selectFile(file: File): void {
        patchState(store, { uploadReport: null, uploadProgress: 0 });
        const messages = validateFile(file);
        if (messages.length > 0) {
          patchState(store, { selectedFile: null, validationMessages: messages });
          return;
        }
        patchState(store, { selectedFile: file, validationMessages: [] });
      },

      setDragOver(isDragOver: boolean): void {
        patchState(store, { isDragOver });
      },

      clearFile(): void {
        if (store.isUploading()) return;
        patchState(store, {
          selectedFile: null,
          validationMessages: [],
          uploadReport: null,
          uploadProgress: 0,
        });
      },

      async uploadFile(): Promise<boolean> {
        const file = store.selectedFile();
        if (!file || !store.canUpload()) return false;

        patchState(store, { isUploading: true, uploadProgress: 0, uploadReport: null });

        try {
          await new Promise<void>((resolve, reject) => {
            patientService.uploadPatients(file).subscribe({
              next: (event) => {
                if (event.type === HttpEventType.UploadProgress) {
                  const total = event.total ?? file.size;
                  const progress = total > 0 ? Math.round((event.loaded / total) * 100) : 0;
                  patchState(store, { uploadProgress: Math.min(progress, 100) });
                  return;
                }
                if (event.type === HttpEventType.Response) {
                  const response = event as HttpResponse<ApiEnvelope<UploadPatientsResponseDto>>;
                  const payload = extractPayload(response.body);
                  patchState(store, { uploadReport: payload, uploadProgress: 100 });
                  resolve();
                }
              },
              error: reject,
            });
          });
          return true;
        } catch {
          patchState(store, { uploadProgress: 0, uploadReport: null });
          return false;
        } finally {
          patchState(store, { isUploading: false });
        }
      },

      async downloadErrorReport(): Promise<void> {
        const report = store.uploadReport();
        const failed = store.failedRows();
        if (!report || failed.length === 0) return;

        const batchId = report.batchId;
        if (batchId) {
          try {
            const blob = await firstValueFrom(patientService.downloadUploadErrorReport(batchId));
            if (blob) {
              downloadBlob(blob, `upload-errors-${batchId}.csv`);
              return;
            }
          } catch {
            // Fall through to local generation
          }
        }

        const csv = buildErrorCsv(failed);
        downloadBlob(
          new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
          `upload-errors-${batchId ?? 'local'}.csv`
        );
      },
    };
  })
);

