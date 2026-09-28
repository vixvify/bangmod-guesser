// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsDialog } from "@/components/ui/settings-dialog";
import { SETTINGS_MESSAGES } from "@/core/constants/settings";

describe("SettingsDialog", () => {
  afterEach(cleanup);

  it("renders the settings modal with title, sliders, select, and action buttons", () => {
    render(<SettingsDialog open={true} onClose={vi.fn()} />);

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: SETTINGS_MESSAGES.title })).toBeTruthy();
    expect(screen.getByLabelText(SETTINGS_MESSAGES.sfxVolume)).toBeTruthy();
    expect(screen.getByLabelText(SETTINGS_MESSAGES.musicVolume)).toBeTruthy();
    expect(screen.getByLabelText(SETTINGS_MESSAGES.imageQuality)).toBeTruthy();
    expect(screen.getByRole("button", { name: SETTINGS_MESSAGES.cancel })).toBeTruthy();
    expect(screen.getByRole("button", { name: SETTINGS_MESSAGES.confirm })).toBeTruthy();
  });

  it("calls onClose when the cancel button is clicked", () => {
    const handleClose = vi.fn();
    render(<SettingsDialog open={true} onClose={handleClose} />);

    fireEvent.click(screen.getByRole("button", { name: SETTINGS_MESSAGES.cancel }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onSave and onClose with updated settings when confirmed", async () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();
    render(
      <SettingsDialog
        open={true}
        onClose={handleClose}
        onSave={handleSave}
      />,
    );

    const qualitySelect = screen.getByRole("combobox");
    fireEvent.mouseDown(qualitySelect);
    const mediumOption = await screen.findByRole("option", {
      name: SETTINGS_MESSAGES.qualities.medium,
    });
    fireEvent.click(mediumOption);

    fireEvent.click(screen.getByRole("button", { name: SETTINGS_MESSAGES.confirm }));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        imageQuality: "medium",
      }),
    );
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the close icon button is clicked", () => {
    const handleClose = vi.fn();
    render(<SettingsDialog open={true} onClose={handleClose} />);

    fireEvent.click(screen.getByRole("button", { name: SETTINGS_MESSAGES.close }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
