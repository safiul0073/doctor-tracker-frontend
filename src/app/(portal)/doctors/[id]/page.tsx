"use client";

import {
  ArrowLeft,
  Building2,
  Calendar,
  Mail,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { DoctorFormModal } from "@/components/doctors/DoctorFormModal";
import { PatientFormModal } from "@/components/patients/PatientFormModal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Pagination } from "@/components/shared/Pagination";
import { ConditionBadge } from "@/components/ui/ConditionBadge";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useAddPatientToDoctor,
  useDoctor,
  useDoctorPatients,
  useRemovePatientFromDoctor,
  useUpdateDoctor,
} from "@/hooks/useDoctors";
import { useUpdatePatient } from "@/hooks/usePatients";
import { cn, formatDate, getInitials } from "@/lib/utils";
import type { DoctorFormValues, PatientFormValues } from "@/lib/validators";
import { PATIENT_CONDITIONS, type Patient, type PatientCondition } from "@/types";

export default function DoctorDetailPage() {
  const params = useParams<{ id: string }>();
  const doctorId = params.id;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [condition, setCondition] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [editDoctorOpen, setEditDoctorOpen] = useState(false);
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  const { data: doctor, isLoading: doctorLoading, isError: doctorError } =
    useDoctor(doctorId);

  const {
    data: patientsRes,
    isLoading: patientsLoading,
    isFetching: patientsFetching,
  } = useDoctorPatients(doctorId, {
    page,
    limit,
    search: debouncedSearch,
    condition,
    from,
    to,
  });

  const updateDoctor = useUpdateDoctor(doctorId);
  const addPatient = useAddPatientToDoctor(doctorId);
  const updatePatient = useUpdatePatient();
  const removePatient = useRemovePatientFromDoctor(doctorId);

  const hasFilters = Boolean(searchInput || condition || from || to);

  const resetFilters = () => {
    setSearchInput("");
    setCondition("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const handleUpdateDoctor = async (values: DoctorFormValues) => {
    await updateDoctor.mutateAsync(values);
    setEditDoctorOpen(false);
  };

  const handleAddPatient = async (values: PatientFormValues) => {
    await addPatient.mutateAsync(values);
    setAddPatientOpen(false);
  };

  const handleEditPatient = async (values: PatientFormValues) => {
    if (!editingPatient) return;
    await updatePatient.mutateAsync({ id: editingPatient._id, values });
    setEditingPatient(null);
  };

  const handleRemovePatient = async () => {
    if (!deletingPatient) return;
    await removePatient.mutateAsync(deletingPatient._id);
    setDeletingPatient(null);
  };

  if (doctorError) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-base font-semibold text-slate-900">Doctor not found</p>
        <p className="mt-1 text-sm text-slate-500">
          This physician record may have been removed.
        </p>
        <Link
          href="/doctors"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors
        </Link>
      </div>
    );
  }

  const patients = patientsRes?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Doctors
        </Link>
      </div>

      {/* Doctor Profile Header Card */}
      {doctorLoading || !doctor ? (
        <Skeleton className="h-44 w-full rounded-2xl" />
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-lg font-bold text-teal-700 ring-1 ring-teal-200/70">
                {getInitials(doctor.name)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {doctor.name}
                  </h1>
                  <span className="rounded-full bg-teal-50 px-3 py-0.5 text-xs font-semibold text-teal-700 ring-1 ring-teal-200/70">
                    {doctor.specialization}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {doctor.hospital}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {doctor.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {doctor.phone}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Joined {formatDate(doctor.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setEditDoctorOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
              <button
                type="button"
                onClick={() => setAddPatientOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-teal-600/20 transition-colors hover:bg-teal-700"
              >
                <UserPlus className="h-4 w-4" />
                Add Patient
              </button>
            </div>
          </div>

          {/* Caseload Condition Summary Bar */}
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800">
              <Users className="h-3.5 w-3.5 text-teal-600" />
              {doctor.patientCount} Total Patients
            </div>
            {PATIENT_CONDITIONS.map((cond) => {
              const count = doctor.conditionSummary?.[cond] ?? 0;
              if (count === 0) return null;
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => {
                    setCondition((prev) => (prev === cond ? "" : cond));
                    setPage(1);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full transition-transform hover:scale-[1.02]",
                    condition === cond && "ring-2 ring-teal-500 ring-offset-1"
                  )}
                >
                  <ConditionBadge condition={cond as PatientCondition} />
                  <span className="pr-1 text-xs font-semibold text-slate-700">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Corresponding Patients Panel */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Assigned Patients
            </h2>
            <p className="text-xs text-slate-500">
              View, filter, add, or remove patients assigned to this physician.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddPatientOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100"
          >
            <Plus className="h-3.5 w-3.5" />
            New Patient under Doctor
          </button>
        </div>

        {/* Sub-filters */}
        <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50/50 p-4 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              placeholder="Search patient name, diagnosis, phone..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="md:col-span-3">
            <select
              aria-label="Filter by patient condition"
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                setPage(1);
              }}
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

          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 md:col-span-4">
            <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="date"
              aria-label="Admitted from"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              className="min-w-0 flex-1 text-xs text-slate-700 focus:outline-none"
            />
            <span className="text-xs text-slate-300">–</span>
            <input
              type="date"
              aria-label="Admitted to"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
              className="min-w-0 flex-1 text-xs text-slate-700 focus:outline-none"
            />
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                title="Reset filters"
                className="rounded-md p-1 text-teal-600 hover:bg-teal-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table / Cards */}
        {patientsLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : patients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No patients found"
            description={
              hasFilters
                ? "No patients match the current filters for this doctor."
                : "Add a patient directly under this doctor to begin tracking care."
            }
            actionLabel={hasFilters ? "Reset filters" : "Add Patient"}
            onAction={hasFilters ? resetFilters : () => setAddPatientOpen(true)}
          />
        ) : (
          <>
            <div
              className={cn(
                "hidden overflow-x-auto md:block transition-opacity",
                patientsFetching && "opacity-65"
              )}
            >
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Diagnosis</th>
                    <th className="px-3 py-3">Condition</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-3 py-3">Admitted</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-900 whitespace-nowrap">
                          {patient.name}
                        </p>
                        <p className="text-xs text-slate-500 whitespace-nowrap">
                          {patient.age} yrs &middot; {patient.gender}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        <p className="font-medium text-slate-800">{patient.diagnosis}</p>
                        {patient.notes && (
                          <p
                            title={patient.notes}
                            className="mt-0.5 max-w-[180px] truncate text-xs text-slate-400"
                          >
                            {patient.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        <ConditionBadge condition={patient.condition} />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        <p className="whitespace-nowrap">{patient.phone}</p>
                        {patient.email && (
                          <p className="max-w-[170px] truncate text-slate-400">
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
                            aria-label={`Edit ${patient.name}`}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingPatient(patient)}
                            aria-label={`Remove ${patient.name}`}
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
              {patients.map((patient) => (
                <div key={patient._id} className="space-y-2.5 p-4">
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
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{patient.phone}</span>
                    <span>{formatDate(patient.admittedAt)}</span>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingPatient(patient)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingPatient(patient)}
                      className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              meta={patientsRes?.meta}
              isFetching={patientsFetching}
              onPageChange={setPage}
              onLimitChange={(next) => {
                setLimit(next);
                setPage(1);
              }}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <DoctorFormModal
        open={editDoctorOpen}
        onClose={() => setEditDoctorOpen(false)}
        doctor={doctor}
        onSubmit={handleUpdateDoctor}
        isSubmitting={updateDoctor.isPending}
      />

      <PatientFormModal
        open={addPatientOpen}
        onClose={() => setAddPatientOpen(false)}
        fixedDoctorId={doctorId}
        fixedDoctorName={doctor?.name}
        onSubmit={handleAddPatient}
        isSubmitting={addPatient.isPending}
      />

      <PatientFormModal
        open={Boolean(editingPatient)}
        onClose={() => setEditingPatient(null)}
        patient={editingPatient}
        fixedDoctorId={doctorId}
        fixedDoctorName={doctor?.name}
        onSubmit={handleEditPatient}
        isSubmitting={updatePatient.isPending}
      />

      <ConfirmDialog
        open={Boolean(deletingPatient)}
        onClose={() => setDeletingPatient(null)}
        onConfirm={handleRemovePatient}
        title="Remove Patient from Doctor"
        description={
          deletingPatient
            ? `Are you sure you want to delete ${deletingPatient.name} from ${doctor?.name}'s patient list? This action cannot be undone.`
            : ""
        }
        confirmLabel="Remove Patient"
        isLoading={removePatient.isPending}
      />
    </div>
  );
}
