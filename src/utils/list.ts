// utils/list.ts
export function mergeUniqueById<T extends { id: number | string }>(
  oldList: T[],
  newList: T[]
) {
  const map = new Map<string | number, T>();
  [...oldList, ...newList].forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}
