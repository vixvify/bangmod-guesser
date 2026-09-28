// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ListPagination } from "@/components/ui/list-pagination";

afterEach(cleanup);

describe("ListPagination", () => {
  it("uses the supplied values and allows selecting another page", () => {
    const onPageChange = vi.fn();
    render(<ListPagination totalItems={7} pageSize={4} itemLabel="เกม" onPageChange={onPageChange} />);

    expect(screen.getByText("แสดง 1–4 จาก 7 เกม")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Go to page 2" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(screen.getByText("แสดง 5–7 จาก 7 เกม")).toBeTruthy();
  });

  it("accepts a controlled page from its caller", () => {
    render(<ListPagination totalItems={7} pageSize={4} itemLabel="เกม" page={2} />);

    expect(screen.getByText("แสดง 5–7 จาก 7 เกม")).toBeTruthy();
    expect(screen.getByRole("button", { name: "page 2" }).hasAttribute("disabled")).toBe(false);
  });
});
