import { describe, expect, it } from "vitest";
import { formatTime } from "@/lib/utils";

describe("formatTime", () => {
  it("formats zero seconds as 00:00", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("pads single-digit seconds with a leading zero", () => {
    expect(formatTime(5)).toBe("00:05");
  });

  it("formats seconds below one minute without minutes", () => {
    expect(formatTime(40)).toBe("00:40");
  });

  it("formats exact one minute as 01:00", () => {
    expect(formatTime(60)).toBe("01:00");
  });

  it("formats minutes and seconds together", () => {
    expect(formatTime(90)).toBe("01:30");
  });

  it("pads single-digit minutes with a leading zero", () => {
    expect(formatTime(125)).toBe("02:05");
  });

  it("formats large values with double-digit minutes", () => {
    expect(formatTime(600)).toBe("10:00");
  });
});
