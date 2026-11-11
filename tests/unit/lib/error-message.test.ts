import { describe, expect, it, vi } from "vitest";
import { getErrorMessage } from "@/shared/lib/error-message";
import { HttpError } from "@/shared/lib/http";

vi.mock("client-only", () => ({}));
describe("user-facing HTTP errors", () => {
  it.each([
    [400, "ข้อมูลที่ส่งไม่ถูกต้อง"],
    [401, "ยืนยันตัวตน"],
    [403, "ไม่มีสิทธิ์"],
    [404, "ไม่พบข้อมูล"],
    [409, "สถานะไม่ตรง"],
    [413, "ขนาดใหญ่เกินไป"],
    [429, "ส่งคำขอบ่อยเกินไป"],
    [500, "เซิร์ฟเวอร์เกิดข้อผิดพลาด"],
    [503, "บริการไม่พร้อมใช้งาน"],
  ])("explains HTTP %s without exposing server details", (status, message) => {
    const displayed = getErrorMessage(new HttpError("internal details", status), "fallback");
    expect(displayed).toContain(message);
    expect(displayed).not.toContain("internal details");
  });

  it("shows Retry-After when available", () => {
    expect(getErrorMessage(new HttpError("limited", 429, undefined, 25), "fallback")).toContain("25 วินาที");
  });

  it("distinguishes network failures and uses the fallback for unknown errors", () => {
    expect(getErrorMessage(new HttpError("network"), "fallback")).toContain("ไม่สามารถเชื่อมต่อ");
    expect(getErrorMessage(new Error("private detail"), "fallback")).toBe("fallback");
  });

  it("keeps an explicitly supplied message for a known status", () => {
    expect(getErrorMessage(new HttpError("private", 401), "fallback", { 401: "ข้อมูลเข้าสู่ระบบไม่ถูกต้อง" }))
      .toBe("ข้อมูลเข้าสู่ระบบไม่ถูกต้อง");
  });
});
