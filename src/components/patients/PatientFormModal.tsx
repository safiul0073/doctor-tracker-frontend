"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { toDateInputValue } from "@/lib/utils";
import { patientFormSchema, type PatientFormValues } from "@/lib/validators";
import {
  PATIENT_CONDITIONS,
  PATIENT_GENDERS,
  type Patient,
} from "@/types";

interface DoctorOption {
  _id: string;
  name: string;
  specialization: string;
}

interface PatientFormModalProps {
  open: boolean;
  onClose: () => void;
  patient?: Patient | null;
  fixedDoctorId?: string;
  fixedDoctorName?: string;
  doctors?: DoctorOption[];
  onSubmit: (values: PatientFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

const EMPTY_DOCTORS: DoctorOption[] = [];

export function PatientFormModal({
  open,
  onClose,
  patient,
  fixedDoctorId,
  fixedDoctorName,
  doctors = EMPTY_DOCTORS,
  onSubmit,
  isSubmitting = false,
}: PatientFormModalProps) {
  const isEditing = Boolean(patient);
  const firstDoctorId = doctors[0]?._id ?? "";

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: "",
      doctor: fixedDoctorId ?? "",
      condition: "Stable",
      diagnosis: "",
      age: 35,
      gender: "Female",
      phone: "",
      email: "",
      admittedAt: toDateInputValue(),
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    const assignedDocId =
      fixedDoctorId ||
      (patient
        ? typeof patient.doctor === "string"
          ? patient.doctor
          : patient.doctor?._id ?? ""
        : firstDoctorId);

    reset({
      name: patient?.name ?? "",
      doctor: assignedDocId,
      condition: patient?.condition ?? "Stable",
      diagnosis: patient?.diagnosis ?? "",
      age: patient?.age ?? 35,
      gender: patient?.gender ?? "Female",
      phone: patient?.phone ?? "",
      email: patient?.email ?? "",
      admittedAt: toDateInputValue(patient?.admittedAt),
      notes: patient?.notes ?? "",
    });
  }, [open, patient, fixedDoctorId, firstDoctorId, reset]);

  const handleFormSubmit = (values: PatientFormValues) => {
    if (!fixedDoctorId && !values.doctor) {
      setError("doctor", { message: "Please select an assigned doctor" });
      return;
    }
    return onSubmit(values);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Patient Record" : "Add New Patient"}
      description={
        fixedDoctorName
          ? `Assigning patient under ${fixedDoctorName}`
          : isEditing
            ? "Update clinical status, diagnosis, contact details, or doctor assignment."
            : "Create a new patient record and assign an attending physician."
      }
      size="lg"
    >
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
        noValidate
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Patient Name *
            </label>
            <input
              type="text"
              placeholder="Jordan Hayes"
              {...register("name")}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>
            )}
          </div>

          {!fixedDoctorId && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Assigned Doctor *
              </label>
              <select
                {...register("doctor")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="">Select a doctor</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.name} ({doc.specialization})
                  </option>
                ))}
              </select>
              {errors.doctor && (
                <p className="mt-1 text-xs text-rose-600">{errors.doctor.message}</p>
              )}
            </div>
          )}

          {fixedDoctorId && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Assigned Doctor
              </label>
              <input
                type="text"
                disabled
                value={fixedDoctorName || "Assigned Physician"}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Condition *
            </label>
            <select
              {...register("condition")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {PATIENT_CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
            {errors.condition && (
              <p className="mt-1 text-xs text-rose-600">{errors.condition.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Diagnosis *
            </label>
            <input
              type="text"
              placeholder="Hypertension"
              {...register("diagnosis")}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            {errors.diagnosis && (
              <p className="mt-1 text-xs text-rose-600">{errors.diagnosis.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Age *
            </label>
            <input
              type="number"
              min={0}
              max={130}
              {...register("age")}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            {errors.age && (
              <p className="mt-1 text-xs text-rose-600">{errors.age.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Gender *
            </label>
            <select
              {...register("gender")}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {PATIENT_GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {errors.gender && (
              <p className="mt-1 text-xs text-rose-600">{errors.gender.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Admission Date
            </label>
            <input
              type="date"
              {...register("admittedAt")}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Phone *
            </label>
            <input
              type="tel"
              placeholder="+1 (650) 555-0142"
              {...register("phone")}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Email (Optional)
            </label>
            <input
              type="email"
              placeholder="jordan.hayes@email.com"
              {...register("email")}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Clinical Notes
          </label>
          <textarea
            rows={3}
            placeholder="Treatment plan, medication notes, follow-up schedule..."
            {...register("notes")}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50"
          >
            {isSubmitting
              ? isEditing
                ? "Saving..."
                : "Adding..."
              : isEditing
                ? "Save Changes"
                : "Add Patient"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
