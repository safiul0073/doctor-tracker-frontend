import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest, buildQueryString } from "@/lib/api";
import type { PatientFormValues } from "@/lib/validators";
import type { ApiResponse, PaginatedResponse, Patient } from "@/types";
import { analyticsKeys } from "./useAnalytics";
import { doctorKeys } from "./useDoctors";

export interface PatientsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  condition?: string;
  doctorId?: string;
  gender?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  list: (params: PatientsQueryParams) => [...patientKeys.lists(), params] as const,
  detail: (id: string) => [...patientKeys.all, "detail", id] as const,
};

export function usePatients(params: PatientsQueryParams) {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: () =>
      apiRequest<PaginatedResponse<Patient>>(
        `/patients${buildQueryString(params as Record<string, string | number | undefined>)}`
      ),
    placeholderData: keepPreviousData,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: PatientFormValues) => {
      const res = await apiRequest<ApiResponse<Patient>>("/patients", {
        method: "POST",
        body: JSON.stringify(values),
      });
      return res.data;
    },
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      queryClient.invalidateQueries({ queryKey: doctorKeys.all });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      toast.success(`Patient ${patient.name} registered`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to register patient");
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: Partial<PatientFormValues>;
    }) => {
      const res = await apiRequest<ApiResponse<Patient>>(`/patients/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      return res.data;
    },
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      queryClient.invalidateQueries({ queryKey: doctorKeys.all });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      toast.success(`Updated patient ${patient.name}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update patient");
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/patients/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      queryClient.invalidateQueries({ queryKey: doctorKeys.all });
      queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
      toast.success("Patient deleted successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete patient");
    },
  });
}
