/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import Spinner from "@/app/components/ui/spinner";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState } from "react";

interface DataTableProps {
  data: any[];
  columns: any[];
  isLoading?: boolean;
  totalPages: number;
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  size?: "md" | "sm";
  containerClass?: string;
}

function useDataTable({
  data,
  columns,
  isLoading,
  totalPages,
  totalCount,
  currentPage = 1,
  onPageChange,
  size = "sm",
  containerClass,
}: DataTableProps) {
  const [tableState, setTableState] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: tableState,
    },
    onSortingChange: setTableState,
    sortDescFirst: true,
  });

  const startIndex = (currentPage - 1) * 10 + 1;
  const endIndex = Math.min(startIndex + 9, totalCount || 0);

  const DataTable = () => (
    <>
      <Table size={size} containerClass={containerClass}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler?.()}
                  className="cursor-pointer select-none"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {header.column.getIsSorted() === "asc" && " 🔼"}
                  {header.column.getIsSorted() === "desc" && " 🔽"}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                <Spinner />
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="text-sm mt-4">
        Showing {startIndex} to {endIndex} of {totalCount}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          <button
            className="px-2 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-100"
            onClick={() => onPageChange?.(1)}
            disabled={currentPage === 1}
          >
            « First
          </button>
          <button
            className="px-2 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-100"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹ Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              if (totalPages <= 5) return true;
              if (currentPage <= 3) return page <= 5;
              if (currentPage >= totalPages - 2) return page >= totalPages - 4;
              return Math.abs(currentPage - page) <= 2;
            })
            .map((page) => (
              <button
                key={page}
                className={`px-3 py-1 text-sm border rounded ${
                  page === currentPage
                    ? "bg-blue-600 text-white font-semibold"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => onPageChange?.(page)}
              >
                {page}
              </button>
            ))}

          <button
            className="px-2 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-100"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next ›
          </button>
          <button
            className="px-2 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-100"
            onClick={() => onPageChange?.(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last »
          </button>
        </div>
      )}
    </>
  );

  return { DataTable };
}

export default useDataTable;
