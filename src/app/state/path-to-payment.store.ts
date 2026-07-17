import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  type ApiEnvelope,
  type OutstandingBalanceDto,
  type PathToPaymentCreateRequestDto,
  type PaymentCaseDetailsDto,
  type PaymentCaseSummaryDetailsDto,
  type PaymentCaseSummaryDto,
  type PaymentMilestoneDto,
  type PaymentMilestoneUpsertRequestDto,
  type PaymentTransactionCreateRequestDto,
  type PaymentTransactionDto,
  PathToPaymentService,
  type UpdateBillingStatusRequestDto,
  type UpdateFinancialClearanceRequestDto,
  type UpdateInsuranceStatusRequestDto,
  type UpdatePaymentStatusRequestDto,
} from '../core/api/generated';
import { CacheMap, TTL, getCached, invalidateCache, setCached } from './utils/cache.util';

interface CaseDetailBundle {
  caseInfo: PaymentCaseDetailsDto;
  summary: PaymentCaseSummaryDetailsDto;
  balance: OutstandingBalanceDto;
  transactions: PaymentTransactionDto[];
  milestones: PaymentMilestoneDto[];
}

interface PaymentsState {
  rows: PaymentCaseSummaryDto[];
  totalRows: number;
  currentCaseId: number | null;
  currentCase: PaymentCaseDetailsDto | null;
  caseSummary: PaymentCaseSummaryDetailsDto | null;
  outstandingBalance: OutstandingBalanceDto | null;
  transactions: PaymentTransactionDto[];
  milestones: PaymentMilestoneDto[];
  isListLoading: boolean;
  isDetailsLoading: boolean;
  isActionLoading: boolean;
  error: string;
  info: string;
}

