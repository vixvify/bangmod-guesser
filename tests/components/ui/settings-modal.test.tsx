// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsModal } from "@/components/ui/settings-modal";
import { SETTINGS_MESSAGES } from "@/core/constants/settings";

describe("SettingsModal", () => {
  afterEach(cleanup);

  it("renders the settings modal with title, sliders, select, and action buttons", () => {
    render(<SettingsModal open={true} onClose={vi.fn()} />);

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: SETTINGS_MESSAGES.title })).toBeTruthy();
    expect(screen.getByLabelText(SETTINGS_MESSAGES.sfxVolume)).toBeTruthy();
    expect(screen.getByLabelText(SETTINGS_MESSAGES.musicVolume)).toBeTruthy();
    expect(screen.getByLabelText(SETTINGS_MESSAGES.imageQuality)).toBeTruthy();
    expect(screen.getByRole("button", { name: SETTINGS_MESSAGES.cancel })).toBeTruthy();
    expect(screen.getByRole("button", { name: SETTINGS_MESSAGES.confirm })).toBeTruthy();
    expect(screen.getByText("80%")).toBeTruthy();
    expect(screen.getByText("50%")).toBeTruthy();
    expect(
      screen
        .getByRole("slider", { name: SETTINGS_MESSAGES.sfxVolume })
        .getAttribute("aria-valuemin"),
    ).toBe("1");
    expect(
      screen
        .getByRole("slider", { name: SETTINGS_MESSAGES.musicVolume })
        .getAttribute("aria-valuemax"),
    ).toBe("100");
  });

  it("updates the displayed percentage when a volume slider changes", () => {
    render(<SettingsModal open={true} onClose={vi.fn()} />);

    const sfxSlider = screen.getByRole("slider", {
      name: SETTINGS_MESSAGES.sfxVolume,
    });
    fireEvent.keyDown(sfxSlider, { key: "ArrowRight" });

    expect(screen.getByText("81%")).toBeTruthy();
    expect(sfxSlider.getAttribute("aria-valuenow")).toBe("81");
  });

  it("restores the initial percentages when the modal is reopened", async () => {
    const { rerender } = render(<SettingsModal open={true} onClose={vi.fn()} />);

    fireEvent.keyDown(
      screen.getByRole("slider", { name: SETTINGS_MESSAGES.sfxVolume }),
      { key: "ArrowRight" },
    );
    expect(screen.getByText("81%")).toBeTruthy();

    rerender(<SettingsModal open={false} onClose={vi.fn()} />);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    rerender(<SettingsModal open={true} onClose={vi.fn()} />);

    expect(screen.getByText("80%")).toBeTruthy();
  });

  it("calls onClose when the cancel button is clicked", () => {
    const handleClose = vi.fn();
    render(<SettingsModal open={true} onClose={handleClose} />);

    fireEvent.click(screen.getByRole("button", { name: SETTINGS_MESSAGES.cancel }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onSave and onClose with updated settings when confirmed", async () => {
    const handleClose = vi.fn();
    const handleSave = vi.fn();
    render(
      <SettingsModal
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
    render(<SettingsModal open={true} onClose={handleClose} />);

    fireEvent.click(screen.getByRole("button", { name: SETTINGS_MESSAGES.close }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
