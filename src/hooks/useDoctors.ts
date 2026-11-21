import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest, buildQueryString } from "@/lib/api";
import type { DoctorFormValues, PatientFormValues } from "@/lib/validators";
import type {
  ApiResponse,
  Doctor,
  DoctorFilterOptions,
  PaginatedResponse,
  Patient,
} from "@/types";
import { analyticsKeys } from "./useAnalytics";
import { patientKeys } from "./usePatients";

export interface DoctorsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  hospital?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DoctorPatientsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  condition?: string;
  gender?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const doctorKeys = {
  all: ["doctors"] as const,
  lists: () => [...doctorKeys.all, "list"] as const,
  list: (params: DoctorsQueryParams) => [...doctorKeys.lists(), params] as const,
  filters: () => [...doctorKeys.all, "filters"] as const,
  details: () => [...doctorKeys.all, "detail"] as const,
  detail: (id: string) => [...doctorKeys.details(), id] as const,
  patients: (id: string, params: DoctorPatientsQueryParams) =>
    [...doctorKeys.detail(id), "patients", params] as const,
};

export function useDoctors(params: DoctorsQueryParams) {
  return useQuery({
    queryKey: doctorKeys.list(params),
    queryFn: () =>
      apiRequest<PaginatedResponse<Doctor>>(
        `/doctors${buildQueryString(params as Record<string, string | number | undefined>)}`
      ),
    placeholderData: keepPreviousData,
  });
}

export function useDoctorFilters() {
  return useQuery({
    queryKey: doctorKeys.filters(),
    queryFn: async () => {
      const res = await apiRequest<ApiResponse<DoctorFilterOptions>>("/doctors/filters");
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: async () => {
      const res = await apiRequest<ApiResponse<Doctor>>(`/doctors/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useDoctorPatients(id: string, params: DoctorPatientsQueryParams) {
  return useQuery({
    queryKey: doctorKeys.patients(id, params),
    queryFn: () =>
      apiRequest<PaginatedResponse<Patient>>(
        `/doctors/${id}/patients${buildQueryString(
          params as Record<string, string | number | undefined>
        )}`
      ),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: DoctorFormValues) => {
      const res = await apiRequest<ApiResponse<Doctor>>("/doctors", {
        method: "POST",
        body: JSON.stringify(values),
      });
      return res.data;
    },
    onSuccess: (doctor) => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.all });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      toast.success(`${doctor.name} added to directory`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create doctor");
    },
  });
}

export function useUpdateDoctor(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Partial<DoctorFormValues>) => {
      const res = await apiRequest<ApiResponse<Doctor>>(`/doctors/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      return res.data;
    },
    onSuccess: (doctor) => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.all });
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      toast.success(`Updated ${doctor.name}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update doctor");
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest<
        ApiResponse<{ deletedDoctorId: string; deletedPatientsCount: number }>
      >(`/doctors/${id}`, { method: "DELETE" });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.all });
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      toast.success("Doctor removed successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete doctor");
    },
  });
}

export function useAddPatientToDoctor(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: PatientFormValues) => {
      const payload = { ...values };
      delete payload.doctor;
      const res = await apiRequest<ApiResponse<Patient>>(
        `/doctors/${doctorId}/patients`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      return res.data;
    },
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.detail(doctorId) });
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      toast.success(`${patient.name} added to doctor's patient list`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add patient");
    },
  });
}

export function useRemovePatientFromDoctor(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientId: string) => {
      await apiRequest(`/doctors/${doctorId}/patients/${patientId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.detail(doctorId) });
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      toast.success("Patient removed from doctor's list");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to remove patient");
    },
  });
}
