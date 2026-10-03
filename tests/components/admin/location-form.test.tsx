// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateLocationPage from "@/app/admin/locations/create/page";
import EditLocationPage from "@/app/admin/locations/[id]/edit/page";
import { LocationForm } from "@/components/admin/location-form";
import { mockLocations } from "@/_mock/_locations";

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:campus-preview");
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("location editor", () => {
  it("passes validated fields and selected files to its parent", async () => {
    const onSave = vi.fn();
    const { container } = render(<LocationForm onSave={onSave} />);

    fireEvent.change(container.querySelector("#location-name")!, { target: { value: "Campus" } });
    fireEvent.change(container.querySelector("#location-latitude")!, { target: { value: "13.6516" } });
    fireEvent.change(container.querySelector("#location-longitude")!, { target: { value: "100.4952" } });
    const file = new File(["image"], "campus.jpg", { type: "image/jpeg" });
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [file] } });

    const submit = container.querySelector('button[type="submit"]')!;
    await waitFor(() => expect(submit.hasAttribute("disabled")).toBe(false));
    fireEvent.click(submit);

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        name: "Campus",
        description: "",
        latitude: "13.6516",
        longitude: "100.4952",
        keepImageNumbers: [],
        newImages: [file],
      }),
    );
  });

  it("sends only retained image numbers and new files when editing", async () => {
    const onSave = vi.fn();
    const { container } = render(<LocationForm location={mockLocations[0]} onSave={onSave} />);

    fireEvent.click(screen.getByRole("button", { name: "ลบรูป location-01.jpg" }));
    const file = new File(["image"], "replacement.jpg", { type: "image/jpeg" });
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [file] } });

    const submit = container.querySelector('button[type="submit"]')!;
    await waitFor(() => expect(submit.hasAttribute("disabled")).toBe(false));
    fireEvent.click(submit);

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
        keepImageNumbers: [2],
        newImages: [file],
      })),
    );
  });

  it("renders a separate create page and submits valid mock fields", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<CreateLocationPage />);

    const submit = screen.getByRole("button", { name: "สร้างสถานที่" });
    expect(submit.hasAttribute("disabled")).toBe(true);
    await act(async () => { await Promise.resolve(); });
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อสถานที่ *" }), { target: { value: "ลานกิจกรรม" } });
    fireEvent.change(screen.getByRole("textbox", { name: "ละติจูด *" }), { target: { value: "13.6516" } });
    fireEvent.change(screen.getByRole("textbox", { name: "ลองจิจูด *" }), { target: { value: "100.4952" } });

    await waitFor(() => expect(submit.hasAttribute("disabled")).toBe(false));
    fireEvent.click(submit);
    await waitFor(() => expect(log).toHaveBeenCalledWith("Mock location create:", expect.objectContaining({ name: "ลานกิจกรรม" })));
  });

  it("spaces the location fields as a vertical group like the user form", () => {
    render(<CreateLocationPage />);

    const fields = screen.getByRole("textbox", { name: "ชื่อสถานที่ *" })
      .closest(".MuiFormControl-root")?.parentElement;
    expect(fields?.classList.contains("flex")).toBe(true);
    expect(fields?.classList.contains("flex-col")).toBe(true);
    expect(fields?.classList.contains("gap-4")).toBe(true);
  });

  it("prepopulates the separate edit page and previews existing photos", async () => {
    await act(async () => {
      render(<Suspense fallback={null}><EditLocationPage params={Promise.resolve({ id: "location-01" })} /></Suspense>);
    });

    expect((screen.getByRole("textbox", { name: "ชื่อสถานที่ *" }) as HTMLInputElement).value).toBe("อาคารเรียนรวม 2 (CB2)");
    expect(screen.getByText("2 / 5 รูป")).toBeTruthy();
    expect(screen.getAllByRole("img", { name: /รูปสถานที่/ })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "แก้ไขสถานที่" }).hasAttribute("disabled")).toBe(true);
  });

  it("enables the edit action after a valid change but only logs the mock update", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    await act(async () => {
      render(<Suspense fallback={null}><EditLocationPage params={Promise.resolve({ id: "location-01" })} /></Suspense>);
    });

    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อสถานที่ *" }), { target: { value: "อาคารเรียนรวม CB2" } });
    const submit = screen.getByRole("button", { name: "แก้ไขสถานที่" });
    await waitFor(() => expect(submit.hasAttribute("disabled")).toBe(false));
    fireEvent.click(submit);

    await waitFor(() => expect(log).toHaveBeenCalledWith("Mock location update:", expect.objectContaining({ id: "location-01", name: "อาคารเรียนรวม CB2" })));
  });

  it("previews selected photos, limits them to five and allows removal", () => {
    render(<CreateLocationPage />);
    const files = Array.from({ length: 6 }, (_, index) => new File(["image"], `campus-${index + 1}.jpg`, { type: "image/jpeg" }));
    fireEvent.change(screen.getByLabelText("เลือกรูปภาพสถานที่"), { target: { files } });

    expect(screen.getByText("5 / 5 รูป")).toBeTruthy();
    expect(screen.getAllByRole("img", { name: /รูปสถานที่/ })).toHaveLength(5);
    expect(screen.getByRole("alert").textContent).toContain("สูงสุด 5 รูป");
    fireEvent.click(screen.getByRole("button", { name: "ลบรูป campus-1.jpg" }));
    expect(screen.getByText("4 / 5 รูป")).toBeTruthy();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});
