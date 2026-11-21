"use client";

import {
  Building2,
  Calendar,
  Eye,
  Mail,
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
import { DoctorFormModal } from "@/components/doctors/DoctorFormModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useCreateDoctor,
  useDeleteDoctor,
  useDoctorFilters,
  useDoctors,
  useUpdateDoctor,
} from "@/hooks/useDoctors";
import { cn, formatDate, getInitials } from "@/lib/utils";
import type { DoctorFormValues } from "@/lib/validators";
import type { Doctor } from "@/types";

function DoctorsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sync filter & pagination state with URL search params
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(5, Number(searchParams.get("limit") || "10")));
  const urlSearch = searchParams.get("search") || "";
  const specialization = searchParams.get("specialization") || "";
  const hospital = searchParams.get("hospital") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce(searchInput, 300);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);

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

  // Sync debounced search into URL
  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      updateParams({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, urlSearch, updateParams]);

  const { data: filterOptions } = useDoctorFilters();
  const { data, isLoading, isFetching } = useDoctors({
    page,
    limit,
    search: urlSearch,
    specialization,
    hospital,
    from,
    to,
    sortBy,
    sortOrder,
  });

  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor(editingDoctor?._id ?? "");
  const deleteDoctor = useDeleteDoctor();

  const hasActiveFilters = Boolean(
    urlSearch || specialization || hospital || from || to
  );

  const resetFilters = () => {
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  };

  const handleCreate = async (values: DoctorFormValues) => {
    await createDoctor.mutateAsync(values);
    setCreateOpen(false);
  };

  const handleEdit = async (values: DoctorFormValues) => {
    if (!editingDoctor) return;
    await updateDoctor.mutateAsync(values);
    setEditingDoctor(null);
  };

  const handleDelete = async () => {
    if (!deletingDoctor) return;
    await deleteDoctor.mutateAsync(deletingDoctor._id);
    setDeletingDoctor(null);
  };

  const doctors = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Doctors Directory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage physicians, filter by specialty or date, and inspect assigned patients.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-600/20 transition-colors hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Add Doctor
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 items-center">
          {/* Search */}
          <div className="relative md:col-span-6">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by doctor name, specialty, hospital, or email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Specialization */}
          <div className="md:col-span-3">
            <select
              aria-label="Filter by specialization"
              value={specialization}
              onChange={(e) =>
                updateParams({ specialization: e.target.value, page: 1 })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="">All Specializations</option>
              {(filterOptions?.specializations ?? []).map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Hospital */}
          <div className="md:col-span-3">
            <select
              aria-label="Filter by hospital"
              value={hospital}
              onChange={(e) => updateParams({ hospital: e.target.value, page: 1 })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="">All Hospitals</option>
              {(filterOptions?.hospitals ?? []).map((hosp) => (
                <option key={hosp} value={hosp}>
                  {hosp}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date Range */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">Joined:</span>
              <input
                type="date"
                aria-label="Added from date"
                value={from}
                onChange={(e) => updateParams({ from: e.target.value, page: 1 })}
                className="text-xs text-slate-700 focus:outline-none"
              />
              <span className="text-xs text-slate-300">–</span>
              <input
                type="date"
                aria-label="Added to date"
                value={to}
                onChange={(e) => updateParams({ to: e.target.value, page: 1 })}
                className="text-xs text-slate-700 focus:outline-none"
              />
            </div>

            <select
              aria-label="Sort doctors"
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split(":");
                updateParams({ sortBy: field, sortOrder: order, page: 1 });
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="createdAt:desc">Sort: Newest</option>
              <option value="createdAt:asc">Sort: Oldest</option>
              <option value="name:asc">Sort: Name A–Z</option>
              <option value="patientCount:desc">Sort: Most Patients</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                <strong className="font-semibold text-slate-800">
                  {data?.meta?.total ?? 0}
                </strong>{" "}
                matching doctors
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

      {/* Directory List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : doctors.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No doctors found"
            description={
              hasActiveFilters
                ? "Try adjusting your search keywords, specialty, or date filters."
                : "Get started by adding your first doctor to the directory."
            }
            actionLabel={hasActiveFilters ? "Reset filters" : "Add Doctor"}
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
                    <th className="px-4 py-3.5">Doctor</th>
                    <th className="px-4 py-3.5">Hospital</th>
                    <th className="px-4 py-3.5">Contact</th>
                    <th className="px-3 py-3.5 text-center">Patients</th>
                    <th className="px-3 py-3.5">Joined</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctors.map((doctor) => (
                    <tr
                      key={doctor._id}
                      className="group transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xs font-bold text-teal-700 ring-1 ring-teal-100">
                            {getInitials(doctor.name)}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/doctors/${doctor._id}`}
                              className="block truncate font-semibold text-slate-900 hover:text-teal-700"
                            >
                              {doctor.name}
                            </Link>
                            <span className="mt-0.5 inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                              {doctor.specialization}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span>{doctor.hospital}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5 text-xs text-slate-600">
                          <p className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="truncate max-w-[190px]">{doctor.email}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="whitespace-nowrap">{doctor.phone}</span>
                          </p>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 text-center">
                        <Link
                          href={`/doctors/${doctor._id}`}
                          className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-200/70 transition-colors hover:bg-teal-100"
                        >
                          <Users className="h-3.5 w-3.5" />
                          {doctor.patientCount}
                        </Link>
                      </td>

                      <td className="px-3 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(doctor.createdAt)}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/doctors/${doctor._id}`}
                            title="View patients"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Patients
                          </Link>
                          <button
                            type="button"
                            onClick={() => setEditingDoctor(doctor)}
                            title="Edit doctor"
                            aria-label={`Edit ${doctor.name}`}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingDoctor(doctor)}
                            title="Delete doctor"
                            aria-label={`Delete ${doctor.name}`}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {doctors.map((doctor) => (
                <div key={doctor._id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xs font-bold text-teal-700">
                        {getInitials(doctor.name)}
                      </div>
                      <div>
                        <Link
                          href={`/doctors/${doctor._id}`}
                          className="font-semibold text-slate-900"
                        >
                          {doctor.name}
                        </Link>
                        <p className="text-xs font-medium text-teal-700">
                          {doctor.specialization}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                      <Users className="h-3 w-3" />
                      {doctor.patientCount}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {doctor.hospital}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {doctor.email}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {doctor.phone}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-[11px] text-slate-400">
                      Added {formatDate(doctor.createdAt)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/doctors/${doctor._id}`}
                        className="rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-700"
                      >
                        View Patients
                      </Link>
                      <button
                        type="button"
                        onClick={() => setEditingDoctor(doctor)}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600"
                        aria-label={`Edit ${doctor.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingDoctor(doctor)}
                        className="rounded-lg border border-rose-200 p-1.5 text-rose-600"
                        aria-label={`Delete ${doctor.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
      <DoctorFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={createDoctor.isPending}
      />

      <DoctorFormModal
        open={Boolean(editingDoctor)}
        onClose={() => setEditingDoctor(null)}
        doctor={editingDoctor}
        onSubmit={handleEdit}
        isSubmitting={updateDoctor.isPending}
      />

      <ConfirmDialog
        open={Boolean(deletingDoctor)}
        onClose={() => setDeletingDoctor(null)}
        onConfirm={handleDelete}
        title="Delete Doctor"
        description={
          deletingDoctor
            ? `Are you sure you want to remove ${deletingDoctor.name}? This will also permanently delete ${deletingDoctor.patientCount} assigned patient record${deletingDoctor.patientCount === 1 ? "" : "s"}.`
            : ""
        }
        confirmLabel="Delete Doctor"
        isLoading={deleteDoctor.isPending}
      />
    </div>
  );
}

export default function DoctorsPage() {
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
      <DoctorsContent />
    </Suspense>
  );
}
