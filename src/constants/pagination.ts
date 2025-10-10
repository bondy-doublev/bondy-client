export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

export enum SortField {
  CREATED_AT = "createdAt",
  ID = "id",
}

export const DEFAULT_PAGINATION = {
  page: 0,
  size: 10,
  sortBy: SortField.CREATED_AT,
  direction: SortDirection.DESC,
};
