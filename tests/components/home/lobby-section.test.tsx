import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LobbySection } from "@/components/home/lobby-section";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("LobbySection", () => {
  it("renders the lobby hero section with title, emblem, play button, and scroll anchor", () => {
    const markup = renderToStaticMarkup(<LobbySection />);

    expect(markup).toContain('aria-label="Bangmod Guesser lobby"');
    expect(markup).toContain("Bangmod");
    expect(markup).toContain("Guesser");
    expect(markup).toContain("Your campus. Your playground.");
    expect(markup).toContain("เดินผ่านทุกวัน… แล้วจำได้แค่ไหน?");
    expect(markup).toContain('href="#introduction"');
    expect(markup).toContain("เลื่อนลงเพื่อทำความรู้จักเกม");
    expect(markup).toContain('aria-label="Play Bangmod Guesser"');
  });

  it("applies a peeking height class so the next section is partially visible", () => {
    const markup = renderToStaticMarkup(<LobbySection />);

    expect(markup).toContain("min-h-[90svh]");
  });
});
