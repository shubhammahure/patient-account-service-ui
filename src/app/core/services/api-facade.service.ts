import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import type {
  ApiResponse,
  AuthTokenResponse,
  CurrentUser,
  PagedResponse,
  PatientSummary,
  PaymentCaseSummary,
} from '../models/api.models';
import type {
  AdmitPatientRequest,
  DischargePatientRequest,
  LoginRequest,
  PatientCreateRequest,
  PaymentCaseCreateRequest,
  PfeActionRequest,
  PfeRejectRequest,
  PfeSubmitRequest,
  RefreshTokenRequest,
} from '../models/request.models';

@Injectable({ providedIn: 'root' })
export class ApiFacadeService {
  private readonly http = inject(HttpClient);

  login(payload: LoginRequest): Observable<AuthTokenResponse> {
    return this.http
      .post<ApiResponse<AuthTokenResponse>>('/api/v1/auth/login', payload)
      .pipe(map((response) => response.data));
  }

  refreshToken(payload: RefreshTokenRequest): Observable<AuthTokenResponse> {
    return this.http
      .post<ApiResponse<AuthTokenResponse>>('/api/v1/auth/token/refresh', payload)
      .pipe(map((response) => response.data));
  }

  currentUser(): Observable<CurrentUser> {
    return this.http.get<ApiResponse<CurrentUser>>('/api/v1/auth/me').pipe(map((response) => response.data));
  }

  searchPatients(criteria: Record<string, string>, page = 0, size = 20): Observable<PagedResponse<PatientSummary>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', 'createdAt')
      .set('direction', 'desc');

    Object.entries(criteria).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });

    return this.http
      .get<ApiResponse<PagedResponse<PatientSummary>>>('/api/v1/patients', { params })
      .pipe(map((response) => response.data));
  }

  createPatient(payload: PatientCreateRequest): Observable<PatientSummary> {
    return this.http.post<ApiResponse<PatientSummary>>('/api/v1/patients', payload).pipe(map((response) => response.data));
  }

  listPaymentCases(): Observable<PagedResponse<PaymentCaseSummary>> {
    const params = new HttpParams().set('page', 0).set('size', 20).set('sortBy', 'openedAt').set('direction', 'desc');
    return this.http
      .get<ApiResponse<PagedResponse<PaymentCaseSummary>>>('/api/v1/payment-cases', { params })
      .pipe(map((response) => response.data));
  }

  createPaymentCase(payload: PaymentCaseCreateRequest): Observable<PaymentCaseSummary> {
    return this.http
      .post<ApiResponse<PaymentCaseSummary>>('/api/v1/payment-cases', payload)
      .pipe(map((response) => response.data));
  }

  admitPatient(payload: AdmitPatientRequest): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>('/api/v1/admissions/admit', payload).pipe(map((response) => response.data));
  }

  dischargePatient(admissionId: number, payload: DischargePatientRequest): Observable<unknown> {
    return this.http
      .post<ApiResponse<unknown>>(`/api/v1/admissions/${admissionId}/discharge`, payload)
      .pipe(map((response) => response.data));
  }

  submitPfe(payload: PfeSubmitRequest): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>('/api/v1/pfe/workflow/submit', payload).pipe(map((response) => response.data));
  }

  reviewPfe(caseId: number, payload: PfeActionRequest): Observable<unknown> {
    return this.http
      .post<ApiResponse<unknown>>(`/api/v1/pfe/workflow/${caseId}/review`, payload)
      .pipe(map((response) => response.data));
  }

  approvePfe(caseId: number, payload: PfeActionRequest): Observable<unknown> {
    return this.http
      .post<ApiResponse<unknown>>(`/api/v1/pfe/workflow/${caseId}/approve`, payload)
      .pipe(map((response) => response.data));
  }

  rejectPfe(caseId: number, payload: PfeRejectRequest): Observable<unknown> {
    return this.http
      .post<ApiResponse<unknown>>(`/api/v1/pfe/workflow/${caseId}/reject`, payload)
      .pipe(map((response) => response.data));
  }
}

