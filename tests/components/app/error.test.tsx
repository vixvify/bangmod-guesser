// @vitest-environment jsdom

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorPage from "@/app/error";

describe("ErrorPage", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows a safe recovery message without exposing the internal error", () => {
    const error = new Error("Database connection details");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { getByRole, queryByText } = render(
      <ErrorPage error={error} retry={vi.fn()} />,
    );

    expect(
      getByRole("heading", { name: "ระบบไม่พร้อมใช้งานชั่วคราว" }),
    ).toBeTruthy();
    expect(queryByText("Database connection details")).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(error);
  });

  it("retries the failed route when the user selects try again", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const retry = vi.fn();
    const { getByRole } = render(
      <ErrorPage error={new Error("Temporary failure")} retry={retry} />,
    );

    fireEvent.click(getByRole("button", { name: "ลองใหม่" }));

    expect(retry).toHaveBeenCalledOnce();
    expect(getByRole("link", { name: "กลับหน้าหลัก" }).getAttribute("href")).toBe(
      "/",
    );
  });
});
