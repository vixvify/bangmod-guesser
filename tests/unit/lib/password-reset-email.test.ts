import { describe, expect, it } from "vitest";
import { createPasswordResetEmail } from "@/features/auth/server/email-templates/password-reset-email";

describe("Password reset email template", () => {
  const url = "http://localhost:3000/reset-password/token123";

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
    const unsafeUrl = 'https://example.com/reset?value=<script>&name="test"';
    const email = createPasswordResetEmail(unsafeUrl);

    expect(email.html).toContain(
      'href="https://example.com/reset?value=&lt;script&gt;&amp;name=&quot;test&quot;"',
    );
    expect(email.html).not.toContain("<script>");
    expect(email.text).toContain(unsafeUrl);
  });
});
