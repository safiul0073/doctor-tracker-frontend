"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  BarChart3,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLogin } from "@/hooks/useAuth";
import { loginFormSchema, type LoginFormValues } from "@/lib/validators";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const fillDemoCredentials = () => {
    setValue("email", "admin@example.com", { shouldValidate: true });
    setValue("password", "password", { shouldValidate: true });
  };

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Clinical Hero Panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white shadow-lg shadow-teal-500/30">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Doctor Tracker</h1>
            <p className="text-xs text-slate-400">Clinical Operations Platform</p>
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Protected Administrative Portal
          </div>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
            Streamlined Doctor &amp; Patient Management
          </h2>
          <p className="text-sm leading-relaxed text-slate-300">
            Monitor hospital capacity, manage physician rosters, track patient
            conditions, and uncover actionable clinical insights from a unified
            real-time dashboard.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Stethoscope, label: "Doctor Directory", sub: "Indexed search" },
              { icon: Users, label: "Patient Care", sub: "Condition filters" },
              { icon: BarChart3, label: "Live Analytics", sub: "Aggregated KPIs" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-800 bg-slate-800/50 p-3.5"
                >
                  <Icon className="h-5 w-5 text-teal-400" />
                  <p className="mt-2 text-xs font-semibold text-white">{item.label}</p>
                  <p className="text-[11px] text-slate-400">{item.sub}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          Doctor Tracker &middot; Built with Next.js, Express &amp; MongoDB
        </p>
      </div>

      {/* Right Sign-in Form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-slate-900">Doctor Tracker</span>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Sign in to portal
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Enter your administrator credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@example.com"
                    {...register("email")}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-rose-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register("password")}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-rose-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {loginMutation.isError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                  {loginMutation.error.message}
                </div>
              )}

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="mt-2 flex w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal-600/20 transition-all hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* Demo Credentials Box */}
            <div className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Demo Admin Credentials
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    <code className="font-mono text-slate-700">
                      admin@example.com
                    </code>{" "}
                    / <code className="font-mono text-slate-700">password</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="shrink-0 rounded-lg border border-teal-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-50"
                >
                  Auto-fill
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
