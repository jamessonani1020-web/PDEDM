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



/**
 * Format epoch timestamp to a short date label.
 */
function formatEpochTick(epoch: number): string {
  const d = new Date(epoch);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        border: '2px solid var(--foreground)',
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        padding: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        boxShadow: 'none' // Remove any AI-looking shadow
      }}>
        <div style={{ fontWeight: 'bold', borderBottom: '1px solid var(--border)', marginBottom: '4px', paddingBottom: '4px' }}>
          {data.name}
        </div>
        <div>Date: {data.date}</div>
        <div>Speed: {data.velocity} km/s</div>
        <div>Miss: {data.missDistanceKm} km</div>
        {data.isHazardous && (
          <div style={{ color: 'red', fontWeight: 'bold', marginTop: '4px' }}>
            HAZARDOUS
          </div>
        )}
      </div>
    );
  }
  return null;
};

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
          strokeDasharray="1 1"
          stroke="var(--border)"
          strokeOpacity={1}
        />
        <XAxis
          dataKey="epoch"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={formatEpochTick}
          stroke="var(--foreground)"
          tick={{ fill: "var(--foreground)", fontFamily: "monospace", fontSize: 11 }}
          axisLine={{ stroke: "var(--foreground)", strokeWidth: 2 }}
          label={{
            value: "Approach Date",
            position: "insideBottom",
            offset: -10,
            fill: "var(--foreground)",
            fontFamily: "monospace",
            fontSize: 12,
            fontWeight: "bold"
          }}
        />
        <YAxis
          dataKey="velocity"
          type="number"
          stroke="var(--foreground)"
          tick={{ fill: "var(--foreground)", fontFamily: "monospace", fontSize: 11 }}
          axisLine={{ stroke: "var(--foreground)", strokeWidth: 2 }}
          label={{
            value: "Velocity (km/s)",
            angle: -90,
            position: "insideLeft",
            offset: 15,
            fill: "var(--foreground)",
            fontFamily: "monospace",
            fontSize: 12,
            fontWeight: "bold"
          }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--foreground)', strokeWidth: 1, strokeDasharray: '2 2' }} />
        <Scatter
          name="Safe"
          data={safe}
          fill="var(--foreground)"
          shape="square"
        />
        <Scatter
          name="Hazardous"
          data={hazardous}
          fill="red"
          shape="triangle"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
