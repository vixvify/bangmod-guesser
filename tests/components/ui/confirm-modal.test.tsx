// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfirmModal } from "@/components/ui/confirm-modal";

afterEach(cleanup);

describe("ConfirmModal", () => {
  it("uses a light dialog surface with readable actions", () => {
    render(
      <ConfirmModal
        open
        title="ยืนยันการออกจากระบบ"
        description="คุณต้องการออกจากระบบใช่หรือไม่?"
        confirmLabel="ยืนยัน"
        cancelLabel="ยกเลิก"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "ยืนยันการออกจากระบบ" });
    expect(getComputedStyle(dialog).backgroundColor).toBe("rgb(255, 255, 255)");
    expect(screen.getByRole("button", { name: "ยกเลิก" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "ยืนยัน" })).toBeTruthy();
  });
});
