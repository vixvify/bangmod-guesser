// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileHistory } from "@/features/profile/components/profile-history";
import type { ProfileResult } from "@/features/profile/domain/profile";
import httpClient from "@/shared/lib/http";

vi.mock("@/shared/lib/http", () => ({ default: { get: vi.fn() } }));
vi.mock("@/features/profile/routes/profile.routes", () => ({ ProfileRoutes: { history: "/api/profile" } }));
vi.mock("@/shared/components/ui/date-range-picker", () => ({
  DateRangePicker: ({ onChange, defaultValue }: { onChange: (range: { startDate: string | null; endDate: string | null }) => void; defaultValue: { startDate: string | null; endDate: string | null } }) => (
    <div>
      <span data-testid="selected-range">{defaultValue.startDate ?? "ทั้งหมด"}</span>
      <button onClick={() => onChange({ startDate: "2026-10-01", endDate: null })}>เลือกวันเริ่ม</button>
      <button onClick={() => onChange({ startDate: "2026-10-01", endDate: "2026-10-31" })}>เลือกช่วงวันที่</button>
    </div>
  ),
}));

const initialProfile: ProfileResult = {
  id: "user-1",
  name: "Player",
  email: "player@example.com",
  games: [{ id: "first-game", status: "COMPLETED", totalScore: 100, grade: "D", playedAt: "2026-10-20T10:00:00.000Z" }],
  pagination: { page: 1, pageSize: 4, totalGames: 5, totalPages: 2 },
};

beforeEach(() => {
  vi.mocked(httpClient.get).mockReset();
  window.history.replaceState(null, "", "/profile");
});
afterEach(cleanup);

describe("ProfileHistory", () => {
  it("renders the server result without another request", () => {
    render(<ProfileHistory initialProfile={initialProfile} initialQuery={{ page: 1 }} />);

    expect(screen.getByText("#first-game")).toBeTruthy();
    expect(httpClient.get).not.toHaveBeenCalled();
  });

  it("loads a completed date range from the profile API and resets pagination", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: { ...initialProfile, games: [{ ...initialProfile.games[0], id: "filtered-game" }], pagination: { ...initialProfile.pagination, totalGames: 1, totalPages: 1 } },
      status: 200,
      statusCode: "SUCCESS",
    });
    render(<ProfileHistory initialProfile={initialProfile} initialQuery={{ page: 1 }} />);

    fireEvent.click(screen.getByRole("button", { name: "เลือกวันเริ่ม" }));
    expect(httpClient.get).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "เลือกช่วงวันที่" }));

    await waitFor(() => expect(screen.getByText("#filtered-game")).toBeTruthy());
    expect(httpClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/profile?page=1&from=2026-10-01&to=2026-10-31"),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(window.location.search).toBe("?page=1&from=2026-10-01&to=2026-10-31");
    expect(screen.queryByText("#first-game")).toBeNull();
  });

  it("loads the selected page and allows retry after a request fails", async () => {
    vi.mocked(httpClient.get)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        data: { ...initialProfile, games: [{ ...initialProfile.games[0], id: "second-page-game" }], pagination: { ...initialProfile.pagination, page: 2 } },
        status: 200,
        statusCode: "SUCCESS",
      });
    render(<ProfileHistory initialProfile={initialProfile} initialQuery={{ page: 1 }} />);

    fireEvent.click(screen.getByRole("button", { name: /หน้า 2/ }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("โหลดประวัติการเล่นไม่สำเร็จ"));
    fireEvent.click(screen.getByRole("button", { name: "ลองอีกครั้ง" }));

    await waitFor(() => expect(screen.getByText("#second-page-game")).toBeTruthy());
    expect(httpClient.get).toHaveBeenCalledTimes(2);
    expect(httpClient.get).toHaveBeenLastCalledWith(
      expect.stringContaining("/profile?page=2"),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(window.location.search).toBe("?page=2");
  });

  it("clears an applied date filter and returns to the first page", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: initialProfile,
      status: 200,
      statusCode: "SUCCESS",
    });
    render(<ProfileHistory
      initialProfile={initialProfile}
      initialQuery={{ from: "2026-10-01", to: "2026-10-31", page: 2 }}
    />);

    expect(screen.getByTestId("selected-range").textContent).toBe("2026-10-01");
    fireEvent.click(screen.getByRole("button", { name: "ล้างตัวกรอง" }));

    await waitFor(() => expect(screen.getByTestId("selected-range").textContent).toBe("ทั้งหมด"));
    expect(httpClient.get).toHaveBeenCalledWith(
      expect.stringMatching(/\/profile\?page=1$/),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});
