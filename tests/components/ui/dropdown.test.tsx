// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dropdown } from "@/shared/components/ui/dropdown";
import { Input } from "@/shared/components/ui/input";

describe("Dropdown", () => {
  afterEach(cleanup);

  const options = [
    { value: "ultra", label: "สูงสุด" },
    { value: "medium", label: "ปานกลาง" },
    { value: "low", label: "ต่ำ" },
  ];

  it("renders with the selected value and accessible label", () => {
    render(
      <Dropdown
        id="test-dropdown"
        value="ultra"
        options={options}
        onChange={vi.fn()}
        aria-label="คุณภาพของรูปภาพ"
      />,
    );

    expect(screen.getByText("สูงสุด")).toBeTruthy();
  });

  it("matches the compact input height and visible label spacing", () => {
    render(
      <>
        <Input id="search" label="ค้นหา" size="small" theme="dark" />
        <Dropdown label="กรองตามสถานะ" theme="dark" value="ultra" options={options} onChange={vi.fn()} />
      </>,
    );

    const input = screen.getByRole("textbox", { name: "ค้นหา" });
    const select = screen.getByRole("combobox", { name: "กรองตามสถานะ" });
    expect(getComputedStyle(select.parentElement!).minHeight).toBe("2.5rem");
    expect(getComputedStyle(select.parentElement!).minHeight).toBe(getComputedStyle(input.parentElement!).minHeight);
    expect(getComputedStyle(screen.getByText("กรองตามสถานะ")).marginBottom)
      .toBe(getComputedStyle(screen.getByText("ค้นหา")).marginBottom);
  });

  it("opens options and triggers onChange when selecting a new option", async () => {
    const handleChange = vi.fn();
    render(
      <Dropdown
        id="test-dropdown"
        value="ultra"
        options={options}
        onChange={handleChange}
        aria-label="คุณภาพของรูปภาพ"
      />,
    );

    // Click the select to open the menu
    const selectTrigger = screen.getByRole("combobox");
    fireEvent.mouseDown(selectTrigger);

    // Click the 'ปานกลาง' option
    const mediumOption = await screen.findByRole("option", { name: "ปานกลาง" });
    fireEvent.click(mediumOption);

    expect(handleChange).toHaveBeenCalledWith("medium");
  });
});
