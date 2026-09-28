// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DateRangePicker } from "@/components/ui/date-range-picker";

vi.mock("@mui/material/Popover", () => ({
  default: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div>{children}</div> : null,
}));

vi.mock("@mui/x-date-pickers/DateCalendar", () => ({
  DateCalendar: ({
    onChange,
    slotProps,
  }: {
    onChange: (date: ReturnType<typeof dayjs>) => void;
    slotProps?: {
      day?: (state: { day: ReturnType<typeof dayjs> }) => {
        sx?: { backgroundColor?: string };
      };
    };
  }) => (
    <div>
      {[2, 3, 4, 8, 10, 12].map((day) => {
        const date = dayjs(`2026-09-${String(day).padStart(2, "0")}`);
        return (
          <button
            key={day}
            data-background={slotProps?.day?.({ day: date })?.sx?.backgroundColor}
            onClick={() => onChange(date)}
          >
            {day} กันยายน
          </button>
        );
      })}
    </div>
  ),
}));

afterEach(cleanup);

describe("DateRangePicker", () => {
  it("shows the initial range in one field", () => {
    render(
      <DateRangePicker
        label="เลือกช่วงเวลา"
        defaultValue={{ startDate: "2026-09-02", endDate: "2026-09-04" }}
      />,
    );

    const input = screen.getByRole("textbox", { name: "เลือกช่วงเวลา" });
    expect(input).toHaveProperty("value", "2 กันยายน 2026 - 4 กันยายน 2026");
    expect(input.closest(".MuiOutlinedInput-root")).toBeTruthy();
    expect(screen.queryByText("เลือกวันเริ่มต้น")).toBeNull();
  });

  it("marks the start, middle, and end dates in the calendar", () => {
    render(
      <DateRangePicker
        label="เลือกช่วงเวลา"
        defaultValue={{ startDate: "2026-09-02", endDate: "2026-09-04" }}
      />,
    );

    fireEvent.click(screen.getByRole("textbox", { name: "เลือกช่วงเวลา" }));
    expect(screen.getByRole("button", { name: "2 กันยายน" }).dataset.background).toBe("var(--color-primary-main)");
    expect(screen.getByRole("button", { name: "3 กันยายน" }).dataset.background).toBe("var(--color-primary-soft)");
    expect(screen.getByRole("button", { name: "4 กันยายน" }).dataset.background).toBe("var(--color-primary-main)");
  });

  it("selects a new start and end date, then closes the calendar", () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="เลือกช่วงเวลา" onChange={onChange} />);

    fireEvent.click(screen.getByRole("textbox", { name: "เลือกช่วงเวลา" }));
    expect(screen.getByText("เลือกวันเริ่มต้น")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "10 กันยายน" }));
    expect(onChange).toHaveBeenLastCalledWith({
      startDate: "2026-09-10",
      endDate: null,
    });
    expect(screen.getByText("เลือกวันสิ้นสุด")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "12 กันยายน" }));
    expect(onChange).toHaveBeenLastCalledWith({
      startDate: "2026-09-10",
      endDate: "2026-09-12",
    });
    expect(screen.getByRole("textbox", { name: "เลือกช่วงเวลา" })).toHaveProperty(
      "value",
      "10 กันยายน 2026 - 12 กันยายน 2026",
    );
    expect(screen.queryByText("เลือกวันสิ้นสุด")).toBeNull();
  });

  it("restarts the range when the second date is before the start", () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="เลือกช่วงเวลา" onChange={onChange} />);

    fireEvent.click(screen.getByRole("textbox", { name: "เลือกช่วงเวลา" }));
    fireEvent.click(screen.getByRole("button", { name: "10 กันยายน" }));
    fireEvent.click(screen.getByRole("button", { name: "8 กันยายน" }));

    expect(onChange).toHaveBeenLastCalledWith({
      startDate: "2026-09-08",
      endDate: null,
    });
    expect(screen.getByText("เลือกวันสิ้นสุด")).toBeTruthy();
  });
});
