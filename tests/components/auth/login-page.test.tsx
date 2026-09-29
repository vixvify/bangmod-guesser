// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { signInEmail, signInSocial, replace, refresh, toastSuccess, toastError } = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  signInSocial: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signIn: { email: signInEmail, social: signInSocial } },
}));

vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: toastError } }));

import LoginPage from "@/app/(auth)/login/page";

async function renderPage(callbackUrl?: string, error?: string) {
  await act(async () => {
    render(
      <Suspense fallback={<p>Loading</p>}>
        <LoginPage searchParams={Promise.resolve({ callbackUrl, error })} />
      </Suspense>,
    );
  });
}

async function submitValidLogin() {
  const button = screen.getByRole("button", { name: "เข้าสู่ระบบ" }) as HTMLButtonElement;
  await waitFor(() => expect(button.disabled).toBe(false));
  fireEvent.click(button);
}

describe("LoginPage", () => {
  beforeEach(() => {
    signInEmail.mockReset();
    signInSocial.mockReset();
    replace.mockReset();
    refresh.mockReset();
    toastSuccess.mockReset();
    toastError.mockReset();
  });

  afterEach(cleanup);

  it("uses the local Google logo and leaves space below the divider", async () => {
    await renderPage();

    const googleButton = screen.getByRole("button", { name: "เข้าสู่ระบบด้วย Google" });
    const logo = googleButton.querySelector("img");

    expect(googleButton.parentElement?.classList.contains("mt-7")).toBe(true);
    expect(logo?.parentElement?.classList.contains("gap-4")).toBe(true);
    expect(logo?.getAttribute("src")).toContain("google.webp");
    expect(logo?.getAttribute("alt")).toBe("");
  });

  it("starts Google OAuth without requiring email fields and preserves the requested page", async () => {
    signInSocial.mockResolvedValue({ error: null });
    await renderPage("/game?mode=solo");

    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบด้วย Google" }));

    await waitFor(() => {
      expect(signInSocial).toHaveBeenCalledWith({
        provider: "google",
        callbackURL: "/game?mode=solo",
        errorCallbackURL: "/login?callbackUrl=%2Fgame%3Fmode%3Dsolo",
      });
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows a safe error when Google OAuth cannot start", async () => {
    signInSocial.mockResolvedValue({ error: { code: "OAUTH_PROVIDER_NOT_FOUND" } });
    await renderPage();

    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบด้วย Google" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    });
  });

  it("shows a safe error after Google redirects back with an OAuth failure", async () => {
    await renderPage(undefined, "access_denied");

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    });
    expect(signInSocial).not.toHaveBeenCalled();
  });

  it("lets the user reveal the login password before submitting", async () => {
    await renderPage();
    const password = screen.getByLabelText("รหัสผ่าน") as HTMLInputElement;

    fireEvent.click(screen.getByRole("button", { name: "แสดงรหัสผ่าน" }));

    expect(password.type).toBe("text");
    expect(signInEmail).not.toHaveBeenCalled();
  });

  it("keeps submit disabled when required fields are empty", async () => {
    await renderPage();
    const button = await screen.findByRole("button", { name: "เข้าสู่ระบบ" }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
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
    await submitValidLogin();

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
    await submitValidLogin();

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
    await submitValidLogin();

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("ไม่สามารถเชื่อมต่อได้ กรุณาลองอีกครั้ง");
    });
    expect(replace).not.toHaveBeenCalled();
  });
});
