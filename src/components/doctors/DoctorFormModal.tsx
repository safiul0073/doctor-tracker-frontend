"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { doctorFormSchema, type DoctorFormValues } from "@/lib/validators";
import type { Doctor } from "@/types";

interface DoctorFormModalProps {
  open: boolean;
  onClose: () => void;
  doctor?: Doctor | null;
  onSubmit: (values: DoctorFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

const COMMON_SPECIALIZATIONS = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Oncology",
  "Internal Medicine",
  "Pulmonology",
  "Dermatology",
  "Psychiatry",
  "General Surgery",
];

export function DoctorFormModal({
  open,
  onClose,
  doctor,
  onSubmit,
  isSubmitting = false,
}: DoctorFormModalProps) {
  const isEditing = Boolean(doctor);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      name: "",
      specialization: "",
      hospital: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: doctor?.name ?? "",
        specialization: doctor?.specialization ?? "",
        hospital: doctor?.hospital ?? "",
        phone: doctor?.phone ?? "",
        email: doctor?.email ?? "",
      });
    }
  }, [open, doctor, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Doctor Profile" : "Add New Doctor"}
      description={
        isEditing
          ? "Update physician details and hospital assignment."
          : "Register a new doctor to start assigning patients."
      }
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Full Name *
          </label>
          <input
            type="text"
            placeholder="Dr. Sarah Jenkins"
            {...register("name")}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Specialization *
            </label>
            <input
              type="text"
              list="specializations-list"
              placeholder="Cardiology"
              {...register("specialization")}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <datalist id="specializations-list">
              {COMMON_SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec} />
              ))}
            </datalist>
            {errors.specialization && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.specialization.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Hospital *
            </label>
            <input
              type="text"
              placeholder="St. Jude Medical Center"
              {...register("hospital")}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            {errors.hospital && (
              <p className="mt-1 text-xs text-rose-600">{errors.hospital.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Phone *
            </label>
            <input
              type="tel"
              placeholder="+1 (415) 555-0199"
              {...register("phone")}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Email *
            </label>
            <input
              type="email"
              placeholder="sarah.jenkins@hospital.org"
              {...register("email")}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
            )}
          </div>
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
                : "Creating..."
              : isEditing
                ? "Save Changes"
                : "Create Doctor"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
