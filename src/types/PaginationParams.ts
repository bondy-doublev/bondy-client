import { SortDirection, SortField } from "@/constants/pagination";

// src/types/pagination.ts
export type PaginationParams = {
  page?: number;
  size?: number;
  sortBy?: SortField;
  direction?: SortDirection;
};
