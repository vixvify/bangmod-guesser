// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill, priority, ...rest }: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} data-fill={fill} data-priority={priority} />;
  },
}));

vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: () => {
    const MockedComponent = ({
      onMapClick,
    }: {
      onMapClick?: (lat: number, lng: number) => void;
    }) => (
      <button
        data-testid="mock-map"
        onClick={() => onMapClick?.(13.6513, 100.4943)}
      >
        Click Map
      </button>
    );
    MockedComponent.displayName = "DynamicGameMap";
    return MockedComponent;
  },
}));

import GamePage from "@/app/game/page";
import { AppRoutes } from "@/routes/app/routes";

describe("GamePage", () => {
  afterEach(() => {
    cleanup();
    push.mockReset();
  });

  it("renders the game screen with timer, image viewer, and submit button", () => {
    render(<GamePage />);

    expect(screen.getByText("ข้อที่")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByRole("timer")).toBeTruthy();
    expect(screen.getByRole("button", { name: "ส่งคำตอบ" })).toBeTruthy();
  });

  it("disables the submit button before any map marker is placed", () => {
    render(<GamePage />);

    const submitBtn = screen.getByRole("button", { name: "ส่งคำตอบ" });
    expect(submitBtn.hasAttribute("disabled")).toBe(true);
  });

  it("enables the submit button after clicking on the map and navigates home on submit", () => {
    render(<GamePage />);

    const submitBtn = screen.getByRole("button", { name: "ส่งคำตอบ" });
    expect(submitBtn.hasAttribute("disabled")).toBe(true);

    const mapButton = screen.getByTestId("mock-map");
    fireEvent.click(mapButton);

    expect(submitBtn.hasAttribute("disabled")).toBe(false);

    fireEvent.click(submitBtn);
    expect(push).toHaveBeenCalledWith(AppRoutes.home);
  });
});