export const PathToPaymentStore = signalStore(
  { providedIn: 'root' },

  withState<PaymentsState>({
    rows: [],
    totalRows: 0,
    currentCaseId: null,
    currentCase: null,
    caseSummary: null,
    outstandingBalance: null,
    transactions: [],
    milestones: [],
    isListLoading: false,
    isDetailsLoading: false,
    isActionLoading: false,
    error: '',
    info: '',
  }),

  withComputed((store) => ({
    dashboard: computed(() => {
      const cases = store.rows();
      const totalOutstanding = cases.reduce((sum, c) => sum + Number(c.outstandingBalance ?? 0), 0);
      const byStatus = cases.reduce((acc, c) => {
        const key = c.paymentStatus || 'UNKNOWN';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return {
        totalCases: cases.length,
        totalOutstanding,
        openCases: (byStatus['OPEN'] ?? 0) + (byStatus['PENDING'] ?? 0),
        settledCases: (byStatus['SETTLED'] ?? 0) + (byStatus['CLOSED'] ?? 0),
        statusMap: byStatus,
      };
    }),

    milestoneProgress: computed(() => {
      const summary = store.caseSummary();
      const total = Number(summary?.totalMilestones ?? 0);
      const done = Number(summary?.completedMilestones ?? 0);
      return total > 0 ? Math.round((done / total) * 100) : 0;
    }),
  })),

  withMethods((store) => {
    const paymentApi = inject(PathToPaymentService);

    // List cache keyed by optional status filter
    const listCache: CacheMap<{ rows: PaymentCaseSummaryDto[]; total: number }> = new Map();
    // Detail cache keyed by caseId
    const detailCache: CacheMap<CaseDetailBundle> = new Map();

    function unwrap<T>(envelope: ApiEnvelope<T> | T): T {
      if (typeof envelope === 'object' && envelope && 'data' in envelope) {
        return (envelope as ApiEnvelope<T>).data;
      }
      return envelope as T;
    }

    function clearMessages(): void {
      patchState(store, { error: '', info: '' });
    }

    function applyDetail(bundle: CaseDetailBundle): void {
      patchState(store, {
        currentCase: bundle.caseInfo,
        caseSummary: bundle.summary,
        outstandingBalance: bundle.balance,
        transactions: bundle.transactions,
        milestones: bundle.milestones,
      });
    }

    async function performAction(
      action: () => Promise<void>,
      errorMessage: string
    ): Promise<boolean> {
      clearMessages();
      patchState(store, { isActionLoading: true });
      try {
        await action();
        return true;
      } catch {
        patchState(store, { error: errorMessage });
        return false;
      } finally {
        patchState(store, { isActionLoading: false });
      }
    }

    return {
      async loadCases(paymentStatus?: string, force = false): Promise<void> {
        const cacheKey = paymentStatus ?? '__all__';

        if (!force) {
          const cached = getCached(listCache, cacheKey, TTL.MEDIUM);
          if (cached) {
            patchState(store, { rows: cached.rows, totalRows: cached.total, error: '' });
            return;
          }
        }

        clearMessages();
        patchState(store, { isListLoading: true });
        try {
          const envelope = await firstValueFrom(paymentApi.listCases(paymentStatus, 0, 100));
          const page = unwrap<{ content?: PaymentCaseSummaryDto[]; totalElements?: number }>(envelope);
          const rows = page.content ?? [];
          const total = Number(page.totalElements ?? 0);
          setCached(listCache, cacheKey, { rows, total });
          patchState(store, { rows, totalRows: total });
        } catch {
          patchState(store, { rows: [], totalRows: 0, error: 'Failed to load payment cases.' });
        } finally {
          patchState(store, { isListLoading: false });
        }
      },

      async createCase(payload: PathToPaymentCreateRequestDto): Promise<boolean> {
        return performAction(async () => {
          await firstValueFrom(paymentApi.createCase(payload));
          invalidateCache(listCache);
          patchState(store, { info: 'Payment case created successfully.' });
          // Reload list with fresh data
          const envelope = await firstValueFrom(paymentApi.listCases(undefined, 0, 100));
          const page = unwrap<{ content?: PaymentCaseSummaryDto[]; totalElements?: number }>(envelope);
          setCached(listCache, '__all__', { rows: page.content ?? [], total: Number(page.totalElements ?? 0) });
          patchState(store, { rows: page.content ?? [], totalRows: Number(page.totalElements ?? 0) });
        }, 'Failed to create payment case.');
      },

      async loadCaseDetails(caseId: number, force = false): Promise<void> {
        if (!caseId || caseId <= 0) {
          patchState(store, { error: 'Invalid case id.' });
          return;
        }

        if (!force) {
          const cached = getCached(detailCache, String(caseId), TTL.SHORT);
          if (cached) {
            applyDetail(cached);
            patchState(store, { currentCaseId: caseId, error: '' });
            return;
          }
        }

        clearMessages();
        patchState(store, { isDetailsLoading: true, currentCaseId: caseId });
        try {
          const [caseRes, summaryRes, balanceRes, txRes, msRes] = await Promise.all([
            firstValueFrom(paymentApi.getCaseById(caseId)),
            firstValueFrom(paymentApi.getCaseSummary(caseId)),
            firstValueFrom(paymentApi.getOutstandingBalance(caseId)),
            firstValueFrom(paymentApi.getTransactions(caseId, 0, 100)),
            firstValueFrom(paymentApi.getMilestones(caseId)),
          ]);

          const txPage = unwrap<{ content?: PaymentTransactionDto[] }>(txRes);
          const bundle: CaseDetailBundle = {
            caseInfo: unwrap<PaymentCaseDetailsDto>(caseRes),
            summary: unwrap<PaymentCaseSummaryDetailsDto>(summaryRes),
            balance: unwrap<OutstandingBalanceDto>(balanceRes),
            transactions: txPage.content ?? [],
            milestones: (unwrap(msRes) as PaymentMilestoneDto[]) ?? [],
          };
          setCached(detailCache, String(caseId), bundle);
          applyDetail(bundle);
        } catch {
          patchState(store, {
            error: 'Failed to load case details.',
            currentCase: null,
            caseSummary: null,
            outstandingBalance: null,
            transactions: [],
            milestones: [],
          });
        } finally {
          patchState(store, { isDetailsLoading: false });
        }
      },

      async addTransaction(
        caseId: number,
        payload: PaymentTransactionCreateRequestDto
      ): Promise<boolean> {
        return performAction(async () => {
          await firstValueFrom(paymentApi.recordTransaction(caseId, payload));
          detailCache.delete(String(caseId));
          patchState(store, { info: 'Transaction recorded successfully.' });
        }, 'Failed to record transaction.');
      },

      async addMilestone(
        caseId: number,
        payload: PaymentMilestoneUpsertRequestDto
      ): Promise<boolean> {
        return performAction(async () => {
          await firstValueFrom(paymentApi.addMilestone(caseId, payload));
          detailCache.delete(String(caseId));
          patchState(store, { info: 'Milestone added successfully.' });
        }, 'Failed to add milestone.');
      },

      async updateMilestone(
        caseId: number,
        milestoneId: number,
        payload: PaymentMilestoneUpsertRequestDto
      ): Promise<boolean> {
        return performAction(async () => {
          await firstValueFrom(paymentApi.updateMilestone(caseId, milestoneId, payload));
          detailCache.delete(String(caseId));
          patchState(store, { info: 'Milestone updated successfully.' });
        }, 'Failed to update milestone.');
      },

      async updatePaymentStatus(
        caseId: number,
        payload: UpdatePaymentStatusRequestDto
      ): Promise<boolean> {
        return performAction(async () => {
          const envelope = await firstValueFrom(paymentApi.updatePaymentStatus(caseId, payload));
          const updated = unwrap<PaymentCaseDetailsDto>(envelope);
          detailCache.delete(String(caseId));
          patchState(store, {
            currentCase: updated,
            info: 'Payment status updated successfully.',
          });
        }, 'Failed to update payment status.');
      },

      async updateInsuranceStatus(
        caseId: number,
        payload: UpdateInsuranceStatusRequestDto
      ): Promise<boolean> {
        return performAction(async () => {
          const envelope = await firstValueFrom(paymentApi.updateInsuranceStatus(caseId, payload));
          const updated = unwrap<PaymentCaseDetailsDto>(envelope);
          detailCache.delete(String(caseId));
          patchState(store, {
            currentCase: updated,
            info: 'Insurance status updated successfully.',
          });
        }, 'Failed to update insurance status.');
      },

      async updateFinancialClearance(
        caseId: number,
        payload: UpdateFinancialClearanceRequestDto
      ): Promise<boolean> {
        return performAction(async () => {
          const envelope = await firstValueFrom(paymentApi.updateFinancialClearance(caseId, payload));
          const updated = unwrap<PaymentCaseDetailsDto>(envelope);
          detailCache.delete(String(caseId));
          patchState(store, {
            currentCase: updated,
            info: 'Financial clearance updated successfully.',
          });
        }, 'Failed to update financial clearance.');
      },

      async updateBillingStatus(
        caseId: number,
        payload: UpdateBillingStatusRequestDto
      ): Promise<boolean> {
        return performAction(async () => {
          const envelope = await firstValueFrom(paymentApi.updateBillingStatus(caseId, payload));
          const updated = unwrap<PaymentCaseDetailsDto>(envelope);
          detailCache.delete(String(caseId));
          patchState(store, {
            currentCase: updated,
            info: 'Billing status updated successfully.',
          });
        }, 'Failed to update billing status.');
      },
    };
  })
);
