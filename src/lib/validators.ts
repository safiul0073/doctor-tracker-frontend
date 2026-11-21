import { z } from "zod";
import { PATIENT_CONDITIONS, PATIENT_GENDERS } from "@/types";

export const loginFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const doctorFormSchema = z.object({
  name: z.string().trim().min(2, "Doctor name is required").max(120),
  specialization: z.string().trim().min(2, "Specialization is required").max(100),
  hospital: z.string().trim().min(2, "Hospital name is required").max(150),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
  email: z.string().trim().email("Enter a valid email address"),
});

export const patientFormSchema = z.object({
  name: z.string().trim().min(2, "Patient name is required").max(120),
  doctor: z.string().optional(),
  condition: z.enum(PATIENT_CONDITIONS),
  diagnosis: z.string().trim().min(2, "Diagnosis is required").max(160),
  age: z.coerce.number().int().min(0, "Age must be 0 or above").max(130, "Enter a valid age"),
  gender: z.enum(PATIENT_GENDERS),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .or(z.literal(""))
    .optional(),
  admittedAt: z.string().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type DoctorFormValues = z.infer<typeof doctorFormSchema>;
export type PatientFormValues = z.infer<typeof patientFormSchema>;
