import { inject, Injectable, InjectionToken, Provider } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
  success?: boolean;
  timestamp?: string;
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface AuthTokenResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresInMs?: number;
}

export interface RegisterRequestDto {
  username: string;
  email: string;
  password: string;
  roles: string[];
}

export interface CurrentUserResponseDto {
  userId?: number;
  username?: string;
  email?: string;
  roles?: string[];
}

export interface PatientUpsertRequestDto {
  accountNumber: string;
  mrn?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber?: string;
  email?: string;
  ssnLast4?: string;
  status?: string;
  statusReason?: string;
}

export interface PatientSearchCriteriaDto {
  patientId?: number;
  mrn?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  search?: string;
  status?: string;
  admissionStatus?: string;
}

export interface PatientSummaryDto {
  patientId?: number;
  fullName?: string;
  accountNumber?: string;
  mrn?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  email?: string;
  status?: string;
}

export interface FailedPatientUploadRecordDto {
  rowNumber?: number;
  field?: string;
  value?: string;
  reason?: string;
  message?: string;
}

export interface UploadPatientsResponseDto {
  batchId?: number;
  totalRows?: number;
  successCount?: number;
  failedCount?: number;
  failedRecords?: FailedPatientUploadRecordDto[];
  errorReportFileName?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface AdmitPatientRequestDto {
  patientId: number;
  facilityId: number;
  departmentId: number;
  admissionNumber: string;
  admissionType: string;
  doctor: string;
  admissionDate: string;
  reason: string;
  ward?: string;
  room?: string;
  bedId?: number;
}

export interface DischargePatientRequestDto {
  dischargeDate: string;
  reason: string;
  disposition: string;
  summary?: string;
}

export interface AdmissionSummaryDto {
  admissionId?: number;
  patientId?: number;
  admissionNumber?: string;
  admissionType?: string;
  admissionStatus?: string;
  doctor?: string;
  facilityId?: number;
  departmentId?: number;
  ward?: string;
  room?: string;
  admissionDate?: string;
  dischargeDate?: string;
  reason?: string;
  disposition?: string;
}

export interface PathToPaymentCreateRequestDto {
  patientId: number;
  currentStep: string;
  totalCharges: number;
  allowedAmount: number;
  insuranceResponsibility: number;
  patientResponsibility: number;
  paymentCaseRef?: string;
  dueDate?: string;
  notes?: string;
}

export interface PaymentCaseSummaryDto {
  pathToPaymentCaseId?: number;
  patientId?: number;
  paymentCaseRef?: string;
  paymentStatus?: string;
  outstandingBalance?: number;
}

export interface PaymentCaseDetailsDto extends PaymentCaseSummaryDto {
  admissionId?: number;
  pfeCaseId?: number;
  currentStep?: string;
  insuranceStatus?: string;
  financialClearanceStatus?: string;
  billingStatus?: string;
  totalCharges?: number;
  allowedAmount?: number;
  insuranceResponsibility?: number;
  patientResponsibility?: number;
  dueDate?: string;
  openedAt?: string;
  closedAt?: string;
  notes?: string;
}

export interface PaymentCaseSummaryDetailsDto {
  pathToPaymentCaseId?: number;
  paymentCaseRef?: string;
  patientName?: string;
  totalMilestones?: number;
  completedMilestones?: number;
  totalTransactions?: number;
}

export interface OutstandingBalanceDto {
  pathToPaymentCaseId?: number;
  outstandingBalance?: number;
  overdue?: boolean;
}

export interface PaymentTransactionCreateRequestDto {
  transactionType: string;
  amount: number;
  currencyCode?: string;
  referenceNumber?: string;
  sourceSystem?: string;
}

export interface PaymentTransactionDto {
  paymentTransactionId?: number;
  pathToPaymentCaseId?: number;
  transactionType?: string;
  amount?: number;
  currencyCode?: string;
  referenceNumber?: string;
  sourceSystem?: string;
  transactionAt?: string;
}

export interface PaymentMilestoneUpsertRequestDto {
  milestoneCode: string;
  milestoneName: string;
  sequenceNo: number;
  milestoneStatus?: string;
  targetDate?: string;
  completedDate?: string;
}

export interface PaymentMilestoneDto {
  paymentMilestoneId?: number;
  pathToPaymentCaseId?: number;
  milestoneCode?: string;
  milestoneName?: string;
  sequenceNo?: number;
  milestoneStatus?: string;
  targetDate?: string;
  completedDate?: string;
}

export interface UpdatePaymentStatusRequestDto {
  paymentStatus: string;
  notes?: string;
}

export interface UpdateInsuranceStatusRequestDto {
  insuranceStatus: string;
  notes?: string;
}

export interface UpdateFinancialClearanceRequestDto {
  financialClearanceStatus: string;
  notes?: string;
}

export interface UpdateBillingStatusRequestDto {
  billingStatus: string;
  notes?: string;
}

export interface PfeSubmitRequestDto {
  patientId: number;
  comment: string;
  admissionId?: number;
  caseReference?: string;
  priority?: string;
  ownerUser?: string;
}

export interface PfeActionRequestDto {
  comment: string;
}

export interface PfeRejectRequestDto {
  comment: string;
  denied?: boolean;
}

export interface PfeCaseResponseDto {
  pfeCaseId?: number;
  patientId?: number;
  admissionId?: number;
  caseReference?: string;
  workflowStage?: string;
  caseStatus?: string;
  priority?: string;
  ownerUser?: string;
  startedAt?: string;
  dueAt?: string;
  closedAt?: string;
}

export interface PfeCaseHistoryResponseDto {
  historyId?: number;
  fromStatus?: string;
  toStatus?: string;
  comment?: string;
  actionBy?: string;
  actionAt?: string;
}

export const API_BASE_PATH = new InjectionToken<string>('API_BASE_PATH');

export function provideApi(basePath: string): Provider {
  return { provide: API_BASE_PATH, useValue: basePath };
}

function toParams(query: Record<string, string | number | boolean | undefined>): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly http = inject(HttpClient);
  private readonly basePath = inject(API_BASE_PATH, { optional: true }) ?? '';

