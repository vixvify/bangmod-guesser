// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { signInEmail, replace, refresh, toastSuccess, toastError } = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signIn: { email: signInEmail } },
}));

vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: toastError } }));

import LoginPage from "@/app/(auth)/login/page";

async function renderPage(callbackUrl?: string) {
  await act(async () => {
    render(
      <Suspense fallback={<p>Loading</p>}>
        <LoginPage searchParams={Promise.resolve({ callbackUrl })} />
      </Suspense>,
    );
  });
}

describe("LoginPage", () => {
  beforeEach(() => {
    signInEmail.mockReset();
    replace.mockReset();
    refresh.mockReset();
    toastSuccess.mockReset();
    toastError.mockReset();
  });

  afterEach(cleanup);

  it("lets the user reveal the login password before submitting", async () => {
    await renderPage();
    const password = screen.getByLabelText("รหัสผ่าน") as HTMLInputElement;

    fireEvent.click(screen.getByRole("button", { name: "แสดงรหัสผ่าน" }));

    expect(password.type).toBe("text");
    expect(signInEmail).not.toHaveBeenCalled();
  });

  it("validates required fields before sending credentials", async () => {
    await renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "เข้าสู่ระบบ" }));

    expect(await screen.findByText("กรุณากรอกอีเมล")).toBeTruthy();
    expect(screen.getByText("กรุณากรอกรหัสผ่าน")).toBeTruthy();
    expect(signInEmail).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });

  it("submits normalized credentials and returns to the requested local page", async () => {
    signInEmail.mockResolvedValue({ error: null });
    await renderPage("/game");

    fireEvent.change(await screen.findByRole("textbox", { name: "อีเมล" }), {
      target: { value: "  STUDENT@EXAMPLE.COM  " },
    });
    fireEvent.change(screen.getByLabelText("รหัสผ่าน"), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }));

    await waitFor(() => {
      expect(signInEmail).toHaveBeenCalledWith({
        email: "student@example.com",
        password: "Password1",
      });
      expect(replace).toHaveBeenCalledWith("/game");
    });
    expect(refresh).toHaveBeenCalledOnce();
    expect(toastSuccess).toHaveBeenCalledWith("เข้าสู่ระบบสำเร็จ");
  });

  it("shows an authentication error without navigating", async () => {
    signInEmail.mockResolvedValue({ error: { code: "INVALID_EMAIL_OR_PASSWORD" } });
    await renderPage();

    fireEvent.change(await screen.findByRole("textbox", { name: "อีเมล" }), {
      target: { value: "student@example.com" },
    });
    fireEvent.change(screen.getByLabelText("รหัสผ่าน"), {
      target: { value: "WrongPassword1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน",
      );
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows a network toast when sign-in fails unexpectedly", async () => {
    signInEmail.mockRejectedValue(new Error("Network unavailable"));
    await renderPage();

    fireEvent.change(screen.getByRole("textbox", { name: "อีเมล" }), {
      target: { value: "student@example.com" },
    });
    fireEvent.change(screen.getByLabelText("รหัสผ่าน"), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("ไม่สามารถเชื่อมต่อได้ กรุณาลองอีกครั้ง");
    });
    expect(replace).not.toHaveBeenCalled();
  });
});
