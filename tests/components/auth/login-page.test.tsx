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

vi.mock("@/features/auth/session.routes", () => ({
  SessionRoutes: { login: "/session/login", googleLogin: "/session/google" },
}));

vi.mock("@/shared/lib/http", () => ({
  HttpError: class HttpError extends Error {
    status?: number;
    statusCode?: string;
    retryAfter?: number;
    data?: unknown;
    constructor(
      message: string,
      status?: number,
      statusCode?: string,
      retryAfter?: number,
      data?: unknown,
    ) {
      super(message);
      this.name = "HttpError";
      this.status = status;
      this.statusCode = statusCode;
      this.retryAfter = retryAfter;
      this.data = data;
    }
  },
  default: { post: vi.fn((url: string, body: unknown) =>
    url.endsWith("/google") ? signInSocial(body) : signInEmail(body)),
  },
}));

vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: toastError } }));

import LoginPage from "@/app/(auth)/login/page";
import { HttpError } from "@/shared/lib/http";
import { AUTH_MESSAGES, EMAIL_NOT_VERIFIED_CODE } from "@/features/auth/auth.constants";

async function renderPage(
  callbackUrl?: string,
  error?: string,
  reactStrictMode = false,
  errorDescription?: string,
  verification?: string,
) {
  await act(async () => {
    render(
      <Suspense fallback={<p>Loading</p>}>
        <LoginPage searchParams={Promise.resolve({ callbackUrl, error, error_description: errorDescription, verification })} />
      </Suspense>,
      { reactStrictMode },
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

  it("links to the password reset request page", async () => {
    await renderPage();

    expect(screen.getByRole("link", { name: "ลืมรหัสผ่าน?" }).getAttribute("href")).toBe("/forgot-password");
  });

  it("starts Google OAuth without requiring email fields and preserves the requested page", async () => {
    signInSocial.mockResolvedValue({ data: { url: "https://accounts.google.com/" } });
    await renderPage("/game/demo?mode=solo");

    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบด้วย Google" }));

    await waitFor(() => {
      expect(signInSocial).toHaveBeenCalledWith({
        callbackURL: "/game/demo?mode=solo",
        errorCallbackURL: "/login?callbackUrl=%2Fgame%2Fdemo%3Fmode%3Dsolo",
      });
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows a safe error when Google OAuth cannot start", async () => {
    signInSocial.mockRejectedValue(new HttpError("OAUTH_PROVIDER_NOT_FOUND", 400));
    await renderPage();

    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบด้วย Google" }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองอีกครั้ง",
        { id: "google-login-error" },
      );
    });
  });

  it("explains rate limiting when Google sign-in is requested too often", async () => {
    signInSocial.mockRejectedValue(new HttpError("Too many requests", 429));
    await renderPage();
    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบด้วย Google" }));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองอีกครั้ง", { id: "google-login-error" }));
  });

  it("explains the suspension when Google returns a banned-user error", async () => {
    await renderPage(undefined, "BANNED_USER", true);

    await waitFor(() => expect(toastError).toHaveBeenCalledExactlyOnceWith(
      "บัญชีของคุณถูกระงับการใช้งาน",
      { id: "google-login-error" },
    ));
  });

  it("shows a safe error after Google redirects back with an OAuth failure", async () => {
    await renderPage(undefined, "access_denied");

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองอีกครั้ง",
        { id: "google-login-error" },
      );
    });
    expect(signInSocial).not.toHaveBeenCalled();
  });

  it("shows a timed Google suspension in Bangkok time exactly once", async () => {
    await renderPage(undefined, "BANNED_USER", true, "2026-11-18T00:00:00.000Z");

    expect(toastError).toHaveBeenCalledExactlyOnceWith(
      "บัญชีของคุณถูกระงับการใช้งาน คุณจะสามารถกลับมาใช้งานได้อีกครั้งในวันที่ 18 พฤศจิกายน 2569 เวลา 07:00 น.",
      { id: "google-login-error" },
    );
  });

  it("asks for email verification after sign-in is refused for an unverified account", async () => {
    signInEmail.mockRejectedValue(new HttpError("Sign in failed", 403, EMAIL_NOT_VERIFIED_CODE));
    await renderPage();
    fireEvent.change(screen.getByRole("textbox", { name: "อีเมล" }), {
      target: { value: "student@example.com" },
    });
    fireEvent.change(screen.getByLabelText("รหัสผ่าน"), { target: { value: "Password1" } });
    await submitValidLogin();

    await waitFor(() => expect(toastError).toHaveBeenCalledWith(
      AUTH_MESSAGES.submit.emailNotVerified, { id: "email-verification" },
    ));
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows the verification result after following a valid link", async () => {
    await renderPage(undefined, undefined, false, undefined, "email");
    expect(toastSuccess).toHaveBeenCalledWith(AUTH_MESSAGES.submit.emailVerificationSuccess, { id: "email-verification" });
  });

  it("shows a verification error when the link has expired", async () => {
    await renderPage(undefined, "TOKEN_EXPIRED", false, undefined, "email");
    expect(toastError).toHaveBeenCalledWith(AUTH_MESSAGES.submit.emailVerificationFailed, { id: "email-verification" });
  });

  it("ignores an invalid suspension date in the Google callback", async () => {
    await renderPage(undefined, "BANNED_USER", false, "invalid date");

    expect(toastError).toHaveBeenCalledExactlyOnceWith(
      "บัญชีของคุณถูกระงับการใช้งาน",
      { id: "google-login-error" },
    );
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

  it("shows an email error after blur and clears it as the user corrects it", async () => {
    await renderPage();
    const email = screen.getByRole("textbox", { name: "อีเมล" });
    fireEvent.change(email, { target: { value: "invalid-email" } });
    expect(email.getAttribute("aria-invalid")).toBe("false");
    fireEvent.blur(email);

    await waitFor(() => {
      expect(email.getAttribute("aria-invalid")).toBe("true");
      expect(email.getAttribute("aria-describedby")).toContain("login-email-error");
      expect(document.getElementById("login-email-error")?.textContent).toBeTruthy();
    });
    expect((screen.getByRole("button", { name: "เข้าสู่ระบบ" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(email, { target: { value: "student@example.com" } });
    await waitFor(() => expect(email.getAttribute("aria-invalid")).toBe("false"));
  });

  it("submits normalized credentials and returns to the requested local page", async () => {
    signInEmail.mockResolvedValue({ data: null });
    await renderPage("/game/demo");

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
      expect(replace).toHaveBeenCalledWith("/game/demo");
    });
    expect(refresh).toHaveBeenCalledOnce();
    expect(toastSuccess).toHaveBeenCalledWith("เข้าสู่ระบบสำเร็จ");
  });

  it("shows an authentication error without navigating", async () => {
    signInEmail.mockRejectedValue(new HttpError("INVALID_EMAIL_OR_PASSWORD", 401));
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

  it("shows a suspended-account message when a banned user attempts to sign in", async () => {
    signInEmail.mockRejectedValue(
      new HttpError("Sign in failed", 403, "BANNED_USER", undefined, {
        banExpires: null,
      }),
    );
    await renderPage();

    fireEvent.change(screen.getByLabelText("อีเมล"), {
      target: { value: "student@example.com" },
    });
    fireEvent.change(screen.getByLabelText("รหัสผ่าน"), {
      target: { value: "Password1" },
    });
    await submitValidLogin();

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "บัญชีของคุณถูกระงับการใช้งานถาวร",
      );
    });
    expect(replace).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("shows the suspension end date and time for a temporarily banned user", async () => {
    signInEmail.mockRejectedValue(
      new HttpError("Sign in failed", 403, "BANNED_USER", undefined, {
      banExpires: "2026-11-18T00:00:00.000Z",
    }),
    );
    await renderPage();

    fireEvent.change(screen.getByLabelText("อีเมล"), {
      target: { value: "student@example.com" },
    });
    fireEvent.change(screen.getByLabelText("รหัสผ่าน"), {
      target: { value: "Password1" },
    });
    await submitValidLogin();

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "บัญชีของคุณถูกระงับการใช้งาน คุณจะสามารถกลับมาใช้งานได้อีกครั้งในวันที่ 18 พฤศจิกายน 2569 เวลา 07:00 น.",
      );
    });
    expect(replace).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("shows a network toast when sign-in fails unexpectedly", async () => {
    signInEmail.mockRejectedValue(new HttpError("Network unavailable"));
    await renderPage();

    fireEvent.change(screen.getByRole("textbox", { name: "อีเมล" }), {
      target: { value: "student@example.com" },
    });
    fireEvent.change(screen.getByLabelText("รหัสผ่าน"), {
      target: { value: "Password1" },
    });
    await submitValidLogin();

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง");
    });
    expect(replace).not.toHaveBeenCalled();
  });
});
