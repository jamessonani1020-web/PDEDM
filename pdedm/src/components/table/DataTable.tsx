"use client";

import { useState, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ChevronRight, Search } from "lucide-react";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  /** Function that returns true for rows that should be highlighted (e.g., hazardous) */
  isRowHighlighted?: (row: TData) => boolean;
  /** Visible name of the entity for CSV export filename */
  exportFilename?: string;
}

export function DataTable<TData>({
  columns,
  data,
  onRowClick,
  isRowHighlighted,
  exportFilename = "export",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const handleDownloadCsv = useCallback(() => {
    const headerRow = table
      .getAllColumns()
      .filter((col) => col.getIsVisible())
      .map((col) => col.id);

    const csvRows = [headerRow.join(",")];

    for (const row of table.getFilteredRowModel().rows) {
      const values = headerRow.map((colId) => {
        const value = row.getValue(colId);
        const stringVal = String(value ?? "");
        // Escape commas and quotes for CSV safety
        if (stringVal.includes(",") || stringVal.includes('"')) {
          return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
      });
      csvRows.push(values.join(","));
    }

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${exportFilename}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [table, exportFilename]);

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter asteroids..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground h-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadCsv}
          className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </Button>
      </div>

      {/* Table */}
      <div className="border-2 border-foreground overflow-hidden bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b-2 border-foreground bg-foreground hover:bg-foreground"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-background font-bold text-xs uppercase tracking-widest py-3 px-4"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => {
                const highlighted = isRowHighlighted
                  ? isRowHighlighted(row.original)
                  : false;

                return (
                  <TableRow
                    key={row.id}
                    className={`
                      border-b border-foreground transition-colors cursor-pointer hover:bg-foreground hover:text-background
                      ${
                        highlighted
                          ? "bg-red-600 text-white border-b-red-900 hover:bg-red-700"
                          : ""
                      }
                    `}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-2.5 px-4 text-sm"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}
          –
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} objects
        </div>
        <div className="flex items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="bg-background border-2 border-foreground text-foreground px-2 py-1 text-xs font-bold rounded-none"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 border-2 border-foreground bg-background text-foreground disabled:opacity-30 hover:bg-foreground hover:text-background rounded-none font-bold uppercase"
          >
            [ PREV ]
          </Button>
          <span className="text-foreground text-xs tabular-nums font-bold">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 border-2 border-foreground bg-background text-foreground disabled:opacity-30 hover:bg-foreground hover:text-background rounded-none font-bold uppercase"
          >
            [ NEXT ]
          </Button>
        </div>
      </div>
    </div>
  );
}
