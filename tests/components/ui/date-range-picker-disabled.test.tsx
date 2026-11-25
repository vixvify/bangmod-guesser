// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { DateRangePicker } from "@/shared/components/ui/date-range-picker";

afterEach(cleanup);

it("fades only the unavailable dates in the real calendar", async () => {
  render(
    <DateRangePicker
      label="ระยะเวลาการระงับ"
      theme="dark"
      minDate="2026-11-25"
      defaultValue={{ startDate: "2026-11-25", endDate: null }}
    />,
  );
  fireEvent.click(screen.getByRole("combobox", { name: "ระยะเวลาการระงับ" }));

  const past = await screen.findByRole("gridcell", { name: "24 พฤศจิกายน 2026" });
  const available = screen.getByRole("gridcell", { name: "26 พฤศจิกายน 2026" });
  expect(past).toHaveProperty("disabled", true);
  expect(available).toHaveProperty("disabled", false);
  expect(getComputedStyle(past).opacity).toBe("0.45");
  expect(getComputedStyle(available).opacity).not.toBe("0.45");
});
