export const PATIENT_CONDITIONS = [
  "Stable",
  "Under Observation",
  "Critical",
  "Recovering",
  "Discharged",
] as const;

export type PatientCondition = (typeof PATIENT_CONDITIONS)[number];

export const PATIENT_GENDERS = ["Male", "Female", "Other"] as const;
export type PatientGender = (typeof PATIENT_GENDERS)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin";
  createdAt?: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount: number;
  conditionSummary?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface PatientDoctorRef {
  _id: string;
  name: string;
  specialization: string;
  hospital?: string;
}

export interface Patient {
  _id: string;
  name: string;
  doctor: PatientDoctorRef | string;
  condition: PatientCondition;
  diagnosis: string;
  age: number;
  gender: PatientGender;
  phone: string;
  email?: string;
  admittedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface DoctorFilterOptions {
  specializations: string[];
  hospitals: string[];
  doctors: Array<{
    _id: string;
    name: string;
    specialization: string;
    hospital: string;
  }>;
}

export interface AnalyticsOverview {
  summary: {
    totalDoctors: number;
    totalPatients: number;
    avgPatientsPerDoctor: number;
    criticalPatients: number;
    newDoctorsInRange: number;
    newPatientsInRange: number;
  };
  patientsPerDoctor: Array<{
    doctorId: string;
    doctorName: string;
    specialization: string;
    hospital: string;
    patientCount: number;
  }>;
  dateStats: Array<{
    date: string;
    doctors: number;
    patients: number;
  }>;
  conditionBreakdown: Array<{
    condition: PatientCondition;
    count: number;
  }>;
  specializationBreakdown: Array<{
    specialization: string;
    doctors: number;
    patients: number;
  }>;
  recentPatients: Array<{
    _id: string;
    name: string;
    condition: PatientCondition;
    diagnosis: string;
    age: number;
    gender: PatientGender;
    admittedAt: string;
    doctor?: {
      _id: string;
      name: string;
      specialization: string;
    };
  }>;
}
