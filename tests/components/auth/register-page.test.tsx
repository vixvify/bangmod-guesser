// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { signUpEmail, replace, refresh, toastSuccess, toastError } = vi.hoisted(() => ({
  signUpEmail: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signUp: { email: signUpEmail } },
}));

vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: toastError } }));

import RegisterPage from "@/app/(auth)/register/page";

async function renderPage(callbackUrl?: string) {
  await act(async () => {
    render(
      <Suspense fallback={<p>Loading</p>}>
        <RegisterPage searchParams={Promise.resolve({ callbackUrl })} />
      </Suspense>,
    );
  });
}

async function fillForm(confirmPassword = "Password1") {
  fireEvent.change(await screen.findByRole("textbox", { name: "ชื่อผู้ใช้" }), {
    target: { value: "  New Player  " },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "อีเมล" }), {
    target: { value: "  PLAYER@EXAMPLE.COM  " },
  });
  fireEvent.change(screen.getByLabelText("รหัสผ่าน"), {
    target: { value: "Password1" },
  });
  fireEvent.change(screen.getByLabelText("ยืนยันรหัสผ่าน"), {
    target: { value: confirmPassword },
  });
}

describe("RegisterPage", () => {
  beforeEach(() => {
    signUpEmail.mockReset();
    replace.mockReset();
    refresh.mockReset();
    toastSuccess.mockReset();
    toastError.mockReset();
  });

  afterEach(cleanup);

  it("lets the user reveal password and confirmation separately", async () => {
    await renderPage();
    const password = screen.getByLabelText("รหัสผ่าน") as HTMLInputElement;
    const confirmation = screen.getByLabelText("ยืนยันรหัสผ่าน") as HTMLInputElement;

    fireEvent.click(screen.getAllByRole("button", { name: "แสดงรหัสผ่าน" })[1]);

    expect(password.type).toBe("password");
    expect(confirmation.type).toBe("text");
    expect(signUpEmail).not.toHaveBeenCalled();
  });

  it("rejects a password confirmation that does not match", async () => {
    await renderPage();
    expect(screen.getByText("สร้างบัญชีของคุณเพื่อร่วมสนุกกับเรา")).toBeTruthy();
    await fillForm("Different1");
    fireEvent.click(screen.getByRole("button", { name: "สมัครสมาชิก" }));

    expect(await screen.findByText("รหัสผ่านไม่ตรงกัน")).toBeTruthy();
    expect(signUpEmail).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });

  it("registers with schema-normalized fields without sending confirmation", async () => {
    signUpEmail.mockResolvedValue({ error: null });
    await renderPage("/game");
    await fillForm();
    fireEvent.click(screen.getByRole("button", { name: "สมัครสมาชิก" }));

    await waitFor(() => {
      expect(signUpEmail).toHaveBeenCalledWith({
        name: "New Player",
        email: "player@example.com",
        password: "Password1",
      });
      expect(replace).toHaveBeenCalledWith("/login?callbackUrl=%2Fgame");
    });
    expect(refresh).not.toHaveBeenCalled();
    expect(toastSuccess).toHaveBeenCalledWith("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ");
  });

  it("shows a registration error without navigating", async () => {
    signUpEmail.mockResolvedValue({ error: { code: "VALIDATION_ERROR" } });
    await renderPage();
    await fillForm();
    fireEvent.click(screen.getByRole("button", { name: "สมัครสมาชิก" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "สมัครสมาชิกไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง",
      );
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows a network toast when sign-up fails unexpectedly", async () => {
    signUpEmail.mockRejectedValue(new Error("Network unavailable"));
    await renderPage();
    await fillForm();
    fireEvent.click(screen.getByRole("button", { name: "สมัครสมาชิก" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("ไม่สามารถเชื่อมต่อได้ กรุณาลองอีกครั้ง");
    });
    expect(replace).not.toHaveBeenCalled();
  });
});
