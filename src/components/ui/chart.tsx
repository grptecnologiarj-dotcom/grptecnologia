"use client";

import { useState } from "react";

/* ─── Bar Chart ──────────────────────────────────────────────── */
interface BarDataset {
  label: string;
  values: number[];
  color: string;
}

interface BarChartProps {
  labels: string[];
  datasets: BarDataset[];
  height?: number;
  formatValue?: (v: number) => string;
  className?: string;
}

export function BarChart({
  labels,
  datasets,
  height = 200,
  formatValue = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }),
  className,
}: BarChartProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; values: { label: string; value: number; color: string }[] } | null>(null);
  const allValues = datasets.flatMap((d) => d.values);
  const maxVal = Math.max(...allValues, 1);

  return (
    <div className={`relative select-none ${className ?? ""}`} style={{ height }}>
      <div className="flex items-end gap-2 h-full pb-6">
        {labels.map((label, i) => (
          <div
            key={label}
            className="flex flex-1 flex-col items-center gap-0.5 group cursor-default"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const containerRect = e.currentTarget.closest(".relative")!.getBoundingClientRect();
              setTooltip({
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top,
                label,
                values: datasets.map((d) => ({ label: d.label, value: d.values[i], color: d.color })),
              });
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            <div className="flex w-full items-end gap-0.5 justify-center" style={{ height: height - 28 }}>
              {datasets.map((d) => {
                const pct = (d.values[i] / maxVal) * 100;
                return (
                  <div
                    key={d.label}
                    className="flex-1 rounded-t-[3px] transition-all duration-300 group-hover:opacity-100 opacity-80"
                    style={{ height: `${Math.max(pct, 1)}%`, backgroundColor: d.color }}
                  />
                );
              })}
            </div>
            <span className="text-[10px] text-[var(--color-fg-subtle)] font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-lg text-xs"
          style={{
            left: Math.min(tooltip.x, 200),
            top: tooltip.y - 8,
            transform: "translate(-50%, -100%)",
            minWidth: 140,
          }}
        >
          <p className="font-semibold mb-2 text-[var(--color-fg)]">{tooltip.label}</p>
          {tooltip.values.map((v) => (
            <div key={v.label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: v.color }} />
                <span className="text-[var(--color-fg-muted)]">{v.label}</span>
              </div>
              <span className="font-semibold">{formatValue(v.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Line / Area Chart ──────────────────────────────────────── */
interface LineDataset {
  label: string;
  values: number[];
  color: string;
  fill?: boolean;
}

interface LineChartProps {
  labels: string[];
  datasets: LineDataset[];
  height?: number;
  formatValue?: (v: number) => string;
  className?: string;
}

export function LineChart({
  labels,
  datasets,
  height = 200,
  formatValue = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }),
  className,
}: LineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const allValues = datasets.flatMap((d) => d.values);
  const maxVal = Math.max(...allValues, 1);
  const minVal = 0;
  const W = 600;
  const H = height - 32;
  const PAD = { top: 12, right: 16, bottom: 28, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const n = labels.length;

  function xPos(i: number) {
    return PAD.left + (i / (n - 1)) * chartW;
  }
  function yPos(v: number) {
    return PAD.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;
  }

  function pathD(values: number[]) {
    return values
      .map((v, i) => `${i === 0 ? "M" : "L"} ${xPos(i).toFixed(1)} ${yPos(v).toFixed(1)}`)
      .join(" ");
  }

  function areaD(values: number[]) {
    const linePath = pathD(values);
    const lastX = xPos(n - 1).toFixed(1);
    const firstX = xPos(0).toFixed(1);
    const baseY = (PAD.top + chartH).toFixed(1);
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }

  const gridLines = 4;

  return (
    <div className={`relative ${className ?? ""}`} style={{ height }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const xRatio = (e.clientX - rect.left) / rect.width;
          const svgX = xRatio * W;
          const idx = Math.round(((svgX - PAD.left) / chartW) * (n - 1));
          setHoveredIndex(Math.max(0, Math.min(n - 1, idx)));
        }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {/* Grid lines */}
        {Array.from({ length: gridLines + 1 }).map((_, gi) => {
          const v = minVal + ((maxVal - minVal) / gridLines) * gi;
          const y = yPos(v);
          return (
            <g key={gi}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="var(--color-border)" strokeWidth={0.5} strokeDasharray="4 4" />
              <text x={PAD.left - 4} y={y + 4} fontSize={9} textAnchor="end" fill="var(--color-fg-subtle)">
                {v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {labels.map((label, i) => (
          <text key={i} x={xPos(i)} y={H - 2} fontSize={9} textAnchor="middle" fill="var(--color-fg-subtle)">
            {label}
          </text>
        ))}

        {/* Hover vertical line */}
        {hoveredIndex !== null && (
          <line
            x1={xPos(hoveredIndex)}
            y1={PAD.top}
            x2={xPos(hoveredIndex)}
            y2={PAD.top + chartH}
            stroke="var(--color-border)"
            strokeWidth={1}
          />
        )}

        {/* Datasets */}
        {datasets.map((d) => (
          <g key={d.label}>
            {d.fill && (
              <path
                d={areaD(d.values)}
                fill={d.color}
                fillOpacity={0.1}
              />
            )}
            <path
              d={pathD(d.values)}
              fill="none"
              stroke={d.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dots */}
            {d.values.map((v, i) => (
              <circle
                key={i}
                cx={xPos(i)}
                cy={yPos(v)}
                r={hoveredIndex === i ? 5 : 3}
                fill={d.color}
                stroke="white"
                strokeWidth={1.5}
                className="transition-all duration-150"
              />
            ))}
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="pointer-events-none absolute z-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-lg text-xs"
          style={{
            left: `${((hoveredIndex / (n - 1)) * 100)}%`,
            top: 0,
            transform: "translate(-50%, 8px)",
            minWidth: 140,
          }}
        >
          <p className="font-semibold mb-2">{labels[hoveredIndex]}</p>
          {datasets.map((d) => (
            <div key={d.label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-[var(--color-fg-muted)]">{d.label}</span>
              </div>
              <span className="font-semibold">{formatValue(d.values[hoveredIndex])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Donut Chart ──────────────────────────────────────────────── */
interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ slices, size = 160, className }: { slices: DonutSlice[]; size?: number; className?: string }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  const r = 56;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className={`flex items-center gap-6 ${className ?? ""}`}>
      <svg width={size} height={size} viewBox="0 0 160 160" className="shrink-0">
        {slices.map((sl, i) => {
          const pct = sl.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const strokeDashoffset = circumference - offset * circumference;
          offset += pct;
          const isHovered = hovered === i;
          return (
            <circle
              key={sl.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={sl.color}
              strokeWidth={isHovered ? 22 : 18}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-200 cursor-pointer"
              transform={`rotate(-90 ${cx} ${cy})`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={11} fill="var(--color-fg-muted)">Total</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={13} fontWeight="bold" fill="var(--color-fg)">
          {total >= 1000 ? `${(total / 1000).toFixed(0)}k` : total}
        </text>
      </svg>
      <div className="space-y-2 flex-1">
        {slices.map((sl, i) => (
          <div
            key={sl.label}
            className={`flex items-center justify-between text-xs rounded px-2 py-1 transition-colors cursor-default ${hovered === i ? "bg-[var(--color-surface-muted)]" : ""}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: sl.color }} />
              <span className="text-[var(--color-fg-muted)]">{sl.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{Math.round((sl.value / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
