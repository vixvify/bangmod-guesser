// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EmptyState } from "@/components/ui/empty-state";

afterEach(cleanup);

describe("EmptyState", () => {
  it("renders a title and optional description and action", () => {
    render(
      <EmptyState
        title="ไม่มีรายการ"
        description="ลองเพิ่มรายการใหม่"
        action={<a href="/create">เพิ่มรายการ</a>}
      />,
    );

    const state = screen.getByRole("status");
    expect(state.textContent).toContain("ไม่มีรายการ");
    expect(state.textContent).toContain("ลองเพิ่มรายการใหม่");
    expect(screen.getByRole("link", { name: "เพิ่มรายการ" }).getAttribute("href"))
      .toBe("/create");
  });

  it("renders with only a title", () => {
    render(<EmptyState title="ไม่มีรายการ" />);

    expect(screen.getByRole("status").textContent).toContain("ไม่มีรายการ");
  });
});
