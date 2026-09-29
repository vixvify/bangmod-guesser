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
        sx?: {
          backgroundColor?: string;
          backgroundImage?: string;
          borderRadius?: string | number;
          marginLeft?: string | number;
          marginRight?: string | number;
          width?: string;
        };
      };
    };
  }) => (
    <div>
      {[2, 3, 4, 5, 6, 7, 8, 10, 12].map((day) => {
        const date = dayjs(`2026-09-${String(day).padStart(2, "0")}`);
        const dayStyles = slotProps?.day?.({ day: date })?.sx;
        return (
          <button
            key={day}
            data-background={dayStyles?.backgroundColor}
            data-image={dayStyles?.backgroundImage}
            data-radius={dayStyles?.borderRadius}
            data-margin-left={dayStyles?.marginLeft}
            data-margin-right={dayStyles?.marginRight}
            data-width={dayStyles?.width}
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
  it("joins the selected dates into one rounded strip", () => {
    render(
      <DateRangePicker
        label="Date range"
        defaultValue={{ startDate: "2026-09-02", endDate: "2026-09-04" }}
      />,
    );

    fireEvent.click(screen.getByRole("textbox", { name: "Date range" }));
    const start = screen.getByRole("button", { name: /^2 / });
    const middle = screen.getByRole("button", { name: /^3 / });
    const end = screen.getByRole("button", { name: /^4 / });

    for (const date of [start, middle, end]) {
      expect(date.dataset.marginLeft).toBe("0");
      expect(date.dataset.marginRight).toBe("0");
      expect(date.dataset.width).toBe("calc(var(--PickerDay-size) + 2 * var(--PickerDay-horizontalMargin))");
    }
    expect(start.dataset.radius).toBe("0");
    expect(middle.dataset.radius).toBe("0");
    expect(end.dataset.radius).toBe("0");
    expect(start.dataset.image).toContain("radial-gradient(circle");
    expect(start.dataset.image).toContain("linear-gradient(to right");
    expect(start.dataset.image).toContain("linear-gradient(#fff, #fff)");
    expect(end.dataset.image).toContain("radial-gradient(circle");
    expect(end.dataset.image).toContain("linear-gradient(to left");
    expect(end.dataset.image).toContain("linear-gradient(#fff, #fff)");
    expect(middle.dataset.image).toBeUndefined();
  });

  it("rounds each end of a range that wraps to the next week", () => {
    render(
      <DateRangePicker
        label="Date range"
        defaultValue={{ startDate: "2026-09-04", endDate: "2026-09-08" }}
      />,
    );

    fireEvent.click(screen.getByRole("textbox", { name: "Date range" }));
    expect(screen.getByRole("button", { name: /^5 / }).dataset.radius).toBe("0 50% 50% 0");
    expect(screen.getByRole("button", { name: /^6 / }).dataset.radius).toBe("50% 0 0 50%");
  });

  it("shows a circular selected start date without a continuation", () => {
    render(
      <DateRangePicker
        label="Date range"
        defaultValue={{ startDate: "2026-09-04", endDate: null }}
      />,
    );

    fireEvent.click(screen.getByRole("textbox", { name: "Date range" }));
    const start = screen.getByRole("button", { name: /^4 / });
    expect(start.dataset.image).toContain("radial-gradient(circle");
    expect(start.dataset.image).not.toContain("linear-gradient(to ");
    expect(start.dataset.image).toContain("linear-gradient(#fff, #fff)");
  });

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
    expect(screen.getByRole("button", { name: "2 กันยายน" }).dataset.image).toContain("radial-gradient(circle");
    expect(screen.getByRole("button", { name: "3 กันยายน" }).dataset.background).toBe("var(--color-primary-soft)");
    expect(screen.getByRole("button", { name: "4 กันยายน" }).dataset.image).toContain("radial-gradient(circle");
  });

  it("selects a new start and end date, then closes the calendar", () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="เลือกช่วงเวลา" onChange={onChange} />);

    fireEvent.click(screen.getByRole("textbox", { name: "เลือกช่วงเวลา" }));
    expect(screen.queryByText("เลือกวันเริ่มต้น")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "10 กันยายน" }));
    expect(onChange).toHaveBeenLastCalledWith({
      startDate: "2026-09-10",
      endDate: null,
    });
    expect(screen.queryByText("เลือกวันสิ้นสุด")).toBeNull();

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
    expect(screen.queryByText("เลือกวันสิ้นสุด")).toBeNull();
  });
});