  login(payload: LoginRequestDto): Observable<ApiEnvelope<AuthTokenResponseDto>> {
    return this.http.post<ApiEnvelope<AuthTokenResponseDto>>(`${this.basePath}/login`, payload);
  }

  login_1(payload: LoginRequestDto): Observable<ApiEnvelope<AuthTokenResponseDto>> {
    return this.http.post<ApiEnvelope<AuthTokenResponseDto>>(`${this.basePath}/api/v1/auth/login`, payload);
  }

  login1(payload: LoginRequestDto): Observable<ApiEnvelope<AuthTokenResponseDto>> {
    return this.login_1(payload);
  }

  register(payload: RegisterRequestDto): Observable<ApiEnvelope<unknown>> {
    return this.http.post<ApiEnvelope<unknown>>(`${this.basePath}/api/v1/auth/register`, payload);
  }

  register_1(payload: RegisterRequestDto): Observable<ApiEnvelope<unknown>> {
    return this.http.post<ApiEnvelope<unknown>>(`${this.basePath}/register`, payload);
  }

  currentUser(): Observable<ApiEnvelope<CurrentUserResponseDto>> {
    return this.http.get<ApiEnvelope<CurrentUserResponseDto>>(`${this.basePath}/api/v1/auth/me`);
  }

  refreshToken(payload: RefreshTokenRequestDto): Observable<ApiEnvelope<AuthTokenResponseDto>> {
    return this.http.post<ApiEnvelope<AuthTokenResponseDto>>(`${this.basePath}/api/v1/auth/token/refresh`, payload);
  }

  logout(): Observable<ApiEnvelope<unknown>> {
    return this.http.post<ApiEnvelope<unknown>>(`${this.basePath}/api/v1/auth/logout`, {});
  }
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly http = inject(HttpClient);
  private readonly basePath = inject(API_BASE_PATH, { optional: true }) ?? '';

  searchPatients(
    criteria: PatientSearchCriteriaDto,
    page = 0,
    size = 20,
    sortBy = 'createdAt',
    direction = 'desc'
  ): Observable<ApiEnvelope<PageResponse<PatientSummaryDto>>> {
    const params = toParams({
      page,
      size,
      sortBy,
      direction,
      patientId: criteria.patientId,
      mrn: criteria.mrn,
      firstName: criteria.firstName,
      lastName: criteria.lastName,
      dateOfBirth: criteria.dateOfBirth,
      email: criteria.email,
      phone: criteria.phone,
      search: criteria.search,
      status: criteria.status,
      admissionStatus: criteria.admissionStatus,
    });

    return this.http.get<ApiEnvelope<PageResponse<PatientSummaryDto>>>(`${this.basePath}/api/v1/patients`, { params });
  }

