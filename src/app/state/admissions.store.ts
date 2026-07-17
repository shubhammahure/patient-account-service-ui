import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import type {
  AdmissionSummaryDto,
  AdmitPatientRequestDto,
  DischargePatientRequestDto,
} from '../core/api/generated';
import { AdmissionService } from '../core/api/generated';
import { CacheMap, TTL, getCached, setCached } from './utils/cache.util';

export type AdmissionStatus = 'ADMITTED' | 'IN_TRANSFER' | 'DISCHARGED' | 'UNKNOWN';

interface AdmissionsState {
  rows: AdmissionSummaryDto[];
  selectedAdmission: AdmissionSummaryDto | null;
  knownAdmissionIds: number[];
  isLoading: boolean;
  error: string;
}

export const AdmissionsStore = signalStore(
  { providedIn: 'root' },

  withState<AdmissionsState>({
    rows: [],
    selectedAdmission: null,
    knownAdmissionIds: [],
    isLoading: false,
    error: '',
  }),
  withComputed((store) => {
    function resolveStatus(status?: string): AdmissionStatus {
      if (!status) return 'UNKNOWN';
      const n = status.toUpperCase();
      if (n.includes('DISCH')) return 'DISCHARGED';
      if (n.includes('TRANSFER')) return 'IN_TRANSFER';
      if (n.includes('ADMIT') || n === 'ACTIVE') return 'ADMITTED';
      return 'UNKNOWN';
    }

    return {
      admittedCount: computed(() =>
        store.rows().filter((r) => resolveStatus(r.admissionStatus) === 'ADMITTED').length
      ),
      transferCount: computed(() =>
        store.rows().filter((r) => resolveStatus(r.admissionStatus) === 'IN_TRANSFER').length
      ),
      dischargedCount: computed(() =>
        store.rows().filter((r) => resolveStatus(r.admissionStatus) === 'DISCHARGED').length
      ),
    };
  }),
  withMethods((store) => {
    const admissionApi = inject(AdmissionService);
    const detailCache: CacheMap<AdmissionSummaryDto> = new Map();

    function unwrap<T>(envelope: unknown): T {
      if (envelope && typeof envelope === 'object' && 'data' in (envelope as object)) {
        return (envelope as { data: T }).data;
      }
      return envelope as T;
    }

    function resolveStatus(status?: string): AdmissionStatus {
      if (!status) return 'UNKNOWN';
      const n = status.toUpperCase();
      if (n.includes('DISCH')) return 'DISCHARGED';
      if (n.includes('TRANSFER')) return 'IN_TRANSFER';
      if (n.includes('ADMIT') || n === 'ACTIVE') return 'ADMITTED';
      return 'UNKNOWN';
    }

    function trackId(admissionId?: number): void {
      if (!admissionId) return;
      const ids = store.knownAdmissionIds();
      if (!ids.includes(admissionId)) {
        patchState(store, { knownAdmissionIds: [admissionId, ...ids].slice(0, 50) });
      }
    }

    function patchRow(admission?: AdmissionSummaryDto | null): void {
      if (!admission?.admissionId) return;
      const next = [...store.rows()];
      const idx = next.findIndex((r) => r.admissionId === admission.admissionId);
      if (idx >= 0) {
        next[idx] = { ...next[idx], ...admission };
      } else {
        next.unshift(admission);
      }
      patchState(store, { rows: next });
    }

    return {
      resolveStatus,

      async loadList(_force = false): Promise<void> {
        patchState(store, { isLoading: true, error: '' });
        try {
          const envelope = await firstValueFrom(admissionApi.listAdmissions());
          const admissions = unwrap<AdmissionSummaryDto[]>(envelope) ?? [];
          for (const admission of admissions) {
            if (admission?.admissionId) {
              setCached(detailCache, String(admission.admissionId), admission);
            }
          }
          patchState(store, { rows: admissions });
        } catch {
          patchState(store, { rows: [], error: 'Failed to load admission list' });
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      async getById(admissionId: number, force = false): Promise<AdmissionSummaryDto | null> {
        if (!force) {
          const cached = getCached(detailCache, String(admissionId), TTL.SHORT);
          if (cached) {
            patchState(store, { selectedAdmission: cached, error: '' });
            return cached;
          }
        }

        patchState(store, { isLoading: true, error: '' });
        try {
          const envelope = await firstValueFrom(admissionApi.getAdmission(admissionId));
          const admission = unwrap<AdmissionSummaryDto>(envelope);
          setCached(detailCache, String(admissionId), admission);
          trackId(admission?.admissionId ?? admissionId);
          patchRow(admission);
          patchState(store, { selectedAdmission: admission ?? null });
          return admission ?? null;
        } catch {
          patchState(store, { selectedAdmission: null, error: 'Failed to load admission details' });
          return null;
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      async admit(payload: AdmitPatientRequestDto): Promise<AdmissionSummaryDto | null> {
        patchState(store, { isLoading: true, error: '' });
        try {
          const envelope = await firstValueFrom(admissionApi.admitPatient(payload));
          const admission = unwrap<AdmissionSummaryDto>(envelope);
          if (admission?.admissionId) {
            setCached(detailCache, String(admission.admissionId), admission);
            trackId(admission.admissionId);
          }
          patchRow(admission);
          patchState(store, { selectedAdmission: admission ?? null });
          return admission ?? null;
        } catch {
          patchState(store, { error: 'Failed to admit patient' });
          return null;
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      async discharge(
        admissionId: number,
        payload: DischargePatientRequestDto
      ): Promise<AdmissionSummaryDto | null> {
        patchState(store, { isLoading: true, error: '' });
        try {
          const envelope = await firstValueFrom(admissionApi.dischargePatient(admissionId, payload));
          const admission = unwrap<AdmissionSummaryDto>(envelope);
          if (admission?.admissionId) {
            setCached(detailCache, String(admission.admissionId), admission);
          }
          patchRow(admission ?? { admissionId, admissionStatus: 'DISCHARGED' });
          patchState(store, { selectedAdmission: admission ?? store.selectedAdmission() });
          return admission ?? null;
        } catch {
          patchState(store, { error: 'Failed to discharge patient' });
          return null;
        } finally {
          patchState(store, { isLoading: false });
        }
      },
    };
  })
);
