export interface ApiResponse<T> {
  timestamp: string;
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  code: string;
  message: string;
  details: string[];
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  sort: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
}

export interface CurrentUser {
  userId: number;
  username: string;
  email: string;
  roles: string[];
}

export interface PatientSummary {
  patientId: number;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  accountNumber?: string;
  mrn?: string;
  status?: string;
}

export interface PaymentCaseSummary {
  pathToPaymentCaseId: number;
  patientId: number;
  paymentCaseRef?: string;
  paymentStatus?: string;
  insuranceStatus?: string;
  financialClearanceStatus?: string;
  billingStatus?: string;
  outstandingBalance?: number;
}

