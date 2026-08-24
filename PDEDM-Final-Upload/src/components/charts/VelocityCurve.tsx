"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { NeoTableRow } from "@/types/schema";

interface VelocityCurveProps {
  data: NeoTableRow[];
}

interface ChartPoint {
  name: string;
  date: string;
  epoch: number;
  velocity: number;
  isHazardous: boolean;
  missDistanceKm: number;
}

function prepareChartData(rows: NeoTableRow[]): {
  hazardous: ChartPoint[];
  safe: ChartPoint[];
} {
  const hazardous: ChartPoint[] = [];
  const safe: ChartPoint[] = [];

  for (const row of rows) {
    const point: ChartPoint = {
      name: row.name,
      date: row.approachDate,
      epoch: row.epochApproach,
      velocity: row.velocityKmPerSec,
      isHazardous: row.isHazardous,
      missDistanceKm: row.missDistanceKm,
    };

    if (row.isHazardous) {
      hazardous.push(point);
    } else {
      safe.push(point);
    }
  }

  return { hazardous, safe };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-black/5 dark:bg-black/40 backdrop-blur-3xl border border-foreground/10 rounded-lg p-3 shadow-xl">
      <p className="font-semibold text-foreground text-sm mb-1">{data.name}</p>
      <div className="space-y-0.5 text-xs">
        <p className="text-foreground">
          <span className="text-muted-foreground">Velocity:</span>{" "}
          <span className="tabular-nums">
            {data.velocity.toFixed(2)} km/s
          </span>
        </p>
        <p className="text-foreground">
          <span className="text-muted-foreground">Date:</span> {data.date}
        </p>
        <p className="text-foreground">
          <span className="text-muted-foreground">Miss:</span>{" "}
          <span className="tabular-nums">
            {data.missDistanceKm.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}{" "}
            km
          </span>
        </p>
        {data.isHazardous && (
          <p className="text-red-400 font-semibold mt-1">⚠ HAZARDOUS</p>
        )}
      </div>
    </div>
  );
}

/**
 * Format epoch timestamp to a short date label.
 */
function formatEpochTick(epoch: number): string {
  const d = new Date(epoch);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function VelocityCurve({ data }: VelocityCurveProps) {
  const { hazardous, safe } = prepareChartData(data);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No data to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#334155"
          strokeOpacity={0.5}
        />
        <XAxis
          dataKey="epoch"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={formatEpochTick}
          stroke="#64748b"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={{ stroke: "#475569" }}
          label={{
            value: "Approach Date",
            position: "insideBottom",
            offset: -10,
            fill: "#64748b",
            fontSize: 11,
          }}
        />
        <YAxis
          dataKey="velocity"
          type="number"
          stroke="#64748b"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={{ stroke: "#475569" }}
          label={{
            value: "Velocity (km/s)",
            angle: -90,
            position: "insideLeft",
            offset: 10,
            fill: "#64748b",
            fontSize: 11,
          }}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ strokeDasharray: "3 3", stroke: "#475569" }}
        />
        <Scatter
          name="Safe"
          data={safe}
          fill="#3b82f6"
          fillOpacity={0.7}
          stroke="#1e40af"
          strokeWidth={1}
        />
        <Scatter
          name="Hazardous"
          data={hazardous}
          fill="#ef4444"
          fillOpacity={0.8}
          stroke="#991b1b"
          strokeWidth={1}
          shape="diamond"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
