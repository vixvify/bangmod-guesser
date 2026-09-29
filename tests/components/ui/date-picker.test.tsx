// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DatePicker } from "@/components/ui/date-picker";

afterEach(cleanup);

describe("DatePicker", () => {
  it("renders a labeled MUI date field with a calendar trigger", () => {
    render(<DatePicker label="ตั้งแต่วันที่" value={null} onChange={vi.fn()} />);

    expect(screen.getByRole("group", { name: "ตั้งแต่วันที่" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /choose date/i })).toBeTruthy();
  });

  it("remains editable when used without a change handler", () => {
    render(<DatePicker label="ถึงวันที่" />);

    expect(screen.getByRole("group", { name: "ถึงวันที่" }).querySelector("input")?.disabled).toBe(false);
    expect(screen.getByRole("button", { name: /choose date/i }).hasAttribute("disabled")).toBe(false);
  });
});
