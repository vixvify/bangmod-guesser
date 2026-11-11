import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createPasswordResetEmail } from "@/features/auth/server/email-templates/password-reset-email";
import { escapeHtml, validateResetUrl } from "@/features/auth/server/validate-url";

describe("Password reset email template", () => {
  const url = "http://localhost:3000/api/auth/reset-password/token123?callbackURL=http%3A%2F%2Flocalhost%3A3000%2Freset-password";

  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("PASSWORD_RESET_TRUSTED_ORIGIN", "http://localhost:3000");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates the correct email subject and plain text content", () => {
    const email = createPasswordResetEmail(url);

    expect(email.subject).toBe("เปลี่ยนรหัสผ่าน | Bangmod Guesser");
    expect(email.text).toContain("สวัสดี!");
    expect(email.text).toContain("เราได้รับคำขอเปลี่ยนรหัสผ่านสำหรับบัญชี Bangmod Guesser ของคุณ");
    expect(email.text).toContain(url);
    expect(email.text).toContain("ลิงก์นี้มีอายุ 15 นาที");
    expect(email.text).toContain("หากคุณไม่ได้ส่งคำขอเปลี่ยนรหัสผ่าน สามารถละเว้นอีเมลฉบับนี้ได้");
  });

  it("creates HTML content with the password reset link", () => {
    const email = createPasswordResetEmail(url);

    expect(email.html).toContain('<html lang="th">');
    expect(email.html).toContain("Bangmod Guesser");
    expect(email.html).toContain("เปลี่ยนรหัสผ่าน");
    expect(email.html).toContain(`href="${url}"`);
    expect(email.html).toContain("ลิงก์นี้มีอายุ 15 นาที");
    expect(email.html).toContain("หากคุณไม่ได้ส่งคำขอเปลี่ยนรหัสผ่าน สามารถละเว้นอีเมลฉบับนี้ได้");
  });

  it("escapes special characters in the HTML reset link", () => {
    const unsafeValue = '<script>alert("test")</script>&';
    const escapedValue = escapeHtml(unsafeValue);

    expect(escapedValue).toBe("&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;&amp;");
    expect(escapedValue).not.toContain("<script>");
  });

  it("escapes special characters in the generated HTML reset link", () => {
    const urlWithExtraQuery = `${url}&extra=test`;
    const email = createPasswordResetEmail(urlWithExtraQuery);

    expect(email.html).toContain("&amp;extra=test");
    expect(email.text).toContain("&extra=test");
  });

  it("accepts a valid password reset URL", () => {
    expect(validateResetUrl(url).toString()).toBe(url);
  });

  it("rejects an invalid password reset URL", () => {
    expect(() => validateResetUrl("not-a-valid-url")).toThrow("Invalid password reset URL");
  });

  it("rejects a password reset URL from an untrusted origin", () => {
    const unsafeUrl = "https://example.com/api/auth/reset-password/token123?callbackURL=https%3A%2F%2Fexample.com%2Freset-password";

    expect(() => validateResetUrl(unsafeUrl)).toThrow("Untrusted password reset URL");
  });

  it("rejects a password reset URL with an invalid path", () => {
    const invalidUrl = "http://localhost:3000/invalid-path/token123?callbackURL=http%3A%2F%2Flocalhost%3A3000%2Freset-password";

    expect(() => validateResetUrl(invalidUrl)).toThrow("Invalid password reset path");
  });

  it("rejects a password reset URL without a token", () => {
    const invalidUrl = "http://localhost:3000/api/auth/reset-password/?callbackURL=http%3A%2F%2Flocalhost%3A3000%2Freset-password";

    expect(() => validateResetUrl(invalidUrl)).toThrow("Password reset token is missing or invalid");
  });

  it("rejects a password reset URL without a callback URL", () => {
    const invalidUrl = "http://localhost:3000/api/auth/reset-password/token123";

    expect(() => validateResetUrl(invalidUrl)).toThrow("Password reset callback URL is missing");
  });

  it("rejects a password reset token containing an encoded forward slash", () => {
    const invalidUrl = "http://localhost:3000/api/auth/reset-password/token%2F123?callbackURL=http%3A%2F%2Flocalhost%3A3000%2Freset-password";

    expect(() => validateResetUrl(invalidUrl)).toThrow("Password reset token is invalid");
  });

  it("rejects a password reset token containing an encoded backslash", () => {
    const invalidUrl = "http://localhost:3000/api/auth/reset-password/token%5C123?callbackURL=http%3A%2F%2Flocalhost%3A3000%2Freset-password";

    expect(() => validateResetUrl(invalidUrl)).toThrow("Password reset token is invalid");
  });

  it("rejects a callback URL from an untrusted origin", () => {
    const invalidUrl = "http://localhost:3000/api/auth/reset-password/token123?callbackURL=https%3A%2F%2Fexample.com%2Freset-password";

    expect(() => validateResetUrl(invalidUrl)).toThrow("Untrusted password reset callback URL");
  });

  it("rejects a callback URL with an invalid path", () => {
    const invalidUrl = "http://localhost:3000/api/auth/reset-password/token123?callbackURL=http%3A%2F%2Flocalhost%3A3000%2Fother-page";

    expect(() => validateResetUrl(invalidUrl)).toThrow("Untrusted password reset callback URL");
  });

  it("rejects a password reset URL containing a username", () => {
    const invalidUrl = "http://user@localhost:3000/api/auth/reset-password/token123?callbackURL=http%3A%2F%2Flocalhost%3A3000%2Freset-password";

    expect(() => validateResetUrl(invalidUrl)).toThrow("Untrusted password reset URL");
  });

  it("rejects a password reset URL containing a password", () => {
    const invalidUrl = "http://user:password@localhost:3000/api/auth/reset-password/token123?callbackURL=http%3A%2F%2Flocalhost%3A3000%2Freset-password";

    expect(() => validateResetUrl(invalidUrl)).toThrow("Untrusted password reset URL");
  });

  it("rejects a callback URL containing a username", () => {
    const invalidUrl = "http://localhost:3000/api/auth/reset-password/token123?callbackURL=http%3A%2F%2Fuser%40localhost%3A3000%2Freset-password";

    expect(() => validateResetUrl(invalidUrl)).toThrow("Untrusted password reset callback URL");
  });

  it("rejects a callback URL containing a password", () => {
    const invalidUrl = "http://localhost:3000/api/auth/reset-password/token123?callbackURL=http%3A%2F%2Fuser%3Apassword%40localhost%3A3000%2Freset-password";

    expect(() => validateResetUrl(invalidUrl)).toThrow("Untrusted password reset callback URL");
  });
});