  uploadPatients(file: File): Observable<HttpEvent<ApiEnvelope<UploadPatientsResponseDto>>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<ApiEnvelope<UploadPatientsResponseDto>>(`${this.basePath}/api/v1/patients/upload`, formData, {
      observe: 'events',
      reportProgress: true,
    });
  }

  downloadUploadErrorReport(batchId: number): Observable<Blob> {
    return this.http.get(`${this.basePath}/api/v1/patients/upload/${batchId}/errors`, {
      responseType: 'blob',
    });
  }

  getPatient(patientId: number): Observable<ApiEnvelope<PatientSummaryDto>> {
    return this.http.get<ApiEnvelope<PatientSummaryDto>>(`${this.basePath}/api/v1/patients/${patientId}`);
  }

  registerPatient(payload: PatientUpsertRequestDto): Observable<ApiEnvelope<PatientSummaryDto>> {
    return this.http.post<ApiEnvelope<PatientSummaryDto>>(`${this.basePath}/api/v1/patients`, payload);
  }

  updatePatient(patientId: number, payload: PatientUpsertRequestDto): Observable<ApiEnvelope<PatientSummaryDto>> {
    return this.http.put<ApiEnvelope<PatientSummaryDto>>(`${this.basePath}/api/v1/patients/${patientId}`, payload);
  }

  deletePatient(patientId: number): Observable<ApiEnvelope<unknown>> {
    return this.http.delete<ApiEnvelope<unknown>>(`${this.basePath}/api/v1/patients/${patientId}`);
  }
}

@Injectable({ providedIn: 'root' })
export class AdmissionService {
  private readonly http = inject(HttpClient);
  private readonly basePath = inject(API_BASE_PATH, { optional: true }) ?? '';

  listAdmissions(): Observable<ApiEnvelope<AdmissionSummaryDto[]>> {
    return this.http.get<ApiEnvelope<AdmissionSummaryDto[]>>(`${this.basePath}/api/v1/admissions`);
  }

  admitPatient(payload: AdmitPatientRequestDto): Observable<ApiEnvelope<AdmissionSummaryDto>> {
    return this.http.post<ApiEnvelope<AdmissionSummaryDto>>(`${this.basePath}/api/v1/admissions/admit`, payload);
  }

  dischargePatient(admissionId: number, payload: DischargePatientRequestDto): Observable<ApiEnvelope<AdmissionSummaryDto>> {
    return this.http.post<ApiEnvelope<AdmissionSummaryDto>>(`${this.basePath}/api/v1/admissions/${admissionId}/discharge`, payload);
  }

  getAdmission(admissionId: number): Observable<ApiEnvelope<AdmissionSummaryDto>> {
    return this.http.get<ApiEnvelope<AdmissionSummaryDto>>(`${this.basePath}/api/v1/admissions/${admissionId}`);
  }
}

@Injectable({ providedIn: 'root' })
export class PathToPaymentService {
  private readonly http = inject(HttpClient);
  private readonly basePath = inject(API_BASE_PATH, { optional: true }) ?? '';

  listCases(
    paymentStatus?: string,
    page = 0,
    size = 20,
    sortBy = 'openedAt',
    direction = 'desc'
  ): Observable<ApiEnvelope<PageResponse<PaymentCaseSummaryDto>>> {
    const params = toParams({ paymentStatus, page, size, sortBy, direction });
    return this.http.get<ApiEnvelope<PageResponse<PaymentCaseSummaryDto>>>(`${this.basePath}/api/v1/payment-cases`, { params });
  }

  createCase(payload: PathToPaymentCreateRequestDto): Observable<ApiEnvelope<PaymentCaseSummaryDto>> {
    return this.http.post<ApiEnvelope<PaymentCaseSummaryDto>>(`${this.basePath}/api/v1/payment-cases`, payload);
  }

  getCaseById(caseId: number): Observable<ApiEnvelope<PaymentCaseDetailsDto>> {
    return this.http.get<ApiEnvelope<PaymentCaseDetailsDto>>(`${this.basePath}/api/v1/payment-cases/${caseId}`);
  }

  getCaseSummary(caseId: number): Observable<ApiEnvelope<PaymentCaseSummaryDetailsDto>> {
    return this.http.get<ApiEnvelope<PaymentCaseSummaryDetailsDto>>(`${this.basePath}/api/v1/payment-cases/${caseId}/summary`);
  }

  getOutstandingBalance(caseId: number): Observable<ApiEnvelope<OutstandingBalanceDto>> {
    return this.http.get<ApiEnvelope<OutstandingBalanceDto>>(`${this.basePath}/api/v1/payment-cases/${caseId}/outstanding-balance`);
  }

  getCasesByPatient(
    patientId: number,
    page = 0,
    size = 20,
    sortBy = 'openedAt',
    direction = 'desc'
  ): Observable<ApiEnvelope<PageResponse<PaymentCaseSummaryDto>>> {
    const params = toParams({ page, size, sortBy, direction });
    return this.http.get<ApiEnvelope<PageResponse<PaymentCaseSummaryDto>>>(`${this.basePath}/api/v1/payment-cases/patient/${patientId}`, { params });
  }

