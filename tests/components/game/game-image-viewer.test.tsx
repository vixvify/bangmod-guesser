// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill, priority, ...rest }: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} data-fill={fill} data-priority={priority} />;
  },
}));

vi.mock("@/components/game/game-map", () => ({
  GameMap: () => <div data-testid="game-map">Map</div>,
}));

vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: () => {
    const MockedComponent = () => (
      <div data-testid="game-map">Map</div>
    );
    MockedComponent.displayName = "DynamicGameMap";
    return MockedComponent;
  },
}));

import { GameImageViewer } from "@/components/game/game-image-viewer";

const defaultProps = {
  imageSrc: "/images/kmutt-bangmod-1.jpg",
  imageAlt: "ทดสอบ",
  markerPosition: null,
  onMapClick: vi.fn(),
};

describe("GameImageViewer", () => {
  afterEach(cleanup);

  it("renders the location image as the main view by default", () => {
    render(<GameImageViewer {...defaultProps} />);

    const img = screen.getByAltText("ทดสอบ");
    expect(img).toBeTruthy();
    expect(img.getAttribute("src")).toContain("kmutt-bangmod");
  });

  it("renders the mini map in the bottom-right corner", () => {
    render(<GameImageViewer {...defaultProps} />);

    expect(screen.getByTestId("game-map")).toBeTruthy();
  });

  it("renders the fullscreen button when image is the main content", () => {
    render(<GameImageViewer {...defaultProps} />);

    expect(screen.getByRole("button", { name: "เต็มจอ" })).toBeTruthy();
  });

  it("renders the swap button on the mini view", () => {
    render(<GameImageViewer {...defaultProps} />);

    expect(screen.getByRole("button", { name: "สลับตำแหน่ง" })).toBeTruthy();
  });

  it("opens the fullscreen dialog when the fullscreen button is clicked", () => {
    render(<GameImageViewer {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "เต็มจอ" }));

    expect(screen.getByRole("button", { name: "ออกจากเต็มจอ" })).toBeTruthy();
  });

  it("closes the fullscreen dialog when the exit button is clicked", async () => {
    render(<GameImageViewer {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "เต็มจอ" }));
    fireEvent.click(screen.getByRole("button", { name: "ออกจากเต็มจอ" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: "ออกจากเต็มจอ" }),
      ).toBeNull();
    });
  });

  it("fullscreen dialog shows only the image without map", () => {
    render(<GameImageViewer {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "เต็มจอ" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(dialog.querySelector("[data-testid='game-map']")).toBeNull();
  });

  it("renders the submit button under the map when onSubmit is provided", () => {
    const handleSubmit = vi.fn();
    render(<GameImageViewer {...defaultProps} onSubmit={handleSubmit} />);

    expect(screen.getByRole("button", { name: "ส่งคำตอบ" })).toBeTruthy();
  });

  it("disables the submit button when isSubmitDisabled is true", () => {
    const handleSubmit = vi.fn();
    render(
      <GameImageViewer
        {...defaultProps}
        onSubmit={handleSubmit}
        isSubmitDisabled={true}
      />,
    );

    const submitBtn = screen.getByRole("button", { name: "ส่งคำตอบ" });
    expect(submitBtn.hasAttribute("disabled")).toBe(true);
  });

  it("calls onSubmit when the submit button is clicked", () => {
    const handleSubmit = vi.fn();
    render(
      <GameImageViewer
        {...defaultProps}
        onSubmit={handleSubmit}
        isSubmitDisabled={false}
      />,
    );

    const submitBtn = screen.getByRole("button", { name: "ส่งคำตอบ" });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
