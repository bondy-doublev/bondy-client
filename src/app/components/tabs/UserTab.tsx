/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import useDataTable from "@/app/hooks/useDataTable";
import { useTranslations } from "next-intl";

const columnHelper = createColumnHelper<any>();

const sampleData = [
  { id: 1, name: "Alice", email: "alice@example.com", status: "Active" },
  { id: 2, name: "Bob", email: "bob@example.com", status: "Inactive" },
  { id: 3, name: "Charlie", email: "charlie@example.com", status: "Active" },
  { id: 4, name: "Daisy", email: "daisy@example.com", status: "Active" },
  { id: 5, name: "Eve", email: "eve@example.com", status: "Inactive" },
];

const PAGE_SIZE = 2;

export default function UsersTab() {
  const [page, setPage] = useState(1);
  const t = useTranslations("user");

  const pagedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sampleData.slice(start, start + PAGE_SIZE);
  }, [page]);

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const value = info.getValue() as string;
          return (
            <span
              className={value === "Active" ? "text-green-600" : "text-red-500"}
            >
              {value}
            </span>
          );
        },
      }),
    ],
    []
  );

  const { DataTable } = useDataTable({
    data: pagedData,
    columns,
    isLoading: false,
    totalPages: Math.ceil(sampleData.length / PAGE_SIZE),
    totalCount: sampleData.length,
    currentPage: page,
    onPageChange: setPage,
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">{t("users")}</h1>
      <DataTable />
    </div>
  );
}
