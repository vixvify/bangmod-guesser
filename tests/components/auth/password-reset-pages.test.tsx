// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPasswordPage from "@/app/(auth)/forgot-password/page";
import ResetPasswordPage from "@/app/(auth)/reset-password/page";
import { AUTH_MESSAGES } from "@/core/constants/auth";

const { toastInfo } = vi.hoisted(() => ({ toastInfo: vi.fn() }));

vi.mock("sonner", () => ({ toast: { info: toastInfo } }));

beforeEach(() => toastInfo.mockReset());
afterEach(cleanup);

describe("ForgotPasswordPage", () => {
  it("shows the email form without a login link beneath it", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByRole("heading", { name: "ลืมรหัสผ่าน" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "อีเมล" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "เข้าสู่ระบบ" })).toBeNull();
    expect((screen.getByRole("button", { name: "ขอลิงก์เปลี่ยนรหัสผ่าน" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("validates email but does not pretend a reset link was sent", async () => {
    render(<ForgotPasswordPage />);
    const email = screen.getByRole("textbox", { name: "อีเมล" });
    const submit = screen.getByRole("button", { name: "ขอลิงก์เปลี่ยนรหัสผ่าน" }) as HTMLButtonElement;

    fireEvent.change(email, { target: { value: "invalid" } });
    expect(submit.disabled).toBe(true);

    fireEvent.change(email, { target: { value: "student@example.com" } });
    await waitFor(() => expect(submit.disabled).toBe(false));
    fireEvent.click(submit);
    await waitFor(() => expect(toastInfo).toHaveBeenCalledWith(AUTH_MESSAGES.submit.passwordResetUnavailable));
  });
});

describe("ResetPasswordPage", () => {
  it("does not show a login link beneath the password form", () => {
    render(<ResetPasswordPage />);

    expect(screen.queryByRole("link", { name: "เข้าสู่ระบบ" })).toBeNull();
  });

  it("requires matching valid passwords before submitting the UI-only form", async () => {
    render(<ResetPasswordPage />);
    const password = screen.getByLabelText("รหัสผ่านใหม่");
    const confirmation = screen.getByLabelText("ยืนยันรหัสผ่านใหม่");
    const submit = screen.getByRole("button", { name: "บันทึกรหัสผ่านใหม่" }) as HTMLButtonElement;

    fireEvent.change(password, { target: { value: "Password1" } });
    fireEvent.change(confirmation, { target: { value: "Different1" } });
    expect(submit.disabled).toBe(true);

    fireEvent.change(confirmation, { target: { value: "Password1" } });
    await waitFor(() => expect(submit.disabled).toBe(false));
    fireEvent.click(submit);
    await waitFor(() => expect(toastInfo).toHaveBeenCalledWith(AUTH_MESSAGES.submit.passwordResetUnavailable));
  });
});
