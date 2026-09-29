export function getPagination(totalItems: number, page: number, pageSize: number) {
  if (pageSize < 1) {
    throw new RangeError("pageSize must be greater than zero");
  }

  return {
    pageCount: Math.max(1, Math.ceil(totalItems / pageSize)),
    firstItem: totalItems === 0 ? 0 : (page - 1) * pageSize + 1,
    lastItem: Math.min(page * pageSize, totalItems),
  };
}
