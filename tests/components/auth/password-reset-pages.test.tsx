// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPasswordPage from "@/app/(auth)/forgot-password/page";
import ResetPasswordPage from "@/app/(auth)/reset-password/page";
import { AUTH_MESSAGES } from "@/features/auth/auth.constants";
import { SessionRoutes } from "@/features/auth/session.routes";
import { AppRoutes } from "@/shared/routes/routes";
import { HttpError } from "@/shared/lib/http";

const { toastSuccess, toastError, httpPost, routerPush } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  httpPost: vi.fn(),
  routerPush: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: toastError } }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));
vi.mock("@/shared/lib/http", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/lib/http")>();
  return { ...actual, default: { post: httpPost } };
});

beforeEach(() => {
  vi.clearAllMocks();
  httpPost.mockResolvedValue({});
  window.history.replaceState({}, "", "/reset-password");
});
afterEach(cleanup);

describe("ForgotPasswordPage", () => {
  it("shows the email form and a link back to login", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByRole("heading", { name: "ลืมรหัสผ่าน" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "อีเมล" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "กลับไปหน้าเข้าสู่ระบบ" }).getAttribute("href")).toBe("/login");
    expect((screen.getByRole("button", { name: "ขอลิงก์เปลี่ยนรหัสผ่าน" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("validates email before allowing submission", async () => {
    render(<ForgotPasswordPage />);
    const email = screen.getByRole("textbox", { name: "อีเมล" });
    const submit = screen.getByRole("button", { name: "ขอลิงก์เปลี่ยนรหัสผ่าน" }) as HTMLButtonElement;

    fireEvent.change(email, { target: { value: "invalid" } });
    expect(submit.disabled).toBe(true);
    expect(httpPost).not.toHaveBeenCalled();

    fireEvent.change(email, { target: { value: "student@example.com" } });
    await waitFor(() => expect(submit.disabled).toBe(false));
  });

  it("sends a password reset request and shows a success message", async () => {
    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByRole("textbox", { name: "อีเมล" }), { target: { value: "student@example.com" } });

    const submit = screen.getByRole("button", { name: "ขอลิงก์เปลี่ยนรหัสผ่าน" });

    await waitFor(() => expect((submit as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(submit);

    await waitFor(() => {
      expect(httpPost).toHaveBeenCalledWith(SessionRoutes.forgotPassword, { email: "student@example.com" });
      expect(toastSuccess).toHaveBeenCalledWith(AUTH_MESSAGES.submit.passwordResetRequestSuccess);
    });
  });

  it("shows an error message when the password reset request fails", async () => {
    httpPost.mockRejectedValueOnce(new Error("Request failed"));

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByRole("textbox", { name: "อีเมล" }), { target: { value: "student@example.com" } });

    const submit = screen.getByRole("button", { name: "ขอลิงก์เปลี่ยนรหัสผ่าน" });

    await waitFor(() => expect((submit as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(submit);

    await waitFor(() => expect(toastError).toHaveBeenCalledWith(AUTH_MESSAGES.submit.passwordResetRequestFailed));
  });

  it("explains the retry delay when the request is rate limited", async () => {
    httpPost.mockRejectedValueOnce(new HttpError("Too many requests", 429, undefined, 20));
    render(<ForgotPasswordPage />);
    fireEvent.change(screen.getByRole("textbox", { name: "อีเมล" }), { target: { value: "student@example.com" } });
    const submit = screen.getByRole("button", { name: "ขอลิงก์เปลี่ยนรหัสผ่าน" });
    await waitFor(() => expect((submit as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(submit);
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("ส่งคำขอบ่อยเกินไป กรุณารอ 20 วินาทีแล้วลองอีกครั้ง"));
  });
});

describe("ResetPasswordPage", () => {
  it("shows the password form and a link back to login", () => {
    render(<ResetPasswordPage />);

    expect(screen.getByRole("heading", { name: "เปลี่ยนรหัสผ่าน" })).toBeTruthy();
    expect(screen.getByLabelText("รหัสผ่านใหม่")).toBeTruthy();
    expect(screen.getByLabelText("ยืนยันรหัสผ่านใหม่")).toBeTruthy();
    expect(screen.getByRole("link", { name: "กลับไปหน้าเข้าสู่ระบบ" }).getAttribute("href")).toBe("/login");
  });

  it("requires matching valid passwords before allowing submission", async () => {
    render(<ResetPasswordPage />);
    const password = screen.getByLabelText("รหัสผ่านใหม่");
    const confirmation = screen.getByLabelText("ยืนยันรหัสผ่านใหม่");
    const submit = screen.getByRole("button", { name: "บันทึกรหัสผ่านใหม่" }) as HTMLButtonElement;

    fireEvent.change(password, { target: { value: "Password1" } });
    fireEvent.change(confirmation, { target: { value: "Different1" } });
    expect(submit.disabled).toBe(true);

    fireEvent.change(confirmation, { target: { value: "Password1" } });
    await waitFor(() => expect(submit.disabled).toBe(false));
    expect(httpPost).not.toHaveBeenCalled();
  });

  it("submits the new password and redirects to login when successful", async () => {
    window.history.replaceState({}, "", "/reset-password?token=test-reset-token");

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText("รหัสผ่านใหม่"), { target: { value: "Password1" } });
    fireEvent.change(screen.getByLabelText("ยืนยันรหัสผ่านใหม่"), { target: { value: "Password1" } });

    const submit = screen.getByRole("button", { name: "บันทึกรหัสผ่านใหม่" });

    await waitFor(() => expect((submit as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(submit);

    await waitFor(() => {
      expect(httpPost).toHaveBeenCalledWith(SessionRoutes.resetPassword, {
        token: "test-reset-token",
        password: "Password1",
        confirmPassword: "Password1",
      });
      expect(toastSuccess).toHaveBeenCalledWith(AUTH_MESSAGES.submit.passwordResetSuccess);
      expect(routerPush).toHaveBeenCalledWith(AppRoutes.login);
    });
  });

  it("shows an error message when the reset password request fails", async () => {
    window.history.replaceState({}, "", "/reset-password?token=test-reset-token");
    httpPost.mockRejectedValueOnce(new Error("Request failed"));

    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText("รหัสผ่านใหม่"), { target: { value: "Password1" } });
    fireEvent.change(screen.getByLabelText("ยืนยันรหัสผ่านใหม่"), { target: { value: "Password1" } });

    const submit = screen.getByRole("button", { name: "บันทึกรหัสผ่านใหม่" });

    await waitFor(() => expect((submit as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(submit);

    await waitFor(() => expect(toastError).toHaveBeenCalledWith(AUTH_MESSAGES.submit.passwordResetFailed));
    expect(routerPush).not.toHaveBeenCalled();
  });

  it("explains when password reset is rate limited", async () => {
    window.history.replaceState({}, "", "/reset-password?token=test-reset-token");
    httpPost.mockRejectedValueOnce(new HttpError("Too many requests", 429));
    render(<ResetPasswordPage />);
    fireEvent.change(screen.getByLabelText("รหัสผ่านใหม่"), { target: { value: "Password1" } });
    fireEvent.change(screen.getByLabelText("ยืนยันรหัสผ่านใหม่"), { target: { value: "Password1" } });
    const submit = screen.getByRole("button", { name: "บันทึกรหัสผ่านใหม่" });
    await waitFor(() => expect((submit as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(submit);
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองอีกครั้ง"));
    expect(routerPush).not.toHaveBeenCalled();
  });

  it("shows an error and does not submit when the reset token is missing", async () => {
    render(<ResetPasswordPage />);

    fireEvent.change(screen.getByLabelText("รหัสผ่านใหม่"), { target: { value: "Password1" } });
    fireEvent.change(screen.getByLabelText("ยืนยันรหัสผ่านใหม่"), { target: { value: "Password1" } });

    const submit = screen.getByRole("button", { name: "บันทึกรหัสผ่านใหม่" });

    await waitFor(() => expect((submit as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(submit);

    await waitFor(() => expect(toastError).toHaveBeenCalledWith(AUTH_MESSAGES.submit.passwordResetInvalidLink));
    expect(httpPost).not.toHaveBeenCalled();
    expect(routerPush).not.toHaveBeenCalled();
  });
});
