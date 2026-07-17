import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import type {
  PatientSearchCriteriaDto,
  PatientSummaryDto,
  PatientUpsertRequestDto,
} from '../core/api/generated';
import { PatientService } from '../core/api/generated';
import {
  CacheMap,
  TTL,
  getCached,
  invalidateCache,
  setCached,
} from './utils/cache.util';

export interface PatientQuery {
  search: string;
  status: string;
  pageIndex: number;
  pageSize: number;
  sortBy: string;
  direction: 'asc' | 'desc';
}

interface PatientsState {
  rows: PatientSummaryDto[];
  totalElements: number;
  selectedPatient: PatientSummaryDto | null;
  isLoading: boolean;
  error: string;
  query: PatientQuery;
}

const DEFAULT_QUERY: PatientQuery = {
  search: '',
  status: '',
  pageIndex: 0,
  pageSize: 10,
  sortBy: 'createdAt',
  direction: 'desc',
};

function queryKey(q: PatientQuery): string {
  return `${q.search}|${q.status}|${q.pageIndex}|${q.pageSize}|${q.sortBy}|${q.direction}`;
}

export const PatientsStore = signalStore(
  { providedIn: 'root' },

  withState<PatientsState>({
    rows: [],
    totalElements: 0,
    selectedPatient: null,
    isLoading: false,
    error: '',
    query: DEFAULT_QUERY,
  }),

  withComputed((store) => ({
    hasRows: computed(() => store.rows().length > 0),
    hasError: computed(() => store.error().length > 0),
    totalPages: computed(() => {
      const { pageSize } = store.query();
      const total = store.totalElements();
      return pageSize > 0 ? Math.ceil(total / pageSize) : 0;
    }),
  })),

  withMethods((store) => {
    const patientApi = inject(PatientService);
    // Cache: key → paginated result
    const listCache: CacheMap<{ rows: PatientSummaryDto[]; total: number }> = new Map();
    // Cache: patientId → patient detail
    const detailCache: CacheMap<PatientSummaryDto> = new Map();

    function unwrap<T>(envelope: unknown): T {
      if (envelope && typeof envelope === 'object' && 'data' in (envelope as object)) {
        return (envelope as { data: T }).data;
      }
      return envelope as T;
    }

    return {
      setFilters(search: string, status: string): void {
        patchState(store, { query: { ...store.query(), search, status, pageIndex: 0 } });
      },

      setPage(pageIndex: number, pageSize: number): void {
        patchState(store, { query: { ...store.query(), pageIndex, pageSize } });
      },

      setSort(sortBy: string, direction: 'asc' | 'desc'): void {
        patchState(store, { query: { ...store.query(), sortBy, direction, pageIndex: 0 } });
      },

      async load(force = false): Promise<void> {
        const q = store.query();
        const cacheKey = queryKey(q);

        if (!force) {
          const cached = getCached(listCache, cacheKey, TTL.MEDIUM);
          if (cached) {
            patchState(store, { rows: cached.rows, totalElements: cached.total, error: '' });
            return;
          }
        }

        patchState(store, { isLoading: true, error: '' });
        try {
          const criteria: PatientSearchCriteriaDto = {
            search: q.search || undefined,
            status: q.status || undefined,
          };
          const envelope = await firstValueFrom(
            patientApi.searchPatients(criteria, q.pageIndex, q.pageSize, q.sortBy, q.direction)
          );
          const page = unwrap<{ content?: PatientSummaryDto[]; totalElements?: number }>(envelope);
          const rows = page.content ?? [];
          const total = Number(page.totalElements ?? 0);
          setCached(listCache, cacheKey, { rows, total });
          patchState(store, { rows, totalElements: total });
        } catch {
          patchState(store, { rows: [], totalElements: 0, error: 'Failed to load patients' });
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      async getById(patientId: number, force = false): Promise<PatientSummaryDto | null> {
        if (!force) {
          const cached = getCached(detailCache, String(patientId), TTL.MEDIUM);
          if (cached) {
            patchState(store, { selectedPatient: cached, error: '' });
            return cached;
          }
        }

        patchState(store, { isLoading: true, error: '' });
        try {
          const envelope = await firstValueFrom(patientApi.getPatient(patientId));
          const patient = unwrap<PatientSummaryDto>(envelope);
          setCached(detailCache, String(patientId), patient);
          patchState(store, { selectedPatient: patient ?? null });
          return patient ?? null;
        } catch {
          patchState(store, { selectedPatient: null, error: 'Failed to load patient details' });
          return null;
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      async create(payload: PatientUpsertRequestDto): Promise<boolean> {
        patchState(store, { isLoading: true, error: '' });
        try {
          await firstValueFrom(patientApi.registerPatient(payload));
          invalidateCache(listCache);
          return true;
        } catch {
          patchState(store, { error: 'Failed to create patient' });
          return false;
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      async update(patientId: number, payload: PatientUpsertRequestDto): Promise<boolean> {
        patchState(store, { isLoading: true, error: '' });
        try {
          const envelope = await firstValueFrom(patientApi.updatePatient(patientId, payload));
          const patient = unwrap<PatientSummaryDto>(envelope);
          setCached(detailCache, String(patientId), patient);
          invalidateCache(listCache);
          patchState(store, { selectedPatient: patient ?? null });
          return true;
        } catch {
          patchState(store, { error: 'Failed to update patient' });
          return false;
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      async remove(patientId: number): Promise<boolean> {
        patchState(store, { isLoading: true, error: '' });
        try {
          await firstValueFrom(patientApi.deletePatient(patientId));
          detailCache.delete(String(patientId));
          invalidateCache(listCache);
          return true;
        } catch {
          patchState(store, { error: 'Failed to delete patient' });
          return false;
        } finally {
          patchState(store, { isLoading: false });
        }
      },
    };
  })
);
