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

vi.mock("@/routes/api/session.routes", () => ({
  SessionRoutes: { register: "/session/register" },
}));

vi.mock("@/lib/http", () => ({
  HttpError: class HttpError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
      super(message);
      this.status = status;
    }
  },
  default: { post: vi.fn((_url: string, body: unknown) => signUpEmail(body)) },
}));

vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: toastError } }));

import RegisterPage from "@/app/(auth)/register/page";
import { HttpError } from "@/lib/http";

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

async function submitValidRegistration() {
  const button = screen.getByRole("button", { name: "สมัครสมาชิก" }) as HTMLButtonElement;
  await waitFor(() => expect(button.disabled).toBe(false));
  fireEvent.click(button);
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

  it("keeps submit disabled when password confirmation does not match", async () => {
    await renderPage();
    expect(screen.getByText("สร้างบัญชีของคุณเพื่อร่วมสนุกกับเรา")).toBeTruthy();
    await fillForm("Different1");
    const button = screen.getByRole("button", { name: "สมัครสมาชิก" }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(signUpEmail).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });

  it("registers with schema-normalized fields without sending confirmation", async () => {
    signUpEmail.mockResolvedValue({ data: null });
    await renderPage("/game");
    await fillForm();
    await submitValidRegistration();

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
    signUpEmail.mockRejectedValue(new HttpError("VALIDATION_ERROR", 400));
    await renderPage();
    await fillForm();
    await submitValidRegistration();

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "สมัครสมาชิกไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง",
      );
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows a network toast when sign-up fails unexpectedly", async () => {
    signUpEmail.mockRejectedValue(new HttpError("Network unavailable"));
    await renderPage();
    await fillForm();
    await submitValidRegistration();

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("ไม่สามารถเชื่อมต่อได้ กรุณาลองอีกครั้ง");
    });
    expect(replace).not.toHaveBeenCalled();
  });
});
