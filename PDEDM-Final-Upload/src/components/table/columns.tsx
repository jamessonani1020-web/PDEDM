"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { NeoTableRow } from "@/types/schema";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";

/**
 * Format a number with locale-specific thousands separators.
 */
function formatDistance(km: number): string {
  return km.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

/**
 * Format velocity to 2 decimal places.
 */
function formatVelocity(kmps: number): string {
  return kmps.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Sortable header component for TanStack Table columns.
 */
function SortableHeader({
  column,
  label,
}: {
  column: {
    toggleSorting: (desc?: boolean) => void;
    getIsSorted: () => false | "asc" | "desc";
  };
  label: string;
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      className="flex items-center gap-1 font-semibold text-foreground hover:text-foreground transition-colors"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
      {sorted === "asc" && <span className="text-blue-600 dark:text-blue-400 text-xs">▲</span>}
      {sorted === "desc" && <span className="text-blue-600 dark:text-blue-400 text-xs">▼</span>}
    </button>
  );
}

export const neoColumns: ColumnDef<NeoTableRow, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} label="Name" />,
    cell: ({ row }) => (
      <a
        href={row.original.nasaJplUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-600 dark:text-blue-300 hover:underline font-medium transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {row.original.name}
      </a>
    ),
    size: 220,
  },
  {
    accessorKey: "isHazardous",
    header: "Status",
    cell: ({ row }) =>
      row.original.isHazardous ? (
        <Badge
          variant="destructive"
          className="bg-red-900/60 text-red-300 border-red-700/50 text-xs font-semibold"
        >
          HAZARDOUS
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="border-emerald-300 dark:border-emerald-700/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
        >
          SAFE
        </Badge>
      ),
    size: 110,
  },
  {
    accessorKey: "diameterMaxMeters",
    header: ({ column }) => (
      <SortableHeader column={column} label="Ø Max (m)" />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums text-foreground">
        {row.original.diameterMaxMeters.toFixed(1)}
      </span>
    ),
    size: 110,
  },
  {
    accessorKey: "velocityKmPerSec",
    header: ({ column }) => (
      <SortableHeader column={column} label="Velocity (km/s)" />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums text-foreground">
        {formatVelocity(row.original.velocityKmPerSec)}
      </span>
    ),
    size: 140,
  },
  {
    accessorKey: "missDistanceKm",
    header: ({ column }) => (
      <SortableHeader column={column} label="Miss Distance (km)" />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums text-foreground">
        {formatDistance(row.original.missDistanceKm)}
      </span>
    ),
    size: 170,
  },
  {
    accessorKey: "missDistanceLunar",
    header: ({ column }) => (
      <SortableHeader column={column} label="Miss (LD)" />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums text-foreground">
        {row.original.missDistanceLunar.toFixed(2)}
      </span>
    ),
    size: 100,
  },
  {
    accessorKey: "approachDate",
    header: ({ column }) => (
      <SortableHeader column={column} label="Approach Date" />
    ),
    cell: ({ row }) => (
      <span className="text-foreground text-sm">
        {row.original.approachDateFull ?? row.original.approachDate}
      </span>
    ),
    size: 180,
  },
  {
    accessorKey: "absoluteMagnitude",
    header: ({ column }) => <SortableHeader column={column} label="H (mag)" />,
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {row.original.absoluteMagnitude.toFixed(2)}
      </span>
    ),
    size: 90,
  },
  {
    accessorKey: "orbitingBody",
    header: "Orbiting",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.orbitingBody}</span>
    ),
    size: 90,
  },
];
