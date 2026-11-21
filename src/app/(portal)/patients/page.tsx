"use client";

import {
  Calendar,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Stethoscope,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { PatientFormModal } from "@/components/patients/PatientFormModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { ConditionBadge } from "@/components/ui/ConditionBadge";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { useDoctorFilters } from "@/hooks/useDoctors";
import {
  useCreatePatient,
  useDeletePatient,
  usePatients,
  useUpdatePatient,
} from "@/hooks/usePatients";
import { cn, formatDate, getInitials } from "@/lib/utils";
import type { PatientFormValues } from "@/lib/validators";
import {
  PATIENT_CONDITIONS,
  PATIENT_GENDERS,
  type Patient,
} from "@/types";

function PatientsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(5, Number(searchParams.get("limit") || "10")));
  const urlSearch = searchParams.get("search") || "";
  const condition = searchParams.get("condition") || "";
  const doctorId = searchParams.get("doctorId") || "";
  const gender = searchParams.get("gender") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const sortBy = searchParams.get("sortBy") || "admittedAt";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 300);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") {
          sp.delete(key);
        } else {
          sp.set(key, String(value));
        }
      }
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateParams({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, urlSearch, updateParams]);

  const { data: filterOptions } = useDoctorFilters();
  const { data, isLoading, isFetching } = usePatients({
    page,
    limit,
    search: urlSearch,
    condition,
    doctorId,
    gender,
    from,
    to,
    sortBy,
    sortOrder,
  });

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  const hasActiveFilters = Boolean(
    urlSearch || condition || doctorId || gender || from || to
  );

  const resetFilters = () => {
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  };

  const handleCreate = async (values: PatientFormValues) => {
    await createPatient.mutateAsync(values);
    setCreateOpen(false);
  };

  const handleEdit = async (values: PatientFormValues) => {
    if (!editingPatient) return;
    await updatePatient.mutateAsync({ id: editingPatient._id, values });
    setEditingPatient(null);
  };

  const handleDelete = async () => {
    if (!deletingPatient) return;
    await deletePatient.mutateAsync(deletingPatient._id);
    setDeletingPatient(null);
  };

  const patients = data?.data ?? [];
  const doctorOptions = filterOptions?.doctors ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Patients Directory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Search, filter by condition or admission date, edit clinical details, and manage all patients.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-600/20 transition-colors hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Add Patient
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 items-center">
          {/* Search */}
          <div className="relative md:col-span-5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search patient name, diagnosis, or doctor..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Condition */}
          <div className="md:col-span-3">
            <select
              aria-label="Filter by patient condition"
              value={condition}
              onChange={(e) => updateParams({ condition: e.target.value, page: 1 })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="">All Conditions</option>
              {PATIENT_CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor */}
          <div className="md:col-span-2">
            <select
              aria-label="Filter by doctor"
              value={doctorId}
              onChange={(e) => updateParams({ doctorId: e.target.value, page: 1 })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="">All Doctors</option>
              {doctorOptions.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div className="md:col-span-2">
            <select
              aria-label="Filter by gender"
              value={gender}
              onChange={(e) => updateParams({ gender: e.target.value, page: 1 })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="">All Genders</option>
              {PATIENT_GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Range */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">Admitted:</span>
              <input
                type="date"
                aria-label="Admitted from date"
                value={from}
                onChange={(e) => updateParams({ from: e.target.value, page: 1 })}
                className="text-xs text-slate-700 focus:outline-none"
              />
              <span className="text-xs text-slate-300">–</span>
              <input
                type="date"
                aria-label="Admitted to date"
                value={to}
                onChange={(e) => updateParams({ to: e.target.value, page: 1 })}
                className="text-xs text-slate-700 focus:outline-none"
              />
            </div>

            {/* Sort */}
            <select
              aria-label="Sort patients"
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split(":");
                updateParams({ sortBy: field, sortOrder: order, page: 1 });
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="admittedAt:desc">Sort: Most Recent</option>
              <option value="admittedAt:asc">Sort: Oldest</option>
              <option value="name:asc">Sort: Name A–Z</option>
              <option value="age:desc">Sort: Age (High–Low)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                <strong className="font-semibold text-slate-800">
                  {data?.meta?.total ?? 0}
                </strong>{" "}
                matching patients
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Patient Records */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : patients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No patients found"
            description={
              hasActiveFilters
                ? "Try clearing or adjusting your search, condition, doctor, or date filters."
                : "Register your first patient to start tracking clinical records."
            }
            actionLabel={hasActiveFilters ? "Reset filters" : "Add Patient"}
            onAction={hasActiveFilters ? resetFilters : () => setCreateOpen(true)}
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div
              className={cn(
                "hidden overflow-x-auto md:block transition-opacity",
                isFetching && "opacity-65"
              )}
            >
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3.5">Patient</th>
                    <th className="px-4 py-3.5">Condition &amp; Diagnosis</th>
                    <th className="px-4 py-3.5">Assigned Doctor</th>
                    <th className="px-4 py-3.5">Contact</th>
                    <th className="px-3 py-3.5">Admitted</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((patient) => {
                    const doc =
                      typeof patient.doctor === "string" ? null : patient.doctor;
                    return (
                      <tr
                        key={patient._id}
                        className="transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                              {getInitials(patient.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 whitespace-nowrap">
                                {patient.name}
                              </p>
                              <p className="text-xs text-slate-500 whitespace-nowrap">
                                {patient.age} yrs &middot; {patient.gender}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <ConditionBadge condition={patient.condition} />
                          <p className="mt-1 text-xs font-medium text-slate-700">
                            {patient.diagnosis}
                          </p>
                        </td>

                        <td className="px-4 py-3.5">
                          {doc ? (
                            <div>
                              <Link
                                href={`/doctors/${doc._id}`}
                                className="inline-flex items-center gap-1.5 font-medium text-teal-700 hover:underline whitespace-nowrap"
                              >
                                <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                                {doc.name}
                              </Link>
                              <p className="text-xs text-slate-500">
                                {doc.specialization}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Unassigned</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-xs text-slate-600">
                          <p className="flex items-center gap-1.5 whitespace-nowrap">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            {patient.phone}
                          </p>
                          {patient.email && (
                            <p className="mt-0.5 max-w-[170px] truncate text-slate-400">
                              {patient.email}
                            </p>
                          )}
                        </td>

                        <td className="px-3 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(patient.admittedAt)}
                        </td>

                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingPatient(patient)}
                              title="Edit patient"
                              aria-label={`Edit ${patient.name}`}
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingPatient(patient)}
                              title="Delete patient"
                              aria-label={`Delete ${patient.name}`}
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {patients.map((patient) => {
                const doc =
                  typeof patient.doctor === "string" ? null : patient.doctor;
                return (
                  <div key={patient._id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{patient.name}</p>
                        <p className="text-xs text-slate-500">
                          {patient.age} yrs &middot; {patient.gender} &middot;{" "}
                          {patient.diagnosis}
                        </p>
                      </div>
                      <ConditionBadge condition={patient.condition} />
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      {doc && (
                        <p>
                          Doctor:{" "}
                          <Link
                            href={`/doctors/${doc._id}`}
                            className="font-semibold text-teal-700"
                          >
                            {doc.name}
                          </Link>{" "}
                          ({doc.specialization})
                        </p>
                      )}
                      <p className="flex items-center justify-between text-slate-500">
                        <span>{patient.phone}</span>
                        <span>{formatDate(patient.admittedAt)}</span>
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-2.5">
                      <button
                        type="button"
                        onClick={() => setEditingPatient(patient)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingPatient(patient)}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              meta={data?.meta}
              isFetching={isFetching}
              onPageChange={(nextPage) => updateParams({ page: nextPage })}
              onLimitChange={(nextLimit) =>
                updateParams({ limit: nextLimit, page: 1 })
              }
            />
          </>
        )}
      </div>

      {/* Modals */}
      <PatientFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        doctors={doctorOptions}
        onSubmit={handleCreate}
        isSubmitting={createPatient.isPending}
      />

      <PatientFormModal
        open={Boolean(editingPatient)}
        onClose={() => setEditingPatient(null)}
        patient={editingPatient}
        doctors={doctorOptions}
        onSubmit={handleEdit}
        isSubmitting={updatePatient.isPending}
      />

      <ConfirmDialog
        open={Boolean(deletingPatient)}
        onClose={() => setDeletingPatient(null)}
        onConfirm={handleDelete}
        title="Delete Patient Record"
        description={
          deletingPatient
            ? `Are you sure you want to permanently delete ${deletingPatient.name}'s record? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete Patient"
        isLoading={deletePatient.isPending}
      />
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      }
    >
      <PatientsContent />
    </Suspense>
  );
}
