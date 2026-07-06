"use client";

import { BarChart } from "@/components/ui/chart";

interface DashboardBarChartProps {
  labels: string[];
  values: number[];
  height?: number;
}

export function DashboardBarChart({ labels, values, height = 160 }: DashboardBarChartProps) {
  return (
    <BarChart
      labels={labels}
      datasets={[{ label: "OS", values, color: "var(--color-brand-500)" }]}
      height={height}
      formatValue={(v) => `${v} OS`}
    />
  );
}
