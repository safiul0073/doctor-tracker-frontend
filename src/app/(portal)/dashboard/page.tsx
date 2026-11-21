"use client";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  Calendar,
  Stethoscope,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  ConditionDonutChart,
  DateStatsChart,
  PatientsPerDoctorChart,
  SpecializationChart,
} from "@/components/dashboard/AnalyticsCharts";
import { StatCard } from "@/components/dashboard/StatCard";
import { ConditionBadge } from "@/components/ui/ConditionBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAnalyticsOverview } from "@/hooks/useAnalytics";
import { cn, formatDate } from "@/lib/utils";

const RANGE_OPTIONS = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "all", label: "All Time" },
] as const;

export default function DashboardPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const { data, isLoading, isFetching, isError, refetch } = useAnalyticsOverview({
    range,
    from: customFrom || undefined,
    to: customTo || undefined,
  });

  const handlePresetClick = (value: "7d" | "30d" | "90d" | "all") => {
    setRange(value);
    setCustomFrom("");
    setCustomTo("");
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Clinical Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time overview of physicians, patient caseloads, and admission trends.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
            {RANGE_OPTIONS.map((opt) => {
              const active = !customFrom && !customTo && range === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handlePresetClick(opt.value)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "bg-teal-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="date"
              aria-label="Analytics start date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="text-xs text-slate-700 focus:outline-none"
            />
            <span className="text-xs text-slate-300">to</span>
            <input
              type="date"
              aria-label="Analytics end date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="text-xs text-slate-700 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {isError && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <span>Unable to load analytics data. Please verify the API connection.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 transition-opacity",
            isFetching && "opacity-75"
          )}
        >
          <StatCard
            title="Total Doctors"
            value={data?.summary.totalDoctors ?? 0}
            subtitle={`+${data?.summary.newDoctorsInRange ?? 0} added in selected period`}
            icon={Stethoscope}
            tone="teal"
          />
          <StatCard
            title="Total Patients"
            value={data?.summary.totalPatients ?? 0}
            subtitle={`+${data?.summary.newPatientsInRange ?? 0} admitted in selected period`}
            icon={Users}
            tone="sky"
          />
          <StatCard
            title="Avg Patients / Doctor"
            value={data?.summary.avgPatientsPerDoctor ?? 0}
            subtitle="Balanced clinical workload metric"
            icon={Activity}
            tone="indigo"
          />
          <StatCard
            title="Critical Cases"
            value={data?.summary.criticalPatients ?? 0}
            subtitle="Patients requiring immediate attention"
            icon={AlertCircle}
            tone="rose"
          />
        </div>
      )}

      {/* Primary Charts Row */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Skeleton className="h-88 rounded-2xl" />
          <Skeleton className="h-88 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <DateStatsChart data={data?.dateStats ?? []} />
          <PatientsPerDoctorChart data={data?.patientsPerDoctor ?? []} />
        </div>
      )}

      {/* Secondary Charts Row */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Skeleton className="h-76 rounded-2xl" />
          <Skeleton className="h-76 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ConditionDonutChart
            data={data?.conditionBreakdown ?? []}
            totalPatients={data?.summary.totalPatients ?? 0}
          />
          <SpecializationChart data={data?.specializationBreakdown ?? []} />
        </div>
      )}

      {/* Recent Admissions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Recent Patient Admissions
            </h3>
            <p className="text-xs text-slate-500">
              Latest patients registered across all physicians
            </p>
          </div>
          <Link
            href="/patients"
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            View all patients
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Diagnosis</th>
                <th className="px-5 py-3">Condition</th>
                <th className="px-5 py-3">Assigned Doctor</th>
                <th className="px-5 py-3 text-right">Admitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data?.recentPatients ?? []).map((patient) => (
                <tr key={patient._id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-900">{patient.name}</p>
                    <p className="text-xs text-slate-500">
                      {patient.age} yrs &middot; {patient.gender}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">{patient.diagnosis}</td>
                  <td className="px-5 py-3.5">
                    <ConditionBadge condition={patient.condition} />
                  </td>
                  <td className="px-5 py-3.5">
                    {patient.doctor?._id ? (
                      <Link
                        href={`/doctors/${patient.doctor._id}`}
                        className="font-medium text-teal-700 hover:underline"
                      >
                        {patient.doctor.name}
                      </Link>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                    {patient.doctor?.specialization && (
                      <p className="text-xs text-slate-500">
                        {patient.doctor.specialization}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(patient.admittedAt)}
                  </td>
                </tr>
              ))}
              {!isLoading && (data?.recentPatients?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">
                    No patients recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
