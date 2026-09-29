import { describe, expect, it } from "vitest";
import { getPagination } from "@/utils/pagination";

describe("getPagination", () => {
  it("calculates the visible range for the first and last pages", () => {
    expect(getPagination(7, 1, 4)).toEqual({
      pageCount: 2,
      firstItem: 1,
      lastItem: 4,
    });
    expect(getPagination(7, 2, 4)).toEqual({
      pageCount: 2,
      firstItem: 5,
      lastItem: 7,
    });
  });

  it("keeps an empty list on the first page with no visible items", () => {
    expect(getPagination(0, 1, 4)).toEqual({
      pageCount: 1,
      firstItem: 0,
      lastItem: 0,
    });
  });

  it("rejects a non-positive page size", () => {
    expect(() => getPagination(7, 1, 0)).toThrow(RangeError);
  });
});
