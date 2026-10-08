// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateLocationPage from "@/app/admin/locations/create/page";
import EditLocationPage from "@/app/admin/locations/[id]/edit/page";
import { LocationForm } from "@/components/admin/location-form";
import { Navbar } from "@/components/layout/navbar";
import { NavigationGuardProvider } from "@/hooks/use-navigation-guard";
import { mockLocations } from "@/_mock/_locations";
import { AppError } from "@/core/errors/app.error";
import { UserRole } from "@/core/domain/user";

const { getLocationById, post, put, push, refresh, success, error } = vi.hoisted(() => ({
  getLocationById: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/infrastructure/container", () => ({ locationService: { getLocationById } }));
vi.mock("@/lib/http", () => ({ default: { post, put } }));
vi.mock("sonner", () => ({ toast: { success, error } }));
vi.mock("@/lib/auth-client", () => ({ authClient: { signOut: vi.fn() } }));
vi.mock("next/navigation", async (importOriginal) => ({
  ...await importOriginal<typeof import("next/navigation")>(),
  useRouter: () => ({ push, refresh }),
}));
vi.mock("@/routes/api/location.routes", () => ({
  LocationRoutes: {
    create: "/api/locations",
    update: (id: string) => `/api/locations/${id}`,
  },
}));

let objectUrlCounter = 0;

beforeEach(() => {
  objectUrlCounter = 0;
  URL.createObjectURL = vi.fn(() => `blob:campus-preview-${++objectUrlCounter}`);
  URL.revokeObjectURL = vi.fn();
  getLocationById.mockResolvedValue(mockLocations[0]);
  post.mockResolvedValue({ data: mockLocations[0] });
  put.mockResolvedValue({ data: mockLocations[0] });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("location editor", () => {
  it("confirms discarding changes before navigating from the navbar", async () => {
    render(
      <NavigationGuardProvider>
        <Navbar user={{ id: "admin-1", name: "Admin", email: "admin@example.com", role: UserRole.ADMIN }} />
        <LocationForm onSave={vi.fn()} />
      </NavigationGuardProvider>,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อสถานที่ *" }), {
      target: { value: "ลานกิจกรรม" },
    });
    await act(async () => { await Promise.resolve(); });

    fireEvent.click(screen.getByRole("link", { name: "Bangmod Guesser" }));
    const discard = screen.getByRole("dialog", { name: "ยกเลิกการแก้ไข?" });
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(within(discard).getByRole("button", { name: "กลับไปแก้ไข" }));
    expect(push).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("link", { name: "โปรไฟล์ของ Admin" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "ยกเลิกการแก้ไข?" }))
      .getByRole("button", { name: "ออกโดยไม่บันทึก" }));
    expect(push).toHaveBeenCalledWith("/profile");
  });

  it("confirms discarding changes before opening the navbar logout confirmation", async () => {
    render(
      <NavigationGuardProvider>
        <Navbar user={{ id: "admin-1", name: "Admin", email: "admin@example.com", role: UserRole.ADMIN }} />
        <LocationForm onSave={vi.fn()} />
      </NavigationGuardProvider>,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อสถานที่ *" }), {
      target: { value: "ลานกิจกรรม" },
    });
    await act(async () => { await Promise.resolve(); });
    fireEvent.click(screen.getByRole("button", { name: "ออกจากระบบ" }));
    expect(screen.getByRole("dialog", { name: "ยกเลิกการแก้ไข?" })).toBeTruthy();
    fireEvent.click(within(screen.getByRole("dialog", { name: "ยกเลิกการแก้ไข?" }))
      .getByRole("button", { name: "ออกโดยไม่บันทึก" }));
    expect(screen.getByRole("dialog", { name: "ยืนยันการออกจากระบบ" })).toBeTruthy();
  });

  it("warns on browser Back and keeps the form when the warning is cancelled", async () => {
    render(<CreateLocationPage />);
    const name = screen.getByRole("textbox", { name: "ชื่อสถานที่ *" }) as HTMLInputElement;
    fireEvent.change(name, { target: { value: "ลานกิจกรรม" } });
    await act(async () => { await Promise.resolve(); });

    fireEvent.popState(window);

    const dialog = screen.getByRole("dialog", { name: "ยกเลิกการแก้ไข?" });
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "กลับไปแก้ไข" }));
    expect(name.value).toBe("ลานกิจกรรม");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("warns on browser Back when only an existing image was removed", async () => {
    render(await EditLocationPage({ params: Promise.resolve({ id: "location-01" }) }));
    fireEvent.click(screen.getByRole("button", { name: "ลบรูปที่ 1" }));

    fireEvent.popState(window);

    expect(screen.getByRole("dialog", { name: "ยกเลิกการแก้ไข?" })).toBeTruthy();
    expect(push).not.toHaveBeenCalled();
  });

  it("continues browser Back after confirming the discard warning", async () => {
    const go = vi.spyOn(window.history, "go").mockImplementation(() => {});
    render(<CreateLocationPage />);
    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อสถานที่ *" }), {
      target: { value: "ลานกิจกรรม" },
    });
    await act(async () => { await Promise.resolve(); });

    fireEvent.popState(window);
    fireEvent.click(within(screen.getByRole("dialog", { name: "ยกเลิกการแก้ไข?" }))
      .getByRole("button", { name: "ออกโดยไม่บันทึก" }));

    expect(go).toHaveBeenCalledWith(-2);
  });

  it("uses the browser's native warning for close or reload only while edited", async () => {
    render(<CreateLocationPage />);
    const name = screen.getByRole("textbox", { name: "ชื่อสถานที่ *" });
    const cleanEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);

    fireEvent.change(name, { target: { value: "ลานกิจกรรม" } });
    await act(async () => { await Promise.resolve(); });
    const dirtyEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);

    fireEvent.change(name, { target: { value: "" } });
    await act(async () => { await Promise.resolve(); });
    const revertedEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(revertedEvent);
    expect(revertedEvent.defaultPrevented).toBe(false);
  });

  it("asks before leaving the create page through the top back link", async () => {
    render(<CreateLocationPage />);
    const name = screen.getByRole("textbox", { name: "ชื่อสถานที่ *" }) as HTMLInputElement;
    fireEvent.change(name, { target: { value: "ลานกิจกรรม" } });
    await act(async () => { await Promise.resolve(); });

    const back = screen.getByRole("link", { name: "กลับไปจัดการสถานที่" });
    expect(back.getAttribute("href")).toBe("/admin/locations");
    fireEvent.click(back);

    const dialog = screen.getByRole("dialog", { name: "ยกเลิกการแก้ไข?" });
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "กลับไปแก้ไข" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(name.value).toBe("ลานกิจกรรม");
  });

  it("asks before leaving the edit page through the top back link after an image change", async () => {
    render(await EditLocationPage({ params: Promise.resolve({ id: "location-01" }) }));
    fireEvent.click(screen.getByRole("button", { name: "ลบรูปที่ 1" }));

    fireEvent.click(screen.getByRole("link", { name: "กลับไปจัดการสถานที่" }));

    const dialog = screen.getByRole("dialog", { name: "ยกเลิกการแก้ไข?" });
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "ออกโดยไม่บันทึก" }));
    expect(push).toHaveBeenCalledWith("/admin/locations");
  });

  it("navigates directly when cancelling an untouched location form", () => {
    render(<LocationForm onSave={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "ยกเลิก" }));
    expect(push).toHaveBeenCalledWith("/admin/locations");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("asks before discarding edited fields and lets the user keep editing", async () => {
    const onSave = vi.fn();
    render(<LocationForm onSave={onSave} />);
    const name = screen.getByRole("textbox", { name: "ชื่อสถานที่ *" }) as HTMLInputElement;
    fireEvent.change(name, { target: { value: "ลานกิจกรรม" } });
    await act(async () => { await Promise.resolve(); });

    fireEvent.click(screen.getByRole("button", { name: "ยกเลิก" }));
    const dialog = screen.getByRole("dialog", { name: "ยกเลิกการแก้ไข?" });
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "กลับไปแก้ไข" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(name.value).toBe("ลานกิจกรรม");
    fireEvent.click(screen.getByRole("button", { name: "ยกเลิก" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "ยกเลิกการแก้ไข?" }))
      .getByRole("button", { name: "ออกโดยไม่บันทึก" }));

    expect(push).toHaveBeenCalledWith("/admin/locations");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("asks before discarding image-only changes on update", async () => {
    render(<LocationForm location={mockLocations[0]} onSave={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "ลบรูปที่ 1" }));

    fireEvent.click(screen.getByRole("button", { name: "ยกเลิก" }));

    const dialog = screen.getByRole("dialog", { name: "ยกเลิกการแก้ไข?" });
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "กลับไปแก้ไข" }));
  });

  it("does not ask after an added image is removed again", async () => {
    render(<LocationForm onSave={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("เลือกรูปภาพสถานที่"), {
      target: { files: [new File(["image"], "campus.jpg", { type: "image/jpeg" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: "ลบรูป campus.jpg" }));

    fireEvent.click(screen.getByRole("button", { name: "ยกเลิก" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(push).toHaveBeenCalledWith("/admin/locations");
  });

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
    const dialog = await screen.findByRole("dialog", { name: "ยืนยันการสร้างสถานที่" });
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "ยืนยัน" }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        {
          name: "Campus",
          description: "",
          latitude: 13.6516,
          longitude: 100.4952,
        },
        { images: [file] },
      ),
    );
  });

  it("keeps entered values and does not create when confirmation is cancelled", async () => {
    const onSave = vi.fn();
    const { container } = render(<LocationForm onSave={onSave} />);
    const name = screen.getByRole("textbox", { name: "ชื่อสถานที่ *" }) as HTMLInputElement;
    fireEvent.change(name, { target: { value: "ลานกิจกรรม" } });
    fireEvent.change(screen.getByRole("textbox", { name: "ละติจูด *" }), { target: { value: "13.6516" } });
    fireEvent.change(screen.getByRole("textbox", { name: "ลองจิจูด *" }), { target: { value: "100.4952" } });
    fireEvent.change(container.querySelector('input[type="file"]')!, {
      target: { files: [new File(["image"], "campus.jpg", { type: "image/jpeg" })] },
    });

    const submit = container.querySelector('button[type="submit"]')!;
    await waitFor(() => expect(submit.hasAttribute("disabled")).toBe(false));
    fireEvent.click(submit);
    const dialog = await screen.findByRole("dialog", { name: "ยืนยันการสร้างสถานที่" });
    fireEvent.click(within(dialog).getByRole("button", { name: "กลับไปแก้ไข" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(name.value).toBe("ลานกิจกรรม");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("sends only retained image numbers and new files when editing", async () => {
    const onSave = vi.fn();
    const { container } = render(<LocationForm location={mockLocations[0]} onSave={onSave} />);

    fireEvent.click(screen.getByRole("button", { name: "ลบรูปที่ 1" }));
    const file = new File(["image"], "replacement.jpg", { type: "image/jpeg" });
    fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files: [file] } });

    const submit = container.querySelector('button[type="submit"]')!;
    await waitFor(() => expect(submit.hasAttribute("disabled")).toBe(false));
    fireEvent.click(submit);
    const dialog = await screen.findByRole("dialog", { name: "ยืนยันการแก้ไขสถานที่" });
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "ยืนยัน" }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(expect.any(Object), {
        keepImageNumbers: [2],
        newImages: [file],
      }),
    );
  });

  it("does not update when confirmation is cancelled", async () => {
    const onSave = vi.fn();
    render(<LocationForm location={mockLocations[0]} onSave={onSave} />);
    const name = screen.getByRole("textbox", { name: "ชื่อสถานที่ *" }) as HTMLInputElement;
    fireEvent.change(name, { target: { value: "อาคารใหม่" } });

    const submit = screen.getByRole("button", { name: "แก้ไขสถานที่" });
    await waitFor(() => expect(submit.hasAttribute("disabled")).toBe(false));
    fireEvent.click(submit);
    const dialog = await screen.findByRole("dialog", { name: "ยืนยันการแก้ไขสถานที่" });
    fireEvent.click(within(dialog).getByRole("button", { name: "กลับไปแก้ไข" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(name.value).toBe("อาคารใหม่");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("submits valid location data and an image to the create API", async () => {
    render(<CreateLocationPage />);

    const submit = screen.getByRole("button", { name: "สร้างสถานที่" });
    expect(submit.hasAttribute("disabled")).toBe(true);
    await act(async () => { await Promise.resolve(); });
    expect(screen.queryByRole("alert")).toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อสถานที่ *" }), { target: { value: "ลานกิจกรรม" } });
    fireEvent.change(screen.getByRole("textbox", { name: "ละติจูด *" }), { target: { value: "13.6516" } });
    fireEvent.change(screen.getByRole("textbox", { name: "ลองจิจูด *" }), { target: { value: "100.4952" } });

    expect(submit.hasAttribute("disabled")).toBe(true);
    const file = new File(["image"], "campus.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("เลือกรูปภาพสถานที่"), { target: { files: [file] } });
    await waitFor(() => expect(submit.hasAttribute("disabled")).toBe(false));
    fireEvent.click(submit);
    const createDialog = await screen.findByRole("dialog", { name: "ยืนยันการสร้างสถานที่" });
    expect(post).not.toHaveBeenCalled();
    fireEvent.click(within(createDialog).getByRole("button", { name: "ยืนยัน" }));
    await waitFor(() => expect(post).toHaveBeenCalled());
    const [url, form, options] = post.mock.calls[0];
    expect(url).toBe("/api/locations");
    expect(form).toBeInstanceOf(FormData);
    expect(form.get("name")).toBe("ลานกิจกรรม");
    expect(form.get("latitude")).toBe("13.6516");
    expect(form.getAll("images")).toEqual([file]);
    expect(options.headers["Content-Type"]).toBeUndefined();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/locations"));
    expect(success).toHaveBeenCalled();
  });

  it("spaces the location fields as a vertical group like the user form", () => {
    render(<CreateLocationPage />);

    const fields = screen.getByRole("textbox", { name: "ชื่อสถานที่ *" })
      .closest(".MuiFormControl-root")?.parentElement;
    expect(fields?.classList.contains("flex")).toBe(true);
    expect(fields?.classList.contains("flex-col")).toBe(true);
    expect(fields?.classList.contains("gap-4")).toBe(true);
  });

  it("loads the location on the server and previews existing photos", async () => {
    render(await EditLocationPage({ params: Promise.resolve({ id: "location-01" }) }));

    expect(getLocationById).toHaveBeenCalledWith("location-01");
    expect((screen.getByRole("textbox", { name: "ชื่อสถานที่ *" }) as HTMLInputElement).value).toBe("อาคารเรียนรวม 2 (CB2)");
    expect(screen.getByText("2 / 5 รูป")).toBeTruthy();
    expect(screen.getAllByRole("img", { name: /รูปสถานที่/ })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "แก้ไขสถานที่" }).hasAttribute("disabled")).toBe(true);
  });

  it("returns not found for an invalid location id without querying the service", async () => {
    await expect(EditLocationPage({ params: Promise.resolve({ id: " " }) }))
      .rejects.toThrow(/NEXT_HTTP_ERROR_FALLBACK;404/);
    expect(getLocationById).not.toHaveBeenCalled();
  });

  it("returns not found when the location service cannot find the id", async () => {
    getLocationById.mockRejectedValueOnce(new AppError("Location not found", 404));

    await expect(EditLocationPage({ params: Promise.resolve({ id: "missing" }) }))
      .rejects.toThrow(/NEXT_HTTP_ERROR_FALLBACK;404/);
  });

  it("rethrows unexpected location service errors", async () => {
    const failure = new AppError("Database unavailable", 500);
    getLocationById.mockRejectedValueOnce(failure);

    await expect(EditLocationPage({ params: Promise.resolve({ id: "location-01" }) }))
      .rejects.toBe(failure);
  });

  it("updates location details and retained images through the API", async () => {
    render(await EditLocationPage({ params: Promise.resolve({ id: "location-01" }) }));

    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อสถานที่ *" }), { target: { value: "อาคารเรียนรวม CB2" } });
    const submit = screen.getByRole("button", { name: "แก้ไขสถานที่" });
    await waitFor(() => expect(submit.hasAttribute("disabled")).toBe(false));
    fireEvent.click(submit);
    const updateDialog = await screen.findByRole("dialog", { name: "ยืนยันการแก้ไขสถานที่" });
    expect(put).not.toHaveBeenCalled();
    fireEvent.click(within(updateDialog).getByRole("button", { name: "ยืนยัน" }));

    await waitFor(() => expect(put).toHaveBeenCalled());
    const [url, form, options] = put.mock.calls[0];
    expect(url).toBe("/api/locations/location-01");
    expect(form.get("name")).toBe("อาคารเรียนรวม CB2");
    expect(form.getAll("keepImageNumbers")).toEqual(["1", "2"]);
    expect(options.headers["Content-Type"]).toBeUndefined();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/locations"));
  });

  it("sends removed image numbers and replacement files on update", async () => {
    render(await EditLocationPage({ params: Promise.resolve({ id: "location-01" }) }));
    fireEvent.click(screen.getByRole("button", { name: "ลบรูปที่ 1" }));
    const replacement = new File(["image"], "replacement.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText("เลือกรูปภาพสถานที่"), {
      target: { files: [replacement] },
    });

    const submit = screen.getByRole("button", { name: "แก้ไขสถานที่" });
    await waitFor(() => expect(submit.hasAttribute("disabled")).toBe(false));
    fireEvent.click(submit);
    fireEvent.click(within(await screen.findByRole("dialog", { name: "ยืนยันการแก้ไขสถานที่" }))
      .getByRole("button", { name: "ยืนยัน" }));

    await waitFor(() => expect(put).toHaveBeenCalled());
    const form = put.mock.calls[0][1] as FormData;
    expect(form.getAll("keepImageNumbers")).toEqual(["2"]);
    expect(form.getAll("newImages")).toEqual([replacement]);
  });

  it("keeps the create form open and reports API failure", async () => {
    post.mockRejectedValueOnce(new Error("offline"));
    render(<CreateLocationPage />);
    fireEvent.change(screen.getByRole("textbox", { name: "ชื่อสถานที่ *" }), { target: { value: "ลานกิจกรรม" } });
    fireEvent.change(screen.getByRole("textbox", { name: "ละติจูด *" }), { target: { value: "13.6516" } });
    fireEvent.change(screen.getByRole("textbox", { name: "ลองจิจูด *" }), { target: { value: "100.4952" } });
    fireEvent.change(screen.getByLabelText("เลือกรูปภาพสถานที่"), {
      target: { files: [new File(["image"], "campus.jpg", { type: "image/jpeg" })] },
    });
    const submit = screen.getByRole("button", { name: "สร้างสถานที่" });
    await waitFor(() => expect(submit.hasAttribute("disabled")).toBe(false));
    fireEvent.click(submit);
    fireEvent.click(within(await screen.findByRole("dialog", { name: "ยืนยันการสร้างสถานที่" }))
      .getByRole("button", { name: "ยืนยัน" }));

    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(push).not.toHaveBeenCalled();
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
