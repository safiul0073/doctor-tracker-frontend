"use client";

import { memo, useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CONDITION_STYLES, formatShortDate } from "@/lib/utils";
import type { AnalyticsOverview } from "@/types";

interface DateStatsChartProps {
  data: AnalyticsOverview["dateStats"];
}

export const DateStatsChart = memo(function DateStatsChart({
  data,
}: DateStatsChartProps) {
  const formatted = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        label: formatShortDate(point.date),
      })),
    [data]
  );

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Admissions &amp; Registrations Over Time
          </h3>
          <p className="text-xs text-slate-500">
            Date-based intake statistics across doctors and patients
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        {formatted.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No timeline records for this date range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formatted}
              margin={{ top: 10, right: 12, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="patientsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="doctorsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                minTickGap={22}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 25px -5px rgb(15 23 42 / 0.1)",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", paddingBottom: "8px" }}
              />
              <Area
                type="monotone"
                dataKey="patients"
                name="Patients Admitted"
                stroke="#0d9488"
                strokeWidth={2.2}
                fillOpacity={1}
                fill="url(#patientsGrad)"
              />
              <Area
                type="monotone"
                dataKey="doctors"
                name="Doctors Added"
                stroke="#0284c7"
                strokeWidth={2.2}
                fillOpacity={1}
                fill="url(#doctorsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});

interface PatientsPerDoctorChartProps {
  data: AnalyticsOverview["patientsPerDoctor"];
}

export const PatientsPerDoctorChart = memo(function PatientsPerDoctorChart({
  data,
}: PatientsPerDoctorChartProps) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        shortName: d.doctorName.replace(/^Dr\.\s*/i, "Dr. ").split(" ").slice(0, 2).join(" "),
      })),
    [data]
  );

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Patients per Doctor
        </h3>
        <p className="text-xs text-slate-500">
          Top 10 physicians ranked by assigned patient caseload
        </p>
      </div>

      <div className="h-72 w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No physician caseload data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 12, left: -16, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                angle={-25}
                textAnchor="end"
                interval={0}
                height={52}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 25px -5px rgb(15 23 42 / 0.1)",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`${value} patients`, "Caseload"]}
                labelFormatter={(_label, payload) => {
                  const row = payload?.[0]?.payload as
                    | AnalyticsOverview["patientsPerDoctor"][number]
                    | undefined;
                  return row
                    ? `${row.doctorName} (${row.specialization})`
                    : String(_label);
                }}
              />
              <Bar
                dataKey="patientCount"
                name="Patients"
                fill="#0d9488"
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});

interface ConditionDonutChartProps {
  data: AnalyticsOverview["conditionBreakdown"];
  totalPatients: number;
}

export const ConditionDonutChart = memo(function ConditionDonutChart({
  data,
  totalPatients,
}: ConditionDonutChartProps) {
  const nonZero = useMemo(() => data.filter((item) => item.count > 0), [data]);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Patient Condition Breakdown
        </h3>
        <p className="text-xs text-slate-500">
          Current clinical status across all patients
        </p>
      </div>

      <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
        <div className="h-56 w-full">
          {nonZero.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No patients recorded
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nonZero}
                  dataKey="count"
                  nameKey="condition"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={82}
                  paddingAngle={3}
                >
                  {nonZero.map((entry) => (
                    <Cell
                      key={entry.condition}
                      fill={CONDITION_STYLES[entry.condition]?.color || "#64748b"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="space-y-2.5">
          {data.map((item) => {
            const pct =
              totalPatients > 0 ? Math.round((item.count / totalPatients) * 100) : 0;
            return (
              <div
                key={item.condition}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        CONDITION_STYLES[item.condition]?.color || "#64748b",
                    }}
                  />
                  <span className="truncate text-xs font-medium text-slate-700">
                    {item.condition}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-900">
                    {item.count}
                  </span>
                  <span className="w-9 text-right text-[11px] text-slate-400">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

interface SpecializationChartProps {
  data: AnalyticsOverview["specializationBreakdown"];
}

export const SpecializationChart = memo(function SpecializationChart({
  data,
}: SpecializationChartProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Departmental Coverage
        </h3>
        <p className="text-xs text-slate-500">
          Patient load compared to physicians per specialization
        </p>
      </div>

      <div className="h-60 w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No specialization data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 10, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="specialization"
                width={108}
                tick={{ fontSize: 11, fill: "#475569" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Bar
                dataKey="patients"
                name="Patients"
                fill="#0284c7"
                radius={[0, 5, 5, 0]}
                barSize={12}
              />
              <Bar
                dataKey="doctors"
                name="Doctors"
                fill="#14b8a6"
                radius={[0, 5, 5, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});
