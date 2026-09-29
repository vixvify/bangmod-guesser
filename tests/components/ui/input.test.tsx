// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Input } from "@/components/ui/input";

afterEach(cleanup);

describe("Input", () => {
  it("supports a compact field with an accessible label", () => {
    render(<Input id="username" label="ชื่อผู้ใช้" size="small" />);

    const input = screen.getByRole("textbox", { name: "ชื่อผู้ใช้" });
    expect(input).toBeTruthy();
    expect(screen.getByText("ชื่อผู้ใช้")).toBeTruthy();
    expect(input.closest(".MuiOutlinedInput-root")?.classList.contains("MuiInputBase-sizeSmall")).toBe(true);
  });

  it("connects its label and displays a validation error", () => {
    render(
      <Input
        id="email"
        name="email"
        label="อีเมล"
        placeholder="กรอกอีเมล"
        error="รูปแบบอีเมลไม่ถูกต้อง"
      />,
    );

    const input = screen.getByRole("textbox", { name: "อีเมล" });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("email-error");
    expect(screen.getByText("รูปแบบอีเมลไม่ถูกต้อง")).toBeTruthy();
  });

  it("keeps the input surface white when the browser autofills it", () => {
    render(<Input id="email" label="อีเมล" autoComplete="email" />);

    const css = Array.from(document.styleSheets)
      .flatMap((sheet) => Array.from(sheet.cssRules, (rule) => rule.cssText))
      .join(" ");

    expect(css).toContain(":-webkit-autofill");
    expect(css).toContain("0 0 0 100rem #fff inset");
  });

  it("shows and hides a password without submitting the form", () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Input id="password" label="รหัสผ่าน" type="password" defaultValue="Password123" />
      </form>,
    );

    const password = screen.getByLabelText("รหัสผ่าน") as HTMLInputElement;
    expect(password.type).toBe("password");

    fireEvent.click(screen.getByRole("button", { name: "แสดงรหัสผ่าน" }));
    expect(password.type).toBe("text");
    expect(password.value).toBe("Password123");
    expect(screen.getByRole("button", { name: "ซ่อนรหัสผ่าน" }).getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "ซ่อนรหัสผ่าน" }));
    expect(password.type).toBe("password");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("controls password and confirmation visibility independently", () => {
    render(
      <>
        <Input id="password" label="รหัสผ่าน" type="password" />
        <Input id="confirm-password" label="ยืนยันรหัสผ่าน" type="password" />
      </>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "แสดงรหัสผ่าน" })[0]);

    expect((screen.getByLabelText("รหัสผ่าน") as HTMLInputElement).type).toBe("text");
    expect((screen.getByLabelText("ยืนยันรหัสผ่าน") as HTMLInputElement).type).toBe("password");
  });
});
