/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import useDataTable from "@/app/hooks/useDataTable";
import ActionButton from "../Button";
import { useTranslations } from "use-intl";

const columnHelper = createColumnHelper<any>();

const sampleInventory = [
  {
    id: 1,
    name: "Red T-shirt",
    sku: "TSH-001",
    quantity: 120,
    price: 15.99,
    status: "In Stock",
  },
  {
    id: 2,
    name: "Blue Jeans",
    sku: "JNS-002",
    quantity: 40,
    price: 39.99,
    status: "Low Stock",
  },
  {
    id: 3,
    name: "Black Hoodie",
    sku: "HD-003",
    quantity: 0,
    price: 29.99,
    status: "Out of Stock",
  },
  {
    id: 4,
    name: "White Cap",
    sku: "CAP-004",
    quantity: 18,
    price: 9.99,
    status: "In Stock",
  },
];

const PAGE_SIZE = 2;

export default function InventoryTab() {
  const [page, setPage] = useState(1);
  const t = useTranslations("inventory");

  const pagedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sampleInventory.slice(start, start + PAGE_SIZE);
  }, [page]);

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("name", {
        header: "Product Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("sku", {
        header: "SKU",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("quantity", {
        header: "Quantity",
        enableSorting: false,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("price", {
        header: "Price ($)",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const value = info.getValue();
          const color =
            value === "In Stock"
              ? "text-green-600"
              : value === "Low Stock"
              ? "text-yellow-600"
              : "text-red-600";
          return <span className={color}>{value}</span>;
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <ActionButton item={row.original} type="edit" />
            <ActionButton item={row.original} type="delete" />
          </div>
        ),
      }),
    ],
    []
  );

  const { DataTable } = useDataTable({
    data: pagedData,
    columns,
    isLoading: false,
    totalPages: Math.ceil(sampleInventory.length / PAGE_SIZE),
    totalCount: sampleInventory.length,
    currentPage: page,
    onPageChange: setPage,
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">{t("inventories")}</h1>
      <DataTable />
    </div>
  );
}
