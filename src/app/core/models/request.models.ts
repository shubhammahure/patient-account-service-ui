export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface PatientCreateRequest {
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

export interface AdmitPatientRequest {
  patientId: number;
  facilityId: number;
  departmentId: number;
  bedId?: number;
  admissionNumber: string;
  admissionType: string;
  ward?: string;
  room?: string;
  doctor: string;
  admissionDate: string;
  reason: string;
}

export interface DischargePatientRequest {
  dischargeDate: string;
  reason: string;
  summary?: string;
  disposition: string;
}

export interface PaymentCaseCreateRequest {
  patientId: number;
  admissionId?: number;
  pfeCaseId?: number;
  paymentCaseRef?: string;
  currentStep: string;
  totalCharges: number;
  allowedAmount: number;
  insuranceResponsibility: number;
  patientResponsibility: number;
  dueDate?: string;
  notes?: string;
}

export interface PfeSubmitRequest {
  patientId: number;
  admissionId?: number;
  caseReference?: string;
  workflowStage?: string;
  priority?: string;
  ownerUser?: string;
  comment: string;
}

export interface PfeActionRequest {
  comment: string;
}

export interface PfeRejectRequest {
  comment: string;
  denied?: boolean;
}

