// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dropdown } from "@/components/ui/dropdown";

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
