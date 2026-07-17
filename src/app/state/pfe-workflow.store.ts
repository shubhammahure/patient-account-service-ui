import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { type Observable, firstValueFrom } from 'rxjs';
import {
  type ApiEnvelope,
  type PfeActionRequestDto,
  type PfeCaseHistoryResponseDto,
  type PfeCaseResponseDto,
  type PfeRejectRequestDto,
  type PfeSubmitRequestDto,
  PFEWorkflowService,
} from '../core/api/generated';
import { CacheMap, TTL, getCached, setCached } from './utils/cache.util';

export type WorkflowAction = 'SUBMIT' | 'REVIEW' | 'APPROVE' | 'REJECT' | 'DENY' | 'HISTORY';

interface PfeState {
  currentCase: PfeCaseResponseDto | null;
  history: PfeCaseHistoryResponseDto[];
  selectedCaseId: number | null;
  isLoading: boolean;
  isActionInProgress: boolean;
  error: string;
  info: string;
}

export const PfeWorkflowStore = signalStore(
  { providedIn: 'root' },

  withState<PfeState>({
    currentCase: null,
    history: [],
    selectedCaseId: null,
    isLoading: false,
    isActionInProgress: false,
    error: '',
    info: '',
  }),

  withComputed((store) => ({
    workflowStatus: computed(() => {
      const caseStatus = store.currentCase()?.caseStatus;
      if (caseStatus) return caseStatus;
      const first = store.history()[0];
      if (first?.toStatus) return first.toStatus;
      return 'NOT_STARTED';
    }),

    commentsCount: computed(() =>
      store.history().filter((h) => !!h.comment?.trim()).length
    ),
  })),

  withMethods((store) => {
    const pfeApi = inject(PFEWorkflowService);
    // Cache: caseId → sorted history
    const historyCache: CacheMap<PfeCaseHistoryResponseDto[]> = new Map();

    function unwrap<T>(envelope: ApiEnvelope<T> | T | null | undefined): T {
      if (!envelope) return {} as T;
      if (typeof envelope === 'object' && 'data' in envelope) {
        return (envelope as ApiEnvelope<T>).data;
      }
      return envelope as T;
    }

    function clearMessages(): void {
      patchState(store, { error: '', info: '' });
    }

    async function performCaseAction(
      action: Exclude<WorkflowAction, 'SUBMIT' | 'HISTORY'>,
      caseId: number,
      apiCall: () => Observable<ApiEnvelope<PfeCaseResponseDto>>
    ): Promise<boolean> {
      if (!caseId || caseId <= 0) {
        patchState(store, { error: 'Enter a valid case ID.' });
        return false;
      }
      clearMessages();
      patchState(store, { isActionInProgress: true });
      try {
        const response = await firstValueFrom(apiCall());
        const updated = unwrap(response);
        const resolvedId = updated.pfeCaseId ?? caseId;
        patchState(store, { currentCase: updated, selectedCaseId: resolvedId });
        // Invalidate history cache for this case so next loadHistory refetches
        historyCache.delete(String(resolvedId));
        await methods.loadHistory(resolvedId);
        patchState(store, { info: `Case ${action.toLowerCase()} action completed.` });
        return true;
      } catch {
        patchState(store, { error: `Unable to ${action.toLowerCase()} case.` });
        return false;
      } finally {
        patchState(store, { isActionInProgress: false });
      }
    }

    const methods = {
      async submit(payload: PfeSubmitRequestDto): Promise<boolean> {
        clearMessages();
        patchState(store, { isActionInProgress: true });
        try {
          const response = await firstValueFrom(pfeApi.submit(payload));
          const saved = unwrap(response);
          patchState(store, { currentCase: saved, selectedCaseId: saved.pfeCaseId ?? null });
          patchState(store, { info: 'PFE case submitted successfully.' });
          if (saved.pfeCaseId) {
            await methods.loadHistory(saved.pfeCaseId);
          }
          return true;
        } catch {
          patchState(store, { error: 'Unable to submit PFE case. Please try again.' });
          return false;
        } finally {
          patchState(store, { isActionInProgress: false });
        }
      },

      async review(caseId: number, payload: PfeActionRequestDto): Promise<boolean> {
        return performCaseAction('REVIEW', caseId, () => pfeApi.review(caseId, payload));
      },

      async approve(caseId: number, payload: PfeActionRequestDto): Promise<boolean> {
        return performCaseAction('APPROVE', caseId, () => pfeApi.approve(caseId, payload));
      },

      async reject(caseId: number, payload: PfeRejectRequestDto): Promise<boolean> {
        return performCaseAction(
          payload.denied ? 'DENY' : 'REJECT',
          caseId,
          () => pfeApi.reject(caseId, payload)
        );
      },

      async loadHistory(caseId: number, force = false): Promise<void> {
        if (!caseId || caseId <= 0) {
          patchState(store, { error: 'Enter a valid case ID to load history.' });
          return;
        }

        if (!force) {
          const cached = getCached(historyCache, String(caseId), TTL.SHORT);
          if (cached) {
            patchState(store, { history: cached, selectedCaseId: caseId, info: '' });
            return;
          }
        }

        clearMessages();
        patchState(store, { isLoading: true, selectedCaseId: caseId });
        try {
          const response = await firstValueFrom(pfeApi.history(caseId));
          const payload = unwrap(response);
          const rows = Array.isArray(payload) ? payload : [];
          const sorted = [...rows].sort((a, b) => {
            const at = a.actionAt ? new Date(a.actionAt).getTime() : 0;
            const bt = b.actionAt ? new Date(b.actionAt).getTime() : 0;
            return bt - at;
          });
          setCached(historyCache, String(caseId), sorted);
          patchState(store, { history: sorted, info: 'Audit history loaded.' });
        } catch {
          patchState(store, { history: [], error: 'Unable to load case history.' });
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      reset(): void {
        patchState(store, {
          currentCase: null,
          history: [],
          selectedCaseId: null,
          error: '',
          info: '',
        });
      },
    };

    return methods;
  })
);