  getTransactions(
    caseId: number,
    page = 0,
    size = 20,
    sortBy = 'transactionAt',
    direction = 'desc'
  ): Observable<ApiEnvelope<PageResponse<PaymentTransactionDto>>> {
    const params = toParams({ page, size, sortBy, direction });
    return this.http.get<ApiEnvelope<PageResponse<PaymentTransactionDto>>>(`${this.basePath}/api/v1/payment-cases/${caseId}/transactions`, { params });
  }

  recordTransaction(caseId: number, payload: PaymentTransactionCreateRequestDto): Observable<ApiEnvelope<PaymentTransactionDto>> {
    return this.http.post<ApiEnvelope<PaymentTransactionDto>>(`${this.basePath}/api/v1/payment-cases/${caseId}/transactions`, payload);
  }

  getMilestones(caseId: number): Observable<ApiEnvelope<PaymentMilestoneDto[]>> {
    return this.http.get<ApiEnvelope<PaymentMilestoneDto[]>>(`${this.basePath}/api/v1/payment-cases/${caseId}/milestones`);
  }

  addMilestone(caseId: number, payload: PaymentMilestoneUpsertRequestDto): Observable<ApiEnvelope<PaymentMilestoneDto>> {
    return this.http.post<ApiEnvelope<PaymentMilestoneDto>>(`${this.basePath}/api/v1/payment-cases/${caseId}/milestones`, payload);
  }

  updateMilestone(caseId: number, milestoneId: number, payload: PaymentMilestoneUpsertRequestDto): Observable<ApiEnvelope<PaymentMilestoneDto>> {
    return this.http.put<ApiEnvelope<PaymentMilestoneDto>>(`${this.basePath}/api/v1/payment-cases/${caseId}/milestones/${milestoneId}`, payload);
  }

  updatePaymentStatus(caseId: number, payload: UpdatePaymentStatusRequestDto): Observable<ApiEnvelope<PaymentCaseDetailsDto>> {
    return this.http.patch<ApiEnvelope<PaymentCaseDetailsDto>>(`${this.basePath}/api/v1/payment-cases/${caseId}/payment-status`, payload);
  }

  updateInsuranceStatus(caseId: number, payload: UpdateInsuranceStatusRequestDto): Observable<ApiEnvelope<PaymentCaseDetailsDto>> {
    return this.http.patch<ApiEnvelope<PaymentCaseDetailsDto>>(`${this.basePath}/api/v1/payment-cases/${caseId}/insurance-status`, payload);
  }

  updateFinancialClearance(caseId: number, payload: UpdateFinancialClearanceRequestDto): Observable<ApiEnvelope<PaymentCaseDetailsDto>> {
    return this.http.patch<ApiEnvelope<PaymentCaseDetailsDto>>(`${this.basePath}/api/v1/payment-cases/${caseId}/financial-clearance`, payload);
  }

  updateBillingStatus(caseId: number, payload: UpdateBillingStatusRequestDto): Observable<ApiEnvelope<PaymentCaseDetailsDto>> {
    return this.http.patch<ApiEnvelope<PaymentCaseDetailsDto>>(`${this.basePath}/api/v1/payment-cases/${caseId}/billing-status`, payload);
  }
}

@Injectable({ providedIn: 'root' })
export class PFEWorkflowService {
  private readonly http = inject(HttpClient);
  private readonly basePath = inject(API_BASE_PATH, { optional: true }) ?? '';

  submit(payload: PfeSubmitRequestDto): Observable<ApiEnvelope<PfeCaseResponseDto>> {
    return this.http.post<ApiEnvelope<PfeCaseResponseDto>>(`${this.basePath}/api/v1/pfe/workflow/submit`, payload);
  }

  review(caseId: number, payload: PfeActionRequestDto): Observable<ApiEnvelope<PfeCaseResponseDto>> {
    return this.http.post<ApiEnvelope<PfeCaseResponseDto>>(`${this.basePath}/api/v1/pfe/workflow/${caseId}/review`, payload);
  }

  approve(caseId: number, payload: PfeActionRequestDto): Observable<ApiEnvelope<PfeCaseResponseDto>> {
    return this.http.post<ApiEnvelope<PfeCaseResponseDto>>(`${this.basePath}/api/v1/pfe/workflow/${caseId}/approve`, payload);
  }

  reject(caseId: number, payload: PfeRejectRequestDto): Observable<ApiEnvelope<PfeCaseResponseDto>> {
    return this.http.post<ApiEnvelope<PfeCaseResponseDto>>(`${this.basePath}/api/v1/pfe/workflow/${caseId}/reject`, payload);
  }

  history(caseId: number): Observable<ApiEnvelope<PfeCaseHistoryResponseDto[]>> {
    return this.http.get<ApiEnvelope<PfeCaseHistoryResponseDto[]>>(`${this.basePath}/api/v1/pfe/workflow/${caseId}/history`);
  }
}
